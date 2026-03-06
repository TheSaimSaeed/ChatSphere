# 🗄 ChatSphere — Data Models (MongoDB Schemas)

> All models use **Mongoose** as the ODM. Designed for MVP with extensibility in mind.
>
> **Identity Strategy:**
> - **Primary Identity:** Email (unique, required, used for auth and discovery)
> - **Email Verification:** OTP-based email verification required on registration before account is activated
> - **Optional Field:** Phone number (stored but not verified in MVP)
> - **Phase 2+:** Phone verification can be layered on once there is traction or a monetization need

---

## 📋 Table of Contents

1. [User](#1-user)
2. [Chat](#2-chat)
3. [Message](#3-message)
4. [Media](#4-media)
5. [Otp](#5-otp)
6. [Indexes Summary](#6-indexes-summary)
7. [Relationships — Full Detail](#7-relationships--full-detail)
8. [Constraints — Full Detail](#8-constraints--full-detail)
9. [Relationships Diagram](#9-relationships-diagram)

---

## 1. User

Stores all registered user accounts, profile info, and presence data.
Email is the **primary identity** — unique, required, and used for login and user discovery.
A user account is **inactive** (`isVerified: false`) until the OTP sent to their email is confirmed. No JWT is issued until `isVerified` is `true`.

### Collection: `users`

```ts
{
  _id: ObjectId,                        // Auto-generated MongoDB ID

  // Primary Identity
  email: String,                        // Unique, required, lowercase — primary identifier
  password: String,                     // bcrypt hashed, never returned to client

  // Email Verification
  isVerified: Boolean,                  // false until OTP confirmed — account is inactive until true
                                        // JWT is only issued once isVerified === true
                                        // Login on unverified account triggers a fresh OTP and
                                        // redirects to /verify-email instead of /chat

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

    // Email verification — false until OTP confirmed
    isVerified: { type: Boolean, default: false },

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

### isVerified — Design Note

| Phase | Behaviour |
|---|---|
| **On registration** | User document created with `isVerified: false`. No JWT issued yet. OTP sent to email. |
| **On OTP confirmed** | `isVerified` set to `true`. JWT issued. User redirected to `/chat`. |
| **On login (unverified)** | Server detects `isVerified: false`. Fresh OTP generated and sent. User redirected to `/verify-email`. |
| **Protected routes** | Middleware checks `isVerified: true` before allowing access. Unverified users are blocked. |

### Phone Number — Design Note

The `phone` field is intentionally kept simple in MVP:

| Phase | Phone behaviour |
|---|---|
| **MVP** | Optional, stored as plain string, not unique, not verified |
| **Phase 2** | Add uniqueness constraint + OTP verification flow when needed |
| **Phase 3** | Bind phone as a second login factor or account recovery method |

The `otps` collection built for email verification is reusable for phone OTP in Phase 2 — just extend it with a `phone` target field alongside `userId`.

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

## 5. Otp

Stores short-lived one-time password codes used for email verification during registration and for re-verification on unverified login attempts.

Each document is auto-deleted by MongoDB's TTL mechanism after the `expiresAt` timestamp passes — no manual cleanup is required. Only one active OTP per user is allowed at any time; the previous one is deleted before a new one is saved.

### Collection: `otps`

```ts
{
  _id: ObjectId,                        // OTP document ID

  // Owner
  userId: ObjectId,                     // User._id this OTP belongs to

  // OTP code
  code: String,                         // 6-digit numeric string, e.g. "482910"
                                        // Generated with crypto.randomInt(100000, 999999)
                                        // Stored as a string to preserve leading zeros

  // Expiry
  expiresAt: Date,                      // Date.now() + 10 minutes
                                        // MongoDB TTL index auto-deletes this document after expiry
                                        // No manual cleanup needed

  // Timestamps
  createdAt: Date,                      // Auto (Mongoose timestamps)
}
```

### Mongoose Schema

```ts
const OtpSchema = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    code:      { type: String, required: true },          // 6-digit numeric string
    expiresAt: { type: Date, required: true },            // TTL target field
  },
  { timestamps: true }
);
```

### Indexes

```ts
// TTL index — MongoDB auto-deletes the document when Date.now() > expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Lookup index — find OTP by userId quickly on verify and resend
OtpSchema.index({ userId: 1 });
```

### OTP Lifecycle

```ts
// On POST /api/auth/register or POST /api/auth/resend-otp:
// 1. Delete any existing OTP for this user (prevent duplicates)
await Otp.deleteMany({ userId });

// 2. Generate a cryptographically secure 6-digit code
const code = String(crypto.randomInt(100000, 1000000)); // "482910"

// 3. Save with 10-minute expiry
await Otp.create({
  userId,
  code,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000),
});

// 4. Send email with the code
await sendEmail({ to: user.email, subject: "Your ChatSphere code", body: `Your code is ${code}` });
```

```ts
// On POST /api/auth/verify-email:
const otp = await Otp.findOne({ userId, code });

if (!otp) {
  // Either wrong code OR document was TTL-deleted (expired)
  return res.status(400).json({ message: "Invalid or expired code." });
}

// 5. Activate the user account
await User.findByIdAndUpdate(userId, { isVerified: true });

// 6. Delete the used OTP
await Otp.deleteOne({ _id: otp._id });

// 7. Issue JWT and set cookie
```

### Notes

- OTP codes are generated with `crypto.randomInt` from Node's built-in `crypto` module — cryptographically secure, not `Math.random()`.
- The code is stored and compared as a plain string. Do **not** hash it — it is a short-lived, low-entropy value with a 10-minute window and rate limiting, so hashing adds complexity without meaningful security gain.
- The TTL index on `expiresAt` with `expireAfterSeconds: 0` means MongoDB's background TTL thread will delete the document as soon as `Date.now() >= expiresAt`. Deletion may lag by up to 60 seconds in practice, but the application-level check on `expiresAt` in the query handles this edge case correctly.
- Rate limiting on `POST /api/auth/verify-email` (max 10 attempts per userId per 15 minutes) and `POST /api/auth/resend-otp` (max 3 resends per userId per hour) is enforced at the API layer, not the schema layer.
- The resend button in the UI is disabled for 60 seconds after each resend to prevent rapid-fire requests.

---

## 6. Indexes Summary

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
| `otps` | `userId` | Look up active OTP by user on verify and resend |
| `otps` | `expiresAt` (TTL) | Auto-delete expired OTP documents |

---

## 7. Relationships — Full Detail

MongoDB doesn't enforce foreign keys natively — relationships are implemented via `ObjectId` references and validated at the application layer via Mongoose. Below is the complete map of every relationship across all 5 collections.

---

### 7.1 User ↔ Chat (Many-to-Many)

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

### 7.2 Chat → Message (One-to-Many)

**How:** Every `Message` document stores a `chatId` field pointing to its parent `Chat._id`.

**Fields involved:**
- `Message.chatId` → references `Chat._id`

**Cardinality:** One Chat → Many Messages

**Notes:** Messages are never embedded inside the Chat document to avoid hitting MongoDB's 16MB document size limit. All message queries filter by `chatId` with `createdAt` sorting for pagination.

```ts
Message.find({ chatId }).sort({ createdAt: -1 }).limit(30);
```

---

### 7.3 User → Message (One-to-Many, as Sender)

**How:** Every `Message` stores a `senderId` pointing to the `User._id` of the author.

**Fields involved:**
- `Message.senderId` → references `User._id`

**Cardinality:** One User → Many Messages (as sender)

**Notes:** This is a required field — every message must have a sender. When populating for the chat UI:

```ts
Message.find({ chatId }).populate("senderId", "name avatar email");
```

---

### 7.4 User → Message (Many-to-Many, via Status)

**How:** `Message.status.deliveredTo[]` and `Message.status.readBy[]` are both arrays of `User._id` references. Multiple users can have "delivered" or "read" status on a single message (relevant in group chats).

**Fields involved:**
- `Message.status.deliveredTo[]` → references `User._id`
- `Message.status.readBy[]` → references `User._id`
- `Message.deletedFor[]` → references `User._id`

**Cardinality:** Many Users ↔ Many Messages (via embedded arrays)

**Notes:** For a DM, these arrays will have at most 1 entry each (the other participant). For a group chat of N members, they can have up to N-1 entries.

---

### 7.5 Message → Media (One-to-One, Optional)

**How:** A `Message` optionally holds a `media` field pointing to a `Media._id`. Only messages of type `image`, `video`, or `file` have this populated.

**Fields involved:**
- `Message.media` → references `Media._id` (nullable)

**Cardinality:** One Message → Zero or One Media

**Notes:** A `text` type message will always have `media: null`. A media message may have an empty `content` string or a caption.

```ts
Message.findById(id).populate("media");
```

---

### 7.6 User → Media (One-to-Many, as Uploader)

**How:** Every `Media` document records who uploaded it via `uploadedBy` pointing to `User._id`.

**Fields involved:**
- `Media.uploadedBy` → references `User._id`

**Cardinality:** One User → Many Media files

---

### 7.7 Message → Message (Self-referential, Optional — Phase 2 ready)

**How:** `Message.replyTo` optionally references another `Message._id` in the same collection. This supports threaded replies.

**Fields involved:**
- `Message.replyTo` → references `Message._id` (nullable)

**Cardinality:** One Message → Zero or One parent Message

**Notes:** Stored in the schema but `null` by default in MVP. Will be populated when reply-to feature is activated in Phase 2.

---

### 7.8 Otp → User (Many-to-One)

**How:** Every `Otp` document holds a `userId` field pointing to the `User._id` it was issued for. In practice, only one active OTP exists per user at any time — the previous document is deleted before a new one is created.

**Fields involved:**
- `Otp.userId` → references `User._id`

**Cardinality:** Many-to-One (logically one-to-one at any point in time due to delete-before-insert)

**Notes:** The relationship is one-directional. The `User` document holds no reference back to the `Otp`. The OTP document is a transient record — it exists only for the 10-minute verification window and is deleted either on successful verification or by the TTL index.

```ts
// Look up active OTP for a user during verification
Otp.findOne({ userId, code });

// Delete before issuing a new OTP (resend flow)
Otp.deleteMany({ userId });
```

---

### 7.9 Relationships Summary Table

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
| `Otp` | `userId` | `User._id` | Many-to-One | Yes |

---

## 8. Constraints — Full Detail

MongoDB does not enforce constraints at the database level the way SQL does. All constraints listed below are enforced at the **application layer** via Mongoose schema definitions, middleware hooks, and API-level validation using Zod.

---

### 8.1 User Constraints

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
| `isVerified` | Default `false` on creation | Mongoose `default: false` |
| `isVerified` | Must be `true` before JWT is issued | Application-level check in login and verify-email handlers |
| `isVerified` | Must be `true` to access protected routes | Next.js middleware check on all protected routes |
| `phone` | Optional — no uniqueness constraint in MVP | No unique index on `phone` |
| `phone` | If provided, must be valid E.164 format | Zod `.regex(/^\+[1-9]\d{7,14}$/)` — only if present |
| `phone` | Not verified in MVP | No OTP flow for phone in MVP — stored as plain string |
| `name` | Required | Mongoose `required: true` |
| `name` | Whitespace stripped | Mongoose `trim: true` |
| `statusMessage` | Max 100 characters | Mongoose `maxlength: 100` |
| `isOnline` | Default `false` | Mongoose `default: false` |
| `lastSeen` | Default to current time | Mongoose `default: Date.now` |

---

### 8.2 Chat Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `participants` | Required, must not be empty | Mongoose `required: true` |
| `participants` | Minimum 2 users for DM | API-level validation before save |
| `participants` | All entries must be valid `User._id` refs | Mongoose `ref: "User"` + API check |
| `participants` | All entries must have `isVerified: true` | Application-level check — unverified users cannot be added to chats |
| `isGroup: false` | Exactly 2 participants only | API query with `$size: 2` guard |
| `isGroup: false` | No duplicate DM chat between same two users | Pre-create query check in API |
| `isGroup: true` | `name` is required | API-level validation |
| `isGroup: true` | `admin` must be one of the `participants` | API-level validation |
| `admin` | Must reference a valid User | Mongoose `ref: "User"` |
| `lastMessage.senderId` | Must be one of the chat's participants | Application-level check on message save |

---

### 8.3 Message Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `chatId` | Required | Mongoose `required: true` |
| `chatId` | Must reference an existing Chat | Application check before save |
| `senderId` | Required | Mongoose `required: true` |
| `senderId` | Must be a participant of the referenced chat | API middleware validation |
| `senderId` | User must have `isVerified: true` | Enforced by JWT middleware — unverified users cannot reach message endpoints |
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

### 8.4 Media Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `uploadedBy` | Required | Mongoose `required: true` |
| `uploadedBy` | Must reference a valid User | Mongoose `ref: "User"` |
| `uploadedBy` | User must have `isVerified: true` | Enforced by JWT middleware — unverified users cannot reach upload endpoint |
| `url` | Required | Mongoose `required: true` |
| `publicId` | Required (needed for Cloudinary deletion) | Mongoose `required: true` |
| `resourceType` | Must be one of `image`, `video`, `raw` | Mongoose `enum` |
| `mimeType` | Required | Mongoose `required: true` |
| `mimeType` | Must match allowed MIME types | API upload validation before Cloudinary |
| `sizeBytes` | Required | Mongoose `required: true` |
| `sizeBytes` | Max 10MB for images, 50MB for videos | API-level size check before upload |
| File extension | Only allowed: jpg, png, gif, webp, mp4, webm, pdf | API-level MIME/extension whitelist |

---

### 8.5 OTP Constraints

| Field | Constraint | Enforcement |
|---|---|---|
| `userId` | Required | Mongoose `required: true` |
| `userId` | Must reference a valid User | Mongoose `ref: "User"` |
| `code` | Required | Mongoose `required: true` |
| `code` | Exactly 6 numeric digits | Application-level: `crypto.randomInt(100000, 1000000)` converted to string |
| `expiresAt` | Required | Mongoose `required: true` |
| `expiresAt` | Must be 10 minutes from creation time | Application-level: `new Date(Date.now() + 10 * 60 * 1000)` |
| One OTP per user | Previous OTP deleted before new one is saved | Application-level: `Otp.deleteMany({ userId })` before `Otp.create(...)` |
| Verify attempts | Rate limited to prevent brute-force guessing | API-level rate limit: max 10 attempts per userId per 15 minutes |
| Resend requests | Rate limited to prevent abuse | API-level rate limit: max 3 resends per userId per hour |
| Code comparison | Compared as plain string equality | Application-level: `otp.code === submittedCode` |
| Expiry enforcement | Application also checks `expiresAt` even if TTL lag exists | Application-level: `if (otp.expiresAt < new Date()) return 400` |

---

### 8.6 Cross-Collection Integrity Rules

MongoDB has no foreign key cascade — these rules must be handled in application logic or background jobs.

| Scenario | Rule | How Handled |
|---|---|---|
| User is deleted | All their messages remain (soft orphan) | Messages kept; `senderId` ref becomes stale — handle via null-check in UI |
| User is removed from a group | Remove from `Chat.participants[]` | API removes user from array; their past messages remain |
| Chat is deleted | All associated messages must also be deleted | Cascade delete in API: `Message.deleteMany({ chatId })` |
| Media is deleted | Associated message must be updated or deleted | API removes Cloudinary asset + nullifies or deletes the Message |
| User deletes a message | Only added to `deletedFor[]` | Hard delete only if `deletedFor` contains all participants |
| Unverified user is deleted | Their OTP document is also deleted | Cascade delete in API: `Otp.deleteMany({ userId })` |
| OTP expires | Document is auto-deleted by MongoDB TTL | No manual action needed; application also validates `expiresAt` at query time |
| User verifies successfully | OTP document is immediately deleted | `Otp.deleteOne({ _id: otp._id })` called after `User.isVerified` is set to `true` |

---

## 9. Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            USER                                 │
│   _id, email*, password, isVerified†, phone?, name, avatar,     │
│   isOnline, lastSeen, statusMessage                             │
└──────┬───────────────┬──────────────────────┬──────────┬────────┘
       │               │                      │          │
       │ participants[] │ admin (group only)   │ uploadedBy│ userId
       │ (M-to-M)      │ (M-to-1)             │ (1-to-M)  │ (1-to-1 active)
       ▼               ▼                      ▼          ▼
┌────────────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│           CHAT             │  │        MEDIA        │  │       OTP        │
│  _id, isGroup,             │  │  _id, uploadedBy,   │  │  _id, userId,    │
│  participants[], name,     │  │  url, publicId,     │  │  code,           │
│  icon, admin, lastMessage  │  │  resourceType,      │  │  expiresAt       │
└──────────────┬─────────────┘  │  mimeType, sizeBytes│  │  (TTL auto-del)  │
               │ chatId (1-to-M)└──────────┬──────────┘  └──────────────────┘
               ▼                           │
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
†  isVerified must be true before JWT is issued or protected routes are accessible
?  phone is optional, not unique, not verified in MVP
```

---

## 🔑 Design Decisions

**Email as primary identity** — simple, free, zero infrastructure. Unique index ensures no duplicates. Used for login, registration, and user search.

**Email OTP verification on registration** — a 6-digit code is sent to the user's email before the account is activated. The `User` document is created immediately on registration with `isVerified: false` so the email uniqueness check happens at the first step. The account becomes fully active only when the OTP is confirmed. This prevents abandoned unverified registrations from permanently blocking an email address, while still enforcing ownership.

**`isVerified` flag on User** — a single boolean that gates all protected access. JWT is only issued when `isVerified: true`. Middleware checks this on every protected route. No verified user can be blocked by an unverified duplicate because the uniqueness constraint on `email` ensures only one record per email exists.

**Dedicated `otps` collection with TTL index** — OTPs are not stored on the `User` document because they are transient data with a short, independent lifecycle. Keeping them in a separate collection allows MongoDB's TTL thread to auto-expire them, avoids bloating the User document, and makes the collection reusable for phone OTP verification in Phase 2 without any schema changes.

**Plain string OTP storage (not hashed)** — OTP codes are short-lived (10 minutes), low-entropy (6 digits), rate-limited, and auto-deleted on use. Hashing adds complexity without meaningful security gain in this context. The security model relies on rate limiting + TTL expiry rather than hash secrecy.

**Delete-before-insert on OTP creation** — before saving a new OTP, any existing OTP for that `userId` is deleted. This prevents multiple valid OTPs existing simultaneously (e.g., if the user clicks "Resend" multiple times quickly) and ensures only the latest code is valid.

**Phone as optional, unverified field in MVP** — stored as a plain string so users can optionally provide it. No uniqueness constraint, no OTP flow, no SMS costs. The `otps` collection is already built and reusable for phone verification in Phase 2 — just extend with a `phone` target field.

**Password hashed with bcrypt** — `select: false` ensures the hash is never accidentally returned in any query response.

**Denormalized `lastMessage` on Chat** — avoids a separate aggregation query every time the sidebar loads. Updated atomically whenever a new message is saved.

**`deliveredTo[]` and `readBy[]` as arrays** — supports both DMs (2 users) and group chats (N users) with the same field, no schema change needed for groups.

**Media as a separate collection** — keeps the Message document lean and allows media to be managed independently (e.g., deletion from Cloudinary without touching message history).

**`deletedFor[]` instead of hard delete** — messages are soft-deleted per user, preserving the conversation for other participants (WhatsApp-style "Delete for me").

**No embedded messages in Chat** — embedding messages would cause the Chat document to grow unboundedly and hit MongoDB's 16MB limit. Messages are always a separate collection.

**No DB-level cascades** — MongoDB has no `ON DELETE CASCADE`. All referential integrity is enforced at the API layer.

---

## 🔮 Phase 2+ Phone Verification Upgrade Path

The `otps` collection built for email verification is directly reusable for phone OTP. The migration path is purely additive — no existing documents need to change:

```ts
// Step 1: Add unique sparse index on phone (allows existing null values)
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Step 2: Add phoneVerified flag to User schema
phone:         { type: String, default: null, trim: true },
phoneVerified: { type: Boolean, default: false },          // ← add this

// Step 3: Extend OTP document to support phone target (optional — can use separate collection)
// The existing otps collection works as-is; just send SMS instead of email

// Step 4: Build the OTP send/verify flow for phone (Twilio / Africa's Talking)
// Step 5: Gate phone-dependent features behind phoneVerified: true
```

Because `phone` is already in the schema as a plain field and the `otps` collection infrastructure already exists, adding phone verification is purely new infrastructure on top — no data migration is needed.

---

*Generated for ChatSphere MVP · MongoDB + Mongoose · 5 Collections · Email-based Identity · OTP Email Verification*
