# 🗄 ChatSphere — Data Models (MongoDB Schemas)

> All models use **Mongoose** as the ODM. Designed for MVP with extensibility in mind.
>
> **Identity Strategy:**
> - **Primary Identity:** Email (unique, required, used for auth and discovery)
> - **Optional Field:** Phone number (stored but not verified in MVP)
> - **Phase 2+:** Phone verification can be layered on once there is traction or a monetization need

---

## 📋 Table of Contents

1. [User](#1-user)
2. [Chat](#2-chat)
3. [Message](#3-message)
4. [Media](#4-media)
5. [Indexes Summary](#5-indexes-summary)
6. [Relationships — Full Detail](#6-relationships--full-detail)
7. [Constraints — Full Detail](#7-constraints--full-detail)
8. [Relationships Diagram](#8-relationships-diagram)

---

## 1. User

Stores all registered user accounts, profile info, and presence data.
Email is the **primary identity** — unique, required, verified on registration, and used for login and user discovery.

### Collection: `users`

```ts
{
  _id: ObjectId,                        // Auto-generated MongoDB ID

  // Primary Identity
  email: String,                        // Unique, required, lowercase — primary identifier
  password: String,                     // bcrypt hashed, never returned to client

  // Optional Contact (not verified in MVP)
  phone: String | null,                 // Optional, e.g. "+923001234567" (E.164 format)
                                        // Stored but NOT verified in MVP
                                        // Phase 2+: add OTP verification when needed

  // Profile
  name: String,                         // Display name, required
  avatar: String,                       // Cloudinary URL, optional
  statusMessage: String,                // e.g. "Hey there! I'm using ChatSphere"

  // Presence
  isOnline: Boolean,                    // Default: false
  lastSeen: Date,                       // Updated on disconnect

  // Timestamps
  createdAt: Date,                      // Auto (Mongoose timestamps)
  updatedAt: Date,                      // Auto (Mongoose timestamps)
}
```

### Mongoose Schema

```ts
const UserSchema = new Schema(
  {
    // Primary identity
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },   // never returned to client

    // Optional contact — not verified in MVP
    phone:    { type: String, default: null, trim: true },       // E.164 format when provided

    // Profile
    name:          { type: String, required: true, trim: true },
    avatar:        { type: String, default: null },
    statusMessage: { type: String, default: "Hey there! I'm using ChatSphere", maxlength: 100 },

    // Presence
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
```

### Indexes

```ts
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: "text" });    // Search users by name in chat
```

### Phone Number — Design Note

The `phone` field is intentionally kept simple in MVP:

| Phase | Phone behaviour |
|---|---|
| **MVP** | Optional, stored as plain string, not unique, not verified |
| **Phase 2** | Add uniqueness constraint + OTP verification flow when needed |
| **Phase 3** | Bind phone as a second login factor or account recovery method |

This avoids SMS provider costs, OTP infrastructure, and rate-limiting complexity until there is a real reason to add them.

---

## 2. Chat

Represents a conversation — either 1-to-1 (direct) or group. A single document holds all metadata about the conversation.

### Collection: `chats`

```ts
{
  _id: ObjectId,                        // Chat ID

  // Type
  isGroup: Boolean,                     // false = direct message, true = group chat

  // Participants
  participants: [ObjectId],             // Array of User._id refs (2 for DM, 2+ for group)

  // Group-only fields (null for DMs)
  name: String | null,                  // Group name
  icon: String | null,                  // Group icon Cloudinary URL
  admin: ObjectId | null,               // User._id of group creator/admin

  // Last message preview (denormalized for sidebar performance)
  lastMessage: {
    content: String,                    // Text preview or "[Image]", "[File]" etc.
    senderId: ObjectId,
    sentAt: Date,
  } | null,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
}
```

### Mongoose Schema

```ts
const ChatSchema = new Schema(
  {
    isGroup:      { type: Boolean, default: false },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    name:         { type: String, default: null, trim: true },
    icon:         { type: String, default: null },
    admin:        { type: Schema.Types.ObjectId, ref: "User", default: null },
    lastMessage: {
      content:  { type: String, default: null },
      senderId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      sentAt:   { type: Date, default: null },
    },
  },
  { timestamps: true }
);
```

### Indexes

```ts
ChatSchema.index({ participants: 1 });   // Find all chats for a user
ChatSchema.index({ updatedAt: -1 });     // Sort sidebar by most recent
```

### Notes

- For **DMs**, before creating a new chat, query `{ isGroup: false, participants: { $all: [userA, userB], $size: 2 } }` to avoid duplicate conversations.
- `lastMessage` is a **denormalized snapshot** updated every time a new message is saved — avoids expensive aggregation for the chat sidebar.
- Users are found by **email or name search** when starting a new DM.

---

## 3. Message

Stores every individual message. The heaviest collection — proper indexing is critical.

### Collection: `messages`

```ts
{
  _id: ObjectId,                        // Message ID

  // Relations
  chatId: ObjectId,                     // Chat._id this message belongs to
  senderId: ObjectId,                   // User._id who sent it

  // Content
  type: String,                         // "text" | "image" | "video" | "file"
  content: String,                      // Text body (empty string for media-only messages)
  media: ObjectId | null,               // Media._id ref (populated if type != "text")

  // Delivery Status
  status: {
    sent: Boolean,                      // Always true once saved
    deliveredTo: [ObjectId],            // User._ids who received it
    readBy: [ObjectId],                 // User._ids who opened/read it
  },

  // Optional: reply threading (Phase 2)
  replyTo: ObjectId | null,             // Message._id being replied to

  // Soft delete
  deletedFor: [ObjectId],               // User._ids who deleted this message for themselves

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
}
```

### Mongoose Schema

```ts
const MessageSchema = new Schema(
  {
    chatId:   { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:     { type: String, enum: ["text", "image", "video", "file"], default: "text" },
    content:  { type: String, default: "", maxlength: 4000 },
    media:    { type: Schema.Types.ObjectId, ref: "Media", default: null },
    status: {
      sent:        { type: Boolean, default: true },
      deliveredTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
      readBy:      [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    replyTo:    { type: Schema.Types.ObjectId, ref: "Message", default: null },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
```

### Indexes

```ts
MessageSchema.index({ chatId: 1, createdAt: -1 }); // Core query: paginate messages in a chat
MessageSchema.index({ senderId: 1 });               // Filter by sender if needed
```

### Query Pattern (Pagination)

```ts
// Fetch last 30 messages, cursor-based pagination
Message.find({ chatId })
  .sort({ createdAt: -1 })
  .limit(30)
  .populate("senderId", "name avatar email")
  .populate("media");
```

---

## 4. Media

Stores metadata for all uploaded files. The actual binary is hosted on Cloudinary; only the reference lives in MongoDB.

### Collection: `media`

```ts
{
  _id: ObjectId,                        // Media ID

  // Owner
  uploadedBy: ObjectId,                 // User._id who uploaded the file

  // Cloudinary info
  url: String,                          // Cloudinary delivery URL (CDN)
  publicId: String,                     // Cloudinary public_id (for deletion)
  resourceType: String,                 // "image" | "video" | "raw" (Cloudinary types)

  // File metadata
  originalName: String,                 // e.g. "invoice.pdf"
  mimeType: String,                     // e.g. "application/pdf"
  sizeBytes: Number,                    // File size in bytes

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
}
```

### Mongoose Schema

```ts
const MediaSchema = new Schema(
  {
    uploadedBy:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    url:          { type: String, required: true },
    publicId:     { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
    originalName: { type: String, default: "file" },
    mimeType:     { type: String, required: true },
    sizeBytes:    { type: Number, required: true },
  },
  { timestamps: true }
);
```

### Indexes

```ts
MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ createdAt: -1 });
```

---

## 5. Indexes Summary

| Collection | Index | Purpose |
|---|---|---|
| `users` | `email` (unique) | Login & user lookup |
| `users` | `name` (text) | Search users by name in chat |
| `chats` | `participants` | Fetch user's chats |
| `chats` | `updatedAt DESC` | Sort sidebar by recency |
| `messages` | `chatId + createdAt DESC` | Paginate messages in a chat |
| `messages` | `senderId` | Filter messages by sender |
| `media` | `uploadedBy` | List user's uploaded files |
| `media` | `createdAt DESC` | Recently uploaded media |

---

## 6. Relationships — Full Detail

MongoDB doesn't enforce foreign keys natively — relationships are implemented via `ObjectId` references and validated at the application layer via Mongoose. Below is the complete map of every relationship across all 4 collections.

---

### 6.1 User ↔ Chat (Many-to-Many)

**How:** `Chat.participants[]` stores an array of `User._id` values. A user can be in many chats; a chat can have many users.

**Fields involved:**
- `Chat.participants[]` → references `User._id`
- `Chat.admin` → references `User._id` (group chats only)
- `Chat.lastMessage.senderId` → references `User._id` (denormalized snapshot)

**Cardinality:** Many-to-Many

**Implementation detail:** There is no separate join table. The `participants` array on the Chat document serves as the junction. To find all chats for a user:

```ts
Chat.find({ participants: userId }).sort({ updatedAt: -1 });
```

To find the shared DM chat between two users:

```ts
Chat.findOne({
  isGroup: false,
  participants: { $all: [userAId, userBId], $size: 2 }
});
```

To find a user to start a DM (by email or name):

```ts
User.findOne({ email: "user@example.com" });
// or
User.find({ $text: { $search: "Alice" } });
```

---

### 6.2 Chat → Message (One-to-Many)

**How:** Every `Message` document stores a `chatId` field pointing to its parent `Chat._id`.

**Fields involved:**
- `Message.chatId` → references `Chat._id`

**Cardinality:** One Chat → Many Messages

**Notes:** Messages are never embedded inside the Chat document to avoid hitting MongoDB's 16MB document size limit. All message queries filter by `chatId` with `createdAt` sorting for pagination.

```ts
Message.find({ chatId }).sort({ createdAt: -1 }).limit(30);
```

---

### 6.3 User → Message (One-to-Many, as Sender)

**How:** Every `Message` stores a `senderId` pointing to the `User._id` of the author.

**Fields involved:**
- `Message.senderId` → references `User._id`

**Cardinality:** One User → Many Messages (as sender)

**Notes:** This is a required field — every message must have a sender. When populating for the chat UI:

```ts
Message.find({ chatId }).populate("senderId", "name avatar email");
```

---

### 6.4 User → Message (Many-to-Many, via Status)

**How:** `Message.status.deliveredTo[]` and `Message.status.readBy[]` are both arrays of `User._id` references. Multiple users can have "delivered" or "read" status on a single message (relevant in group chats).

**Fields involved:**
- `Message.status.deliveredTo[]` → references `User._id`
- `Message.status.readBy[]` → references `User._id`
- `Message.deletedFor[]` → references `User._id`

**Cardinality:** Many Users ↔ Many Messages (via embedded arrays)

**Notes:** For a DM, these arrays will have at most 1 entry each (the other participant). For a group chat of N members, they can have up to N-1 entries.

---

### 6.5 Message → Media (One-to-One, Optional)

**How:** A `Message` optionally holds a `media` field pointing to a `Media._id`. Only messages of type `image`, `video`, or `file` have this populated.

**Fields involved:**
- `Message.media` → references `Media._id` (nullable)

**Cardinality:** One Message → Zero or One Media

**Notes:** A `text` type message will always have `media: null`. A media message may have an empty `content` string or a caption.

```ts
Message.findById(id).populate("media");
```

---

### 6.6 User → Media (One-to-Many, as Uploader)

**How:** Every `Media` document records who uploaded it via `uploadedBy` pointing to `User._id`.

**Fields involved:**
- `Media.uploadedBy` → references `User._id`

**Cardinality:** One User → Many Media files

---

### 6.7 Message → Message (Self-referential, Optional — Phase 2 ready)

**How:** `Message.replyTo` optionally references another `Message._id` in the same collection. This supports threaded replies.

**Fields involved:**
- `Message.replyTo` → references `Message._id` (nullable)

**Cardinality:** One Message → Zero or One parent Message

**Notes:** Stored in the schema but `null` by default in MVP. Will be populated when reply-to feature is activated in Phase 2.

---

### 6.8 Relationships Summary Table

| From | Field | To | Type | Required |
|---|---|---|---|---|
| `Chat` | `participants[]` | `User._id` | Many-to-Many | Yes (min 2) |
| `Chat` | `admin` | `User._id` | Many-to-One | Only for groups |
| `Chat` | `lastMessage.senderId` | `User._id` | Many-to-One | No (denormalized) |
| `Message` | `chatId` | `Chat._id` | Many-to-One | Yes |
| `Message` | `senderId` | `User._id` | Many-to-One | Yes |
| `Message` | `status.deliveredTo[]` | `User._id` | Many-to-Many | No |
| `Message` | `status.readBy[]` | `User._id` | Many-to-Many | No |
| `Message` | `deletedFor[]` | `User._id` | Many-to-Many | No |
| `Message` | `media` | `Media._id` | One-to-One | No (nullable) |
| `Message` | `replyTo` | `Message._id` | Self-ref | No (nullable) |
| `Media` | `uploadedBy` | `User._id` | Many-to-One | Yes |

---

## 7. Constraints — Full Detail

MongoDB does not enforce constraints at the database level the way SQL does. All constraints listed below are enforced at the **application layer** via Mongoose schema definitions, middleware hooks, and API-level validation using Zod.

---

### 7.1 User Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `email` | Required | Mongoose `required: true` |
| `email` | Must be unique across all users | Mongoose `unique: true` + DB index |
| `email` | Stored in lowercase | Mongoose `lowercase: true` |
| `email` | Whitespace stripped | Mongoose `trim: true` |
| `email` | Must be valid email format | Zod `.email()` in API route |
| `password` | Required on creation | Mongoose `required: true` |
| `password` | Minimum 8 characters | Zod `.min(8)` in API route |
| `password` | Never returned in queries | Mongoose `select: false` |
| `password` | Must be bcrypt hashed before save | Pre-save Mongoose middleware hook |
| `phone` | Optional — no uniqueness constraint in MVP | No unique index on `phone` |
| `phone` | If provided, must be valid E.164 format | Zod `.regex(/^\+[1-9]\d{7,14}$/)` — only if present |
| `phone` | Not verified in MVP | No OTP flow in MVP — stored as plain string |
| `name` | Required | Mongoose `required: true` |
| `name` | Whitespace stripped | Mongoose `trim: true` |
| `statusMessage` | Max 100 characters | Mongoose `maxlength: 100` |
| `isOnline` | Default `false` | Mongoose `default: false` |
| `lastSeen` | Default to current time | Mongoose `default: Date.now` |

---

### 7.2 Chat Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `participants` | Required, must not be empty | Mongoose `required: true` |
| `participants` | Minimum 2 users for DM | API-level validation before save |
| `participants` | All entries must be valid `User._id` refs | Mongoose `ref: "User"` + API check |
| `isGroup: false` | Exactly 2 participants only | API query with `$size: 2` guard |
| `isGroup: false` | No duplicate DM chat between same two users | Pre-create query check in API |
| `isGroup: true` | `name` is required | API-level validation |
| `isGroup: true` | `admin` must be one of the `participants` | API-level validation |
| `admin` | Must reference a valid User | Mongoose `ref: "User"` |
| `lastMessage.senderId` | Must be one of the chat's participants | Application-level check on message save |

---

### 7.3 Message Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `chatId` | Required | Mongoose `required: true` |
| `chatId` | Must reference an existing Chat | Application check before save |
| `senderId` | Required | Mongoose `required: true` |
| `senderId` | Must be a participant of the referenced chat | API middleware validation |
| `type` | Must be one of `text`, `image`, `video`, `file` | Mongoose `enum` |
| `content` | Max 4,000 characters | Mongoose `maxlength: 4000` |
| `content` | Cannot be empty if `type` is `text` | Zod `.min(1)` for text messages in API |
| `media` | Required if `type` is `image`, `video`, or `file` | API-level conditional validation |
| `media` | Must be `null` if `type` is `text` | API-level conditional validation |
| `status.sent` | Always `true` once document is created | Mongoose `default: true` |
| `status.deliveredTo[]` | Entries must be participants of the chat | Application-level check |
| `status.readBy[]` | Entries must be participants of the chat | Application-level check |
| `status.readBy[]` | A user in `readBy` must also be in `deliveredTo` | Application-level ordering |
| `deletedFor[]` | Entries must be participants of the chat | Application-level check |
| `replyTo` | If set, must reference a Message in the same chat | Application-level validation |

---

### 7.4 Media Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `uploadedBy` | Required | Mongoose `required: true` |
| `uploadedBy` | Must reference a valid User | Mongoose `ref: "User"` |
| `url` | Required | Mongoose `required: true` |
| `publicId` | Required (needed for Cloudinary deletion) | Mongoose `required: true` |
| `resourceType` | Must be one of `image`, `video`, `raw` | Mongoose `enum` |
| `mimeType` | Required | Mongoose `required: true` |
| `mimeType` | Must match allowed MIME types | API upload validation before Cloudinary |
| `sizeBytes` | Required | Mongoose `required: true` |
| `sizeBytes` | Max 10MB for images, 50MB for videos | API-level size check before upload |
| File extension | Only allowed: jpg, png, gif, webp, mp4, webm, pdf | API-level MIME/extension whitelist |

---

### 7.5 Cross-Collection Integrity Rules

MongoDB has no foreign key cascade — these rules must be handled in application logic or background jobs.

| Scenario | Rule | How Handled |
|---|---|---|
| User is deleted | All their messages remain (soft orphan) | Messages kept; `senderId` ref becomes stale — handle via null-check in UI |
| User is removed from a group | Remove from `Chat.participants[]` | API removes user from array; their past messages remain |
| Chat is deleted | All associated messages must also be deleted | Cascade delete in API: `Message.deleteMany({ chatId })` |
| Media is deleted | Associated message must be updated or deleted | API removes Cloudinary asset + nullifies or deletes the Message |
| User deletes a message | Only added to `deletedFor[]` | Hard delete only if `deletedFor` contains all participants |

---

## 8. Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            USER                                 │
│   _id, email*, password, phone?, name, avatar, isOnline,        │
│   lastSeen, statusMessage                                        │
└──────┬───────────────┬──────────────────────┬───────────────────┘
       │               │                      │
       │ participants[] │ admin (group only)   │ uploadedBy
       │ (M-to-M)      │ (M-to-1)             │ (1-to-M)
       ▼               ▼                      ▼
┌─────────────────────────────────┐  ┌──────────────────────────────┐
│             CHAT                │  │            MEDIA             │
│  _id, isGroup, participants[],  │  │  _id, uploadedBy, url,       │
│  name, icon, admin, lastMessage │  │  publicId, resourceType,     │
└──────────────┬──────────────────┘  │  mimeType, sizeBytes         │
               │ chatId (1-to-M)     └──────────────┬───────────────┘
               ▼                                    │
┌─────────────────────────────────────────────────────────────────┐
│                           MESSAGE                               │
│  _id, chatId, senderId, type, content                           │
│  media ──────────────────────────────────────────► MEDIA._id   │
│  status.deliveredTo[] ───────────────────────────► USER._id[]  │
│  status.readBy[]  ───────────────────────────────► USER._id[]  │
│  deletedFor[] ───────────────────────────────────► USER._id[]  │
│  replyTo ────────────────────────────────────────► MESSAGE._id │
└─────────────────────────────────────────────────────────────────┘

*  email has a unique index — primary identity
?  phone is optional, not unique, not verified in MVP
```

---

## 🔑 Design Decisions

**Email as primary identity** — simple, free, zero infrastructure. Unique index ensures no duplicates. Used for login, registration, and user search.

**Phone as optional, unverified field in MVP** — stored as a plain string so users can optionally provide it. No uniqueness constraint, no OTP flow, no SMS costs. When the product has traction, a uniqueness constraint + OTP verification layer can be added in a single migration without restructuring any other collection.

**Password hashed with bcrypt** — `select: false` ensures the hash is never accidentally returned in any query response.

**Denormalized `lastMessage` on Chat** — avoids a separate aggregation query every time the sidebar loads. Updated atomically whenever a new message is saved.

**`deliveredTo[]` and `readBy[]` as arrays** — supports both DMs (2 users) and group chats (N users) with the same field, no schema change needed for groups.

**Media as a separate collection** — keeps the Message document lean and allows media to be managed independently (e.g., deletion from Cloudinary without touching message history).

**`deletedFor[]` instead of hard delete** — messages are soft-deleted per user, preserving the conversation for other participants (WhatsApp-style "Delete for me").

**No embedded messages in Chat** — embedding messages would cause the Chat document to grow unboundedly and hit MongoDB's 16MB limit. Messages are always a separate collection.

**No DB-level cascades** — MongoDB has no `ON DELETE CASCADE`. All referential integrity is enforced at the API layer.

---

## 🔮 Phase 2+ Phone Upgrade Path

When you're ready to make phone a verified, unique identity field, the migration path is clean:

```ts
// Step 1: Add unique sparse index (allows existing null values)
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Step 2: Add phoneVerified flag
phone:         { type: String, default: null, trim: true },
phoneVerified: { type: Boolean, default: false },          // ← add this

// Step 3: Build the OTP collection and verification flow
// Step 4: Gate phone-based features behind phoneVerified: true
```

Because `phone` is already in the schema as a plain field, no data migration is needed — only a new index and the OTP infrastructure on top.

---

*Generated for ChatSphere MVP · MongoDB + Mongoose · 4 Collections · Email-based Identity*
