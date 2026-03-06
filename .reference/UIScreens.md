# ChatSphere — UI Screens Specification

> Complete screen-by-screen UI reference for the ChatSphere web application.
> Every screen documents layout, components, element positions, states, interactions, and design notes required to build the frontend.

---

## Table of Contents

1. [Design System & Global Tokens](#1-design-system--global-tokens)
2. [Login Screen — `/login`](#2-login-screen----login)
3. [Registration Screen — `/register`](#3-registration-screen----register)
4. [Chat Dashboard — `/chat`](#4-chat-dashboard----chat)
   - 4.1 [Left Sidebar — Chat List Panel](#41-left-sidebar--chat-list-panel)
   - 4.2 [Right Panel — Empty / Welcome State](#42-right-panel--empty--welcome-state)
   - 4.3 [Right Panel — Active DM Conversation](#43-right-panel--active-dm-conversation)
   - 4.4 [Right Panel — Active Group Conversation](#44-right-panel--active-group-conversation)
5. [New DM — User Search Overlay](#5-new-dm--user-search-overlay)
6. [New Group Chat — Creation Modal](#6-new-group-chat--creation-modal)
7. [Group Info Panel (Slide-in)](#7-group-info-panel-slide-in)
8. [DM Contact Info Panel (Slide-in)](#8-dm-contact-info-panel-slide-in)
9. [Profile & Settings Page — `/profile`](#9-profile--settings-page----profile)
10. [Media Viewer — Lightbox Overlay](#10-media-viewer--lightbox-overlay)
11. [Notification Permission Banner](#11-notification-permission-banner)
12. [Message Context Menu](#12-message-context-menu)
13. [Delete Confirmation Dialog](#13-delete-confirmation-dialog)
14. [Toast Notification System](#14-toast-notification-system)
15. [Session Expired Screen / Redirect](#15-session-expired-screen--redirect)
16. [Responsive Behaviour — Mobile Breakpoints](#16-responsive-behaviour--mobile-breakpoints)
17. [Loading & Skeleton States](#17-loading--skeleton-states)
18. [Empty States](#18-empty-states)
19. [Total Screens]


---

## 19. Toatal Screens:
Authentication — 2 Pages, 6 Screens

Login — Default
Login — Error State (invalid credentials / rate limit)
Register — Default
Register — Validation Errors
Register — Step (password strength visible)
Session Expired — Login with banner


Chat Dashboard — 8 Screens

Chat Dashboard — Empty (no chat selected, welcome state)
Chat Dashboard — DM Conversation (active, messages loaded)
Chat Dashboard — DM Conversation — Typing Indicator visible
Chat Dashboard — DM Conversation — Media Message (image/file in chat)
Chat Dashboard — DM Conversation — Scrolled Up (new message banner visible)
Chat Dashboard — Group Conversation (active, with sender names/avatars)
Chat Dashboard — Skeleton Loading State (initial data fetch)
Chat Dashboard — Empty Chat (chat selected, no messages sent yet)


Sidebar States — 3 Screens

Sidebar — Populated Chat List (DMs + groups, unread badges, online dots)
Sidebar — Filtered / Search Active (chat list filtered)
Sidebar — Empty (no chats, empty state illustration)


Overlays & Modals — 9 Screens

New DM Search Overlay — Default (empty search)
New DM Search Overlay — Results Loaded
New DM Search Overlay — No Results Found
New Group Modal — Step 1 (Add Participants)
New Group Modal — Step 2 (Group Name & Icon)
Group Info Panel — Slide-in (admin view)
Group Info Panel — Slide-in (member view, no admin controls)
DM Contact Info Panel — Slide-in
Media Lightbox — Image Viewer


Message Interactions — 3 Screens

Message Context Menu — open on a message bubble
Delete Confirmation Dialog
Media Upload Preview (file selected, progress bar, before send)


Profile & Settings — 3 Screens

Profile Page — Default (pre-filled fields)
Profile Page — Edit Mode (unsaved changes, save button active)
Profile Page — Saving State (spinner / success)


Notifications & Feedback — 3 Screens

Notification Permission Banner (visible at top of chat)
Toast Notifications — all 4 variants (success, error, info, warning) on one frame
Empty States — all variants on one reference frame


Responsive / Mobile — 5 Screens

Mobile — Chat List (full screen sidebar)
Mobile — Active DM Conversation (full screen chat)
Mobile — Active Group Conversation (full screen)
Mobile — New Group Modal (bottom sheet)
Mobile — Profile Page (full screen)


Dark Mode — 3 Screens (key screens mirrored)

Dark Mode — Chat Dashboard — DM Conversation
Dark Mode — Login
Dark Mode — Profile Page

## 1. Design System & Global Tokens

These tokens apply globally across all screens. Designers and developers should reference this section when implementing any component.

### Color Palette

**Light Mode**

| Token | Usage | Value (suggested) |
|---|---|---|
| `--color-bg-base` | App background | `#F0F2F5` |
| `--color-bg-surface` | Sidebar, panels | `#FFFFFF` |
| `--color-bg-chat` | Chat area background | `#E5DDD5` (WhatsApp-like warm grey) |
| `--color-bubble-outgoing` | Sent message bubble | `#DCF8C6` (light green) |
| `--color-bubble-incoming` | Received message bubble | `#FFFFFF` |
| `--color-primary` | Buttons, active states, links | `#25D366` (green) |
| `--color-primary-dark` | Hover state on primary | `#1EBE58` |
| `--color-header` | Sidebar header, chat header bg | `#075E54` (dark teal) |
| `--color-text-primary` | Main body text | `#111B21` |
| `--color-text-secondary` | Timestamps, subtitles | `#667781` |
| `--color-text-on-header` | Text on dark header bg | `#FFFFFF` |
| `--color-border` | Dividers, input borders | `#E9EDEF` |
| `--color-tick-grey` | Sent/delivered ticks | `#667781` |
| `--color-tick-blue` | Read ticks | `#53BDEB` |
| `--color-online` | Online presence dot | `#25D366` |
| `--color-danger` | Error, delete actions | `#EB4034` |
| `--color-info` | Info toasts, banners | `#3B82F6` |

**Dark Mode** — All surface/bg tokens invert, bubble colors muted:

| Token | Dark Mode Value |
|---|---|
| `--color-bg-base` | `#111B21` |
| `--color-bg-surface` | `#1F2C34` |
| `--color-bg-chat` | `#0B141A` |
| `--color-bubble-outgoing` | `#005C4B` |
| `--color-bubble-incoming` | `#1F2C34` |
| `--color-text-primary` | `#E9EDEF` |
| `--color-text-secondary` | `#8696A0` |
| `--color-header` | `#1F2C34` |
| `--color-border` | `#2A3942` |

### Typography

| Token | Font Size | Weight | Usage |
|---|---|---|---|
| `--text-xs` | 11px | 400 | Timestamps, ticks |
| `--text-sm` | 13px | 400 | Chat preview text, secondary labels |
| `--text-base` | 15px | 400 | Message body text |
| `--text-md` | 15px | 600 | Sender name in group, chat name in sidebar |
| `--text-lg` | 17px | 600 | Chat header name, page titles |
| `--text-xl` | 20px | 700 | Auth page headings |

Font family: `Inter`, `Segoe UI`, `Helvetica Neue`, `sans-serif`

### Spacing

Base unit: `4px`. Common tokens: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 48px`.

### Elevation / Shadows

| Level | Usage | CSS |
|---|---|---|
| `shadow-sm` | Cards, dropdown menus | `0 1px 3px rgba(0,0,0,0.1)` |
| `shadow-md` | Modals, overlays | `0 4px 16px rgba(0,0,0,0.2)` |
| `shadow-lg` | Lightbox, full overlays | `0 8px 32px rgba(0,0,0,0.4)` |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Inputs, small buttons |
| `--radius-md` | `8px` | Cards, panels |
| `--radius-bubble` | `7.5px` | Message bubbles |
| `--radius-full` | `9999px` | Avatars, pills, icon buttons |

### Avatars

- Shape: circle (`border-radius: 9999px`)
- Sizes: `32px` (sidebar preview), `40px` (chat header), `56px` (profile, group info)
- Fallback: colored circle with initials (first letter of name), generated deterministically from user ID for consistent color per user
- Online dot: `10px` circle, `--color-online`, positioned `bottom-right` of avatar, with `2px` white ring

### Iconography

Use a consistent icon set throughout (e.g. `lucide-react` or `heroicons`). Icon sizes: `20px` standard, `24px` for header actions. Stroke weight: `1.5px`.

### Transitions & Animations

- Sidebar panel slide: `transform translateX`, `200ms ease-out`
- Message appear: `opacity 0→1`, `100ms`
- Tooltip appear: `opacity 0→1`, `150ms`
- Modal enter: `scale 0.95→1 + opacity`, `150ms ease-out`
- Toast slide-in: `translateY(-8px)→0 + opacity`, `200ms`

---

## 2. Login Screen — `/login`

**Route:** `/login`
**Access:** Public. If a valid JWT cookie exists, middleware redirects to `/chat`.
**Layout:** Full-viewport centered card, no sidebar.

### Overall Layout

The screen is split into two columns on desktop (≥1024px):

- **Left column (40% width):** Branding panel — full-height, background color `--color-header` (dark teal). Contains the app logo, app name "ChatSphere", and a short tagline (e.g. "Simple, fast, real-time messaging."). This column is hidden on mobile.
- **Right column (60% width, or 100% on mobile):** White card centered vertically with the login form.

On mobile (< 768px): single column, white background, logo shown above the form.

### Elements

#### Branding Panel (Left, desktop only)

| Element | Position | Details |
|---|---|---|
| App logo / icon | Centered horizontally, upper-middle | SVG speech-bubble icon, `64px`, white |
| App name "ChatSphere" | Below logo, `24px` gap | `--text-xl`, white, bold |
| Tagline | Below name, `8px` gap | `--text-sm`, white, opacity 0.75, max-width 240px, centered |

#### Login Form Panel (Right)

| Element | Position | Details |
|---|---|---|
| "Welcome back" heading | Top of form area | `--text-xl`, `--color-text-primary`, margin-bottom `8px` |
| Sub-heading | Below heading | `--text-sm`, `--color-text-secondary`, "Sign in to continue" |
| Session expired banner | Below sub-heading, conditionally rendered | Amber/yellow banner with icon: "Your session has expired. Please sign in again." Only shown when redirected from session expiry. |
| Email field label | Above input | `--text-sm`, `--color-text-secondary` |
| Email input | Below label | Full width, `height: 44px`, placeholder "you@example.com", `type="email"`, `autocomplete="email"` |
| Password field label | Below email input, `16px` gap | `--text-sm`, `--color-text-secondary` |
| Password input | Below label | Full width, `height: 44px`, `type="password"`, `autocomplete="current-password"`. Right side: toggle icon (eye / eye-off) to show/hide password |
| Inline error message | Below the input that has the error | `--text-xs`, `--color-danger`, with small warning icon to the left. Slides in on validation failure |
| Form-level error (auth failure) | Below password field, above submit button | Red banner/box: "Invalid email or password." Shown after failed API call |
| Rate limit error | Same position as form-level error | "Too many login attempts. Please try again in X minutes." |
| Sign In button | Below error area, full width | `height: 44px`, `background: --color-primary`, white text "Sign In", `--radius-sm`. Hover: `--color-primary-dark`. Disabled + spinner while request in flight |
| "Don't have an account?" | Below button, centered | `--text-sm`, `--color-text-secondary`. "Register" is a link styled in `--color-primary` |
| Dark/Light mode toggle | Top-right corner of the page | Icon button (sun/moon), 20px icon, tooltip "Toggle theme" |

### States

| State | Visual Change |
|---|---|
| Default | All fields empty, button enabled |
| Typing | Input border highlights to `--color-primary` on focus |
| Validation error | Red border on invalid input, inline error text below |
| Loading | Submit button shows spinner + "Signing in…", all inputs disabled |
| Success | Button briefly shows checkmark, then page redirects |
| Network error | Toast appears top-right: "Something went wrong. Please try again." |

---

## 3. Registration Screen — `/register`

**Route:** `/register`
**Access:** Public. If a valid JWT cookie exists, middleware redirects to `/chat`.
**Layout:** Same two-column layout as Login (branding left, form right). On mobile: single column.

### Elements

#### Branding Panel (Left, desktop only)

Same as Login. Tagline changes to: "Join millions messaging in real time."

#### Registration Form Panel (Right)

| Element | Position | Details |
|---|---|---|
| "Create your account" heading | Top of form area | `--text-xl`, bold |
| Sub-heading | Below heading | `--text-sm`, secondary color: "Free, fast, and always in sync." |
| Full Name field label | First field | `--text-sm`, label "Full Name" |
| Full Name input | Below label | Full width, `height: 44px`, `type="text"`, placeholder "Alice Johnson", `autocomplete="name"` |
| Email field label | Below name input, `16px` gap | Label "Email Address" |
| Email input | Below label | `type="email"`, placeholder "you@example.com", `autocomplete="email"` |
| Inline email error | Below email input | Shown for invalid format or "Email already in use" |
| Password field label | Below email, `16px` gap | Label "Password" |
| Password input | Below label | `type="password"`, placeholder "Min. 8 characters", `autocomplete="new-password"`. Eye toggle on right |
| Password strength indicator | Below password input | A thin bar (4 segments) that fills progressively: red (weak) → orange → yellow → green (strong). Appears as soon as user starts typing |
| Password hint text | Below strength bar | `--text-xs`, secondary: "Must be at least 8 characters." |
| Phone field label | Below password, `16px` gap | Label "Phone Number (optional)" with a small "(optional)" badge or greyed label |
| Phone input | Below label | `type="tel"`, placeholder "+923001234567", `autocomplete="tel"`. No OTP trigger |
| Phone hint text | Below phone input | `--text-xs`, secondary: "E.164 format, e.g. +923001234567. Used for future features." |
| Inline phone error | Below phone input | Only shown if user enters an invalid format |
| Create Account button | Below all fields | Full width, `height: 44px`, primary green, white text "Create Account". Spinner + "Creating account…" while loading |
| "Already have an account?" | Below button, centered | `--text-sm`, "Sign in" link in primary color |
| Dark/Light toggle | Top-right of page | Same as login |

### States

Same as Login, plus:

| State | Visual Change |
|---|---|
| Typing password | Password strength bar animates in, segments fill based on complexity |
| Email 409 conflict | Inline error under email: "This email is already registered. Sign in instead?" with a link |
| All fields valid | Submit button becomes fully active (it's always clickable but shows errors on attempt) |

---

## 4. Chat Dashboard — `/chat`

**Route:** `/chat`
**Access:** Protected. Unauthenticated users redirected to `/login`.
**Layout:** Two-panel layout side by side. Fixed full viewport height (`100vh`). No page scroll — scrolling is internal to each panel.

```
┌─────────────────────────────────────────────────────────┐
│  TOP HEADER BAR (optional global bar, if used)          │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   LEFT SIDEBAR       │       RIGHT PANEL                │
│   (360px fixed)      │   (remaining width, flex-1)      │
│                      │                                  │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

Sidebar width: `360px` on desktop, full-screen on mobile (right panel hidden until chat selected).

---

### 4.1 Left Sidebar — Chat List Panel

The sidebar is a vertical flex column divided into three horizontal zones: **Header**, **Search Bar**, and **Chat List**.

#### Zone A — Sidebar Header

`height: 56px`, background `--color-header` (dark teal), horizontal padding `16px`.

| Element | Position | Details |
|---|---|---|
| Current user avatar | Far left | `32px` circle. Clickable — navigates to `/profile`. Online green dot overlay |
| "ChatSphere" wordmark or logo | Center-left | `--text-md`, white, bold |
| Icon button group | Far right, horizontal row | Three icon buttons spaced `8px` apart |
| — New Group icon | 1st from right | People+ icon, `20px`, white, tooltip "New Group" |
| — New DM icon | 2nd from right | Compose/pencil icon, `20px`, white, tooltip "New Chat" |
| — More options (⋮) | 3rd from right (rightmost) | Vertical dots icon, `20px`, white. Opens a dropdown: "Profile", "Settings (future)", "Logout" |

#### Zone B — Search Bar

`height: 48px`, background slightly lighter than sidebar surface, horizontal padding `12px`, vertical padding `8px`.

| Element | Position | Details |
|---|---|---|
| Search icon | Left inside input | `16px`, `--color-text-secondary` |
| Search/filter input | Full width with left icon | Placeholder "Search or start new chat", `--text-sm`, background `--color-bg-base`, `border-radius: 8px`, `height: 32px` |
| Clear (×) button | Right inside input, conditional | Appears only when input has text. Clears the search query |

**Behavior:** Typing in this field filters the chat list in real time (client-side filter on chat names). It is distinct from the New DM user search (which queries the server). This is a local chat-list filter only.

#### Zone C — Chat List

Fills remaining height, `overflow-y: auto`, custom scrollbar styled or hidden.

Each row in the chat list is a **Chat List Item**:

**Chat List Item — `height: 72px`, horizontal padding `16px`, vertical padding `8px`**

| Sub-element | Position | Details |
|---|---|---|
| Avatar | Left, vertically centered | `48px` circle. For DMs: the other user's avatar. For groups: group icon, or colored initials fallback |
| Online dot | Bottom-right of avatar | `10px`, green, `--color-online`. Only shown for DMs where the contact is online |
| Chat name | Top-right of avatar, `12px` gap | `--text-md`, `--color-text-primary`, single line, ellipsis on overflow. For DMs: the other user's name. For groups: the group name |
| Last message preview | Below chat name | `--text-sm`, `--color-text-secondary`, single line, ellipsis. Prefix "You: " if the last message was sent by the current user. Media messages show "[Image]", "[Video]", "[File]" |
| Timestamp | Top-right corner | `--text-xs`, `--color-text-secondary`. Shows time if today (e.g. "14:32"), "Yesterday", or day name (e.g. "Mon") if within a week, date otherwise |
| Unread badge | Bottom-right corner | Filled green pill (`--color-primary`), white text, `--text-xs`, `border-radius: 9999px`, `min-width: 20px`. Shows unread count. Hidden when count = 0 |
| Tick icons | Left of timestamp (for outgoing last message) | Grey or blue double ticks (✓ or ✓✓) depending on message status. Hidden if the last message was received (not sent by current user) |
| Muted icon (phase 2) | Left of unread badge | Bell-off icon, `--color-text-secondary`. Placeholder for future muting feature |

**Chat List Item States:**

| State | Visual |
|---|---|
| Default | White background |
| Hover | Background `--color-bg-base` (light grey) |
| Active / Selected | Background `--color-bg-base` with left border `3px solid --color-primary` |
| Unread | Chat name and preview text use `--text-md` weight (bold) |
| Filtered out | Hidden (`display: none`) when search query doesn't match |

**Chat List Empty State:**
When no chats exist yet, the list area shows a centered illustration and text: "No chats yet. Start a new conversation!" with a "New Chat" button.

**Chat List Divider:**
A `1px` horizontal line `--color-border` separates each chat item. No dividers for group sections in MVP — all chats sorted by `updatedAt` descending.

---

### 4.2 Right Panel — Empty / Welcome State

Shown when no chat is selected (default on first load, desktop only).

| Element | Position | Details |
|---|---|---|
| Lock / message icon | Center of panel, upper-middle | Large illustration or icon `80px`, `--color-text-secondary` opacity 0.4 |
| Heading | Below icon, `16px` gap | `--text-lg`, `--color-text-secondary`: "Select a chat to start messaging" |
| Sub-text | Below heading, `8px` gap | `--text-sm`, secondary: "Your messages are private and delivered in real time." |
| Background | Full panel | `--color-bg-chat` (warm grey, same as active chat background) |

---

### 4.3 Right Panel — Active DM Conversation

#### Zone A — Chat Header

`height: 56px`, background `--color-header`, horizontal padding `16px`. Sticky at top.

| Element | Position | Details |
|---|---|---|
| Back button (mobile only) | Far left | Chevron-left icon, white, navigates back to sidebar |
| Contact avatar | Left (after back button on mobile, or leftmost on desktop) | `40px` circle. Online dot overlay if contact is online |
| Contact name | Right of avatar, `12px` gap | `--text-lg`, white, single line |
| Presence / last seen | Below contact name | `--text-xs`, white opacity 0.75. Shows "Online" (green text or just white when header is dark) or "Last seen today at 14:32" / "Last seen yesterday" / "Last seen X days ago" |
| Search in chat icon (optional MVP) | Right side icon buttons | Magnifier icon, `20px`, white. Placeholder — can be deferred |
| Video call icon (phase 2 placeholder) | Right icon group | Camera icon, white, disabled/greyed in MVP |
| Voice call icon (phase 2 placeholder) | Right icon group | Phone icon, white, disabled/greyed in MVP |
| More options (⋮) | Rightmost | Vertical dots, white. Opens dropdown: "View Contact", "Clear Chat (future)", "Block (future)" |

#### Zone B — Message Area

Fills remaining height between header and input bar. Background `--color-bg-chat`. `overflow-y: auto`. Padding `16px` horizontal.

**Top Sentinel:** An invisible `div` of `height: 1px` at the very top. Observed by Intersection Observer for pagination trigger.

**Loading Spinner (pagination):** Shown at the very top of the message list when older messages are being fetched. Centered horizontally, `24px` spinner, `--color-text-secondary`.

**"Beginning of conversation" label:** Shown when all messages have been loaded. Centered pill-shaped chip: "— Beginning of conversation —", `--text-xs`, `--color-text-secondary`, background `rgba(0,0,0,0.05)`.

**Date Separator:** Appears between messages from different calendar days. Centered chip similar to above: "Today", "Yesterday", "Monday, 24 Feb 2025". Sticky within the scroll so the date is always visible as the user scrolls.

**Message Bubbles:**

Messages alternate between outgoing (right-aligned) and incoming (left-aligned).

| Sub-element | Outgoing | Incoming |
|---|---|---|
| Alignment | `justify-content: flex-end` | `justify-content: flex-start` |
| Bubble background | `--color-bubble-outgoing` | `--color-bubble-incoming` |
| Bubble border-radius | `7.5px`, sharp on bottom-right corner (`0px`) | `7.5px`, sharp on bottom-left corner (`0px`) |
| Sender name | Not shown (it's always "you") | Not shown in DM (only in group) |
| Message text | `--text-base`, `--color-text-primary` | Same |
| Timestamp | Bottom-right inside bubble, `--text-xs`, secondary | Bottom-right inside bubble |
| Tick icons | Right of timestamp | Not shown on incoming |
| Max width | `65%` of panel width | `65%` of panel width |
| Margin | `margin-bottom: 2px` if same sender chain; `margin-bottom: 8px` on sender change | Same |
| Tail / arrow | CSS pseudo-element pointing outward bottom-right | Pointing outward bottom-left |

**Tick Icons (on outgoing messages):**

| Status | Icon | Color |
|---|---|---|
| Sent | Single check ✓ | `--color-tick-grey` |
| Delivered | Double check ✓✓ | `--color-tick-grey` |
| Read | Double check ✓✓ | `--color-tick-blue` |

**Media Messages:**

| Type | Rendering |
|---|---|
| Image | Inline image thumbnail inside bubble, max `240px × 240px`, `border-radius: 6px`. Click opens lightbox. Lazy loaded via Intersection Observer. Below image: caption text (if any) + timestamp |
| Video | Inline video thumbnail with play button overlay. Click opens lightbox/inline player. File size shown below |
| PDF / File | Card-style inside bubble: file icon (left) + file name + size (right) + download icon button (far right) |

**System / Info Messages:**

For group events like "Alice joined", "Bob left", "Group created":
- Centered chip, grey background, `--text-xs`, no bubble tail, not interactive.

**"New message ↓" Banner:**

When a new message arrives while the user is scrolled up:
- Sticky bar anchored to the bottom of the message area (above the input zone).
- Green background, white text: "1 new message ↓" (or "3 new messages ↓").
- Clicking scrolls to the bottom and dismisses the banner.

#### Zone C — Typing Indicator

`height: 28px`, appears above the input bar when the contact is typing. Background transparent or slightly tinted.

| Element | Details |
|---|---|
| Animated dots | Three bouncing dots animation (`••• `), `--color-text-secondary` |
| Text | "<Contact Name> is typing…", `--text-sm`, `--color-text-secondary` |

In group chats: "Alice and Bob are typing…" or "3 people are typing…"

#### Zone D — Message Input Bar

`min-height: 56px`, background `--color-bg-surface`, border-top `1px solid --color-border`, padding `8px 16px`, horizontal flex layout. Sticky at bottom.

| Element | Position | Details |
|---|---|---|
| Emoji picker button | Far left | Smiley face icon, `20px`, `--color-text-secondary`. Opens emoji picker panel above input bar. Tooltip "Emoji" |
| Attach button | Left, next to emoji | Paperclip icon, `20px`, `--color-text-secondary`. Opens file picker. Tooltip "Attach file" |
| Text input (textarea) | Center, flex-1 | Auto-expands with content (max `~5 lines`). Placeholder "Type a message…". `--text-base`. Background transparent. No border — the whole bar is the visual container. `border-radius: --radius-md` |
| Character counter | Inside textarea, bottom-right | `--text-xs`, secondary, only visible when count > 3500 (warning zone). Shows "3,847 / 4,000" |
| Send button | Far right | Circular button, `40px`, `--color-primary`. Paper plane / send icon, white. Visible only when input has text. When input is empty, a microphone icon (phase 2) takes its place |
| Send button hover | — | `--color-primary-dark`, slight scale(1.05) |
| Send button disabled | — | When input is empty or whitespace only |

**Media Preview (above input bar, before sending):**

Appears between the message area and the input bar when a file is selected:

| Element | Details |
|---|---|
| Preview container | `height: 80px`, `background: --color-bg-base`, padding `8px 16px`, border-top `1px solid --color-border` |
| Image thumbnail | `64px × 64px`, `border-radius: 6px`, `object-fit: cover` |
| Video thumbnail | Same size, with play icon overlay |
| File icon + name | For PDFs: file icon left, file name and size right |
| Remove (×) button | Top-right corner of the preview thumbnail. Clicking cancels the file selection |
| Upload progress bar | Bottom of preview container. Green fill, animates from 0% to 100% during upload |

---

### 4.4 Right Panel — Active Group Conversation

Identical to DM Conversation (4.3) with these differences:

#### Chat Header (Group-specific)

| Element | Change |
|---|---|
| Avatar | Group icon or generated initials avatar |
| Name | Group name |
| Sub-line | Member count: "5 members" (or "5 members · 2 online" if presence is tracked) |
| More options dropdown | "Group Info", "Exit Group" |

#### Message Bubbles (Group-specific)

| Element | Change |
|---|---|
| Sender name | Shown above incoming message bubble (not on outgoing). `--text-sm`, colored (deterministic color per user from their ID hash). e.g. "Alice" in blue, "Bob" in purple |
| Avatar | Small `24px` avatar shown to the left of incoming message bubbles. For consecutive messages from the same sender, only the last one in the chain shows the avatar; earlier ones leave the space empty (WhatsApp-style) |

---

## 5. New DM — User Search Overlay

**Trigger:** Clicking the compose/pencil icon in the sidebar header.
**Layout:** Modal overlay or slide-in panel replacing/overlaying the sidebar content. Not full-screen — contained within the sidebar width.

### Elements

| Element | Position | Details |
|---|---|---|
| Header bar | Top, full width | `height: 56px`, `--color-header` background. Left: back arrow (×) to close. Center/right: "New Chat" title, `--text-lg`, white |
| Search input | Below header | Full width, `height: 48px`, padding `12px`. Search icon left, input text "Search by name or email". Auto-focused on open. Debounced 300ms before API call |
| Loading indicator | Below input, conditional | Thin animated line or spinner. Shown while API call is in progress |
| Results list | Below input / loading | Scrollable list of user results. Same item structure as chat list but without last message / timestamp |

**Search Result Item — `height: 64px`, padding `12px 16px`:**

| Sub-element | Position | Details |
|---|---|---|
| Avatar | Left | `48px` circle, user avatar or initials fallback |
| Online dot | Bottom-right of avatar | Green dot if user is online |
| User name | Top-right of avatar | `--text-md`, `--color-text-primary` |
| Email | Below name | `--text-sm`, `--color-text-secondary`, ellipsis on overflow |

**No results state:** Centered inside results area: magnifier icon + "No users found. Try a different name or email." in `--text-sm`, secondary.

**Minimum query length notice:** When fewer than 2 characters typed, show: "Type at least 2 characters to search."

**Interaction:** Clicking a result immediately calls `POST /api/chats/dm` and navigates to the conversation. The overlay closes.

---

## 6. New Group Chat — Creation Modal

**Trigger:** Clicking the people+ (New Group) icon in the sidebar header.
**Layout:** Centered modal dialog, `width: 480px`, `max-height: 80vh`, `border-radius: --radius-md`, `shadow-md`. Backdrop overlay `rgba(0,0,0,0.4)`. Two steps rendered inside the same modal.

### Step 1 — Add Participants

| Element | Position | Details |
|---|---|---|
| Modal header | Top | "New Group" title left, × close button right. `height: 56px`, border-bottom |
| Search input | Below header | Same server-side user search as DM. Placeholder "Add people by name or email". Debounced 300ms |
| Selected participants chips | Below search input | Horizontal wrapping flex row. Each chip: user avatar (`20px`) + name + × remove button. Background `--color-bg-base`, `border-radius: --radius-full`, padding `4px 8px`. Max 2 rows before scrolling |
| Participant count label | Right of chips row | `--text-xs`, secondary: "X of 256 max" |
| Search results list | Below chips | Scrollable, same result item as DM search. Clicking adds to the chips row. Users already selected show a checkmark instead |
| Next button | Bottom-right of modal | Disabled until ≥ 2 contacts selected. "Next →", primary green |
| Participant minimum hint | Below Next button, conditional | `--text-xs`, secondary: "Add at least 2 people to create a group." Shown when 0 or 1 selected |

### Step 2 — Group Details

| Element | Position | Details |
|---|---|---|
| Back button | Top-left of header | Chevron-left, returns to Step 1 |
| Header title | "New Group — Details" | |
| Group icon upload | Centered, below header, `24px` top margin | Circular `72px` dashed border placeholder. Click opens file picker. On upload, shows the selected image. Camera icon overlay in center. Label below: "Group Icon (optional)" |
| Group Name input | Below icon, `24px` gap | Full width, `height: 44px`, label "Group Name", placeholder "e.g. Team Rocket", required |
| Name inline error | Below input | "Group name is required." |
| Selected participants preview | Below name input | Horizontal avatar stack (overlapping circles), `32px` each, max 5 shown + "+X more" label. Read-only. |
| Create Group button | Bottom-right | "Create Group ✓", primary green. Spinner while API call in progress |
| Cancel button | Bottom-left | Ghost/outline button, "Cancel" |

---

## 7. Group Info Panel (Slide-in)

**Trigger:** Clicking the group name or the "Group Info" option from the more-options dropdown in the group chat header.
**Layout:** Slides in from the right, `width: 360px`, overlapping the message area on desktop. Full-screen on mobile. `background: --color-bg-surface`. Can be dismissed by clicking the × or clicking outside.

### Sections (top to bottom)

#### Section A — Group Header

| Element | Details |
|---|---|
| Close (×) button | Top-right, `20px` icon |
| Panel title | "Group Info", `--text-lg`, centered or left-aligned |
| Group icon | `80px` circle, centered. Admin sees a camera-overlay edit button on hover |
| Group name | Below icon, `--text-lg`, bold, centered. Admin sees a pencil edit icon inline |
| Member count | Below name, `--text-sm`, secondary: "5 members" |
| Created date | `--text-xs`, secondary: "Created 12 Feb 2025 by Alice" |

#### Section B — Participants List

Header: "Members (5)" with "Add Member" button on the right (admin only — pencil/person+ icon).

Each member row (`height: 56px`):

| Sub-element | Details |
|---|---|
| Avatar | `40px` circle, left |
| Name | `--text-md`, right of avatar |
| "Admin" badge | Small green pill next to name if the user is the admin |
| "You" badge | Grey pill if it's the current user |
| Online dot | On avatar |
| Remove button | Far right, trash/× icon, `--color-danger`. Admin-only. Hidden for current user and for the admin themselves |

#### Section C — Actions

Divider line then action buttons:

| Button | Details |
|---|---|
| Leave Group | Full-width, ghost button, `--color-danger` text, door/exit icon left. Triggers confirmation dialog |

---

## 8. DM Contact Info Panel (Slide-in)

**Trigger:** Clicking the contact's name or avatar in the DM chat header, or "View Contact" from more options.
**Layout:** Same slide-in panel as Group Info, `width: 360px`.

### Sections

#### Section A — Contact Header

| Element | Details |
|---|---|
| Close (×) | Top-right |
| Panel title | "Contact Info" |
| Avatar | `80px` circle, centered |
| Name | `--text-lg`, bold, centered |
| Presence | "Online" (green dot + text) or "Last seen today at 14:32" |
| Email | `--text-sm`, secondary, centered |
| Phone | `--text-sm`, secondary, centered. Only shown if the contact has provided a phone number |
| Status message | Italic, `--text-sm`, secondary, centered: e.g. "Hey there! I'm using ChatSphere" |

#### Section B — Shared Media (MVP placeholder)

Header row: "Shared Media" with "View All" link (phase 2).
Content: A horizontal scroll row of the last 4 image thumbnails shared in the chat (`64px × 64px`, `border-radius: 6px`). If no media, shows: "No shared media yet."

#### Section C — Actions

| Button | Details |
|---|---|
| Block Contact (phase 2) | Full-width ghost, danger color. Placeholder / disabled in MVP |

---

## 9. Profile & Settings Page — `/profile`

**Route:** `/profile`
**Access:** Protected.
**Layout:** Single-column centered content, max-width `640px`, margin `0 auto`, padding `32px 16px`. The left sidebar is still visible on desktop (the right panel renders the profile page content). On mobile: full-screen.

### Sections

#### Section A — Page Header

| Element | Details |
|---|---|
| Back arrow button | Top-left, navigates back to `/chat` |
| Page title | "Profile & Settings", `--text-xl`, bold |

#### Section B — Avatar

| Element | Position | Details |
|---|---|---|
| Avatar preview | Centered | `96px` circle. Shows current avatar or initials fallback |
| Camera overlay button | Bottom-right of avatar | `32px` circle, `--color-primary` background, white camera icon. On click: opens file picker (`accept="image/jpeg,image/png,image/gif,image/webp"`) |
| Upload progress ring | Around avatar, conditional | Circular progress ring animates during Cloudinary upload |
| Avatar change hint | Below avatar | `--text-xs`, secondary: "Click to change. JPG, PNG, GIF, WEBP up to 10MB." |

#### Section C — Profile Fields (Form)

| Field | Input Type | Constraints / Notes |
|---|---|---|
| Full Name | Text input, `height: 44px` | Required. Label: "Full Name". Inline error if empty |
| Email | Text input, `height: 44px`, `disabled` | Read-only display. Label: "Email Address". Small lock icon inside input. Tooltip: "Email cannot be changed" |
| Status Message | Textarea, `height: 72px` | Max 100 chars. Label: "Status Message". Live character counter bottom-right: "47/100". Placeholder: "Hey there! I'm using ChatSphere" |
| Phone Number | Text input, `height: 44px` | Optional. Label: "Phone Number (optional)". Placeholder "+923001234567". Hint below: "Stored for future features. Not verified." |

#### Section D — Save Button

| Element | Details |
|---|---|
| Save Changes button | Full width, `height: 44px`, primary green. Disabled when no fields have changed. Spinner + "Saving…" while request in flight |
| Success state | Button briefly shows "✓ Saved" with a green checkmark animation, then returns to normal. Toast: "Profile updated." |

#### Section E — Preferences (below form, divider)

| Setting | Details |
|---|---|
| "Theme" toggle row | Label "Theme" left. Toggle switch right: "Light" / "Dark". Persist in localStorage |
| "Sound Alerts" toggle row | Label "Sound Alerts for new messages". Toggle switch. Persist in localStorage |
| "Notifications" row | Label "Browser Notifications". Status chip: "Enabled" (green) / "Disabled" (grey) / "Blocked by browser" (amber). "Enable" button shown if status is disabled/default. Clicking triggers browser permission request |

#### Section F — Danger Zone (bottom, separated by red divider)

| Element | Details |
|---|---|
| Section label | "Account", `--text-md`, `--color-danger` |
| Logout button | Full-width, outline border, `--color-danger` text, door icon. Triggers `POST /api/auth/logout` |

---

## 10. Media Viewer — Lightbox Overlay

**Trigger:** Clicking any image or video thumbnail inside a message bubble.
**Layout:** Full-screen overlay, background `rgba(0, 0, 0, 0.92)`. Centered content. `z-index: 9999`.

### Elements

| Element | Position | Details |
|---|---|---|
| Close button (×) | Top-right corner | `32px`, white, semi-transparent background on hover |
| Sender info | Top-left | Sender avatar `28px` + sender name `--text-sm` white + timestamp `--text-xs` white opacity 0.6 |
| Media content | Centered | For images: `max-width: 90vw`, `max-height: 85vh`, `object-fit: contain`. For videos: `<video>` element with controls, `max-width: 90vw` |
| Download button | Top-right (left of close) | Download icon, white, tooltip "Download". Triggers file download via anchor tag |
| Navigation arrows (if multiple media in chat) | Left and right sides | Chevron-left / chevron-right, `48px` circular semi-transparent buttons. Navigate to previous/next media item in the conversation |
| Caption | Below media, centered | If the message had a caption: `--text-sm`, white. Otherwise hidden |

**Keyboard:** `Escape` closes. `ArrowLeft` / `ArrowRight` navigates.

---

## 11. Notification Permission Banner

**Trigger:** First visit to `/chat` after login, when `Notification.permission === "default"`.
**Layout:** Fixed banner at the top of the chat dashboard (below the top of the sidebar — not the header). Width: full sidebar width. Or as a toast-style banner at the top of the page. Dismissable.

### Elements

| Element | Position | Details |
|---|---|---|
| Bell icon | Left | `20px`, `--color-primary` |
| Message text | Center-left | `--text-sm`: "Enable notifications to get alerts for new messages." |
| Enable button | Right | Small primary button: "Enable", `height: 28px`, `--radius-sm` |
| Dismiss (×) | Far right | Icon button. Stores dismissal in localStorage. Banner does not reappear in the same session |
| Background | — | `--color-bg-base` or a very light green tint, border-bottom `1px --color-border` |

---

## 12. Message Context Menu

**Trigger:** Right-click (desktop) or long-press `500ms` (touch) on any message bubble.
**Layout:** Floating dropdown, `width: 180px`, `shadow-sm`, `border-radius: --radius-md`, background `--color-bg-surface`, positioned adjacent to the message bubble (smart positioning: avoids viewport edges).

### Menu Items

| Item | Icon | Color | Condition |
|---|---|---|---|
| "Delete for me" | Trash icon | `--color-danger` | All messages, all participants |
| "Reply" (phase 2) | Reply icon | `--color-text-primary` | All messages. Disabled/greyed in MVP |
| "Copy Text" | Copy icon | `--color-text-primary` | Text messages only |
| "Forward" (phase 2) | Forward icon | `--color-text-primary` | All messages. Disabled/greyed in MVP |
| "Download" | Download icon | `--color-text-primary` | Media messages only |
| "Message Info" | Info icon | `--color-text-primary` | Outgoing messages only. Shows full delivery/read status details |

Menu item height: `40px`. Padding: `0 12px`. Hover: `--color-bg-base` background. Divider `1px` line before danger actions.

**Dismiss:** Clicking anywhere outside the context menu closes it. `Escape` key also closes it.

---

## 13. Delete Confirmation Dialog

**Trigger:** Selecting "Delete for me" from the message context menu.
**Layout:** Small modal dialog, `width: 360px`, centered, `shadow-md`, `border-radius: --radius-md`. Backdrop `rgba(0,0,0,0.3)`.

### Elements

| Element | Details |
|---|---|
| Title | "Delete Message?", `--text-md`, bold |
| Body text | `--text-sm`, secondary: "This message will be removed from your view only. Other participants can still see it." |
| Cancel button | Left. Ghost button: "Cancel". Closes dialog, no action |
| Delete button | Right. Filled `--color-danger` background: "Delete for Me". Triggers API call. Spinner while loading |

---

## 14. Toast Notification System

**Layout:** Fixed position, `top: 16px`, `right: 16px`, stacked vertically with `8px` gap. `z-index: 9998`. Max 3 toasts visible at once; older ones slide out when a 4th appears.

**Toast Item — `min-width: 280px`, `max-width: 360px`**

| Element | Details |
|---|---|
| Container | `border-radius: --radius-md`, `shadow-sm`, `padding: 12px 16px`, background by type (see below) |
| Icon | Left side, `20px`. Type-specific icon |
| Message text | Right of icon. `--text-sm`. One or two lines max |
| Close button | Far right, × icon, `16px`. Optional — toasts also auto-dismiss |
| Auto-dismiss timer | Progress bar at the bottom of the toast: thin line draining left-to-right. Default: 4 seconds |

**Toast Types:**

| Type | Background | Icon | Border-left |
|---|---|---|---|
| Success | White or `#F0FDF4` | ✓ Checkmark, green | `4px solid --color-primary` |
| Error | White or `#FEF2F2` | ⚠ Warning, red | `4px solid --color-danger` |
| Info | White or `#EFF6FF` | ℹ Info, blue | `4px solid --color-info` |
| Warning | White or `#FFFBEB` | ⚡ Warning, amber | `4px solid #F59E0B` |

**Common Toast Messages:**

- Success: "Profile updated.", "Message deleted.", "Group created."
- Error: "Something went wrong. Please try again.", "Media upload failed.", "Invalid email or password."
- Info: "1 new message ↓", "Your session has expired."
- Warning: "Too many login attempts. Try again in 5 minutes."

---

## 15. Session Expired Screen / Redirect

**Trigger:** JWT expired or invalidated mid-session (detected by a `401` response).
**Behavior:** Not a separate full-screen page — the user is redirected to `/login`. However, the login page shows a contextual banner.

### Session Expired Banner on Login Page

Already described in Section 2 (Login Screen), but repeated here for completeness:

| Element | Details |
|---|---|
| Banner position | Below the form heading, above the first input field |
| Background | Amber/yellow `#FEF3C7` |
| Left border | `4px solid #F59E0B` |
| Icon | Clock or warning icon, `16px`, amber |
| Text | `--text-sm`: "Your session has expired. Please sign in again." |
| Auto-dismiss | Does not auto-dismiss. Remains until user submits the form or navigates away |

Additionally, a toast appears on the redirect: "Session expired. Please log in."

---

## 16. Responsive Behaviour — Mobile Breakpoints

ChatSphere uses a **mobile-first** layout approach. The following breakpoints apply:

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single-column: sidebar is full screen. Selecting a chat navigates to full-screen chat view |
| Tablet | 768px – 1023px | Two-column layout but sidebar reduced to `280px`. Chat header may abbreviate some icons |
| Desktop | ≥ 1024px | Full two-column layout as designed above |

### Mobile-Specific Differences

**Chat List (Mobile):**
- Sidebar takes full viewport width and height.
- No right panel visible.
- Tapping a chat item navigates to a full-screen chat view (push navigation, browser history entry added).

**Active Chat (Mobile):**
- Full viewport width and height.
- Header has a back arrow (chevron-left) on the far left, navigating back to the chat list.
- Bottom input bar uses safe-area insets (`env(safe-area-inset-bottom)`) for notched phones.
- Virtual keyboard pushes the input bar up (viewport resize or CSS `dvh` units).

**Modals (Mobile):**
- New Group modal becomes a full-screen bottom-sheet (slides up from bottom).
- Group Info / Contact Info panels become full-screen slide-in.
- Lightbox is already full-screen.

**Sidebar Header Icons (Mobile):**
- Only the compose icon and the more-options (⋮) are shown to save space.

**Bottom Navigation Bar (Mobile, optional):**
An optional fixed bottom bar with icon tabs: "Chats" (active), "Status (phase 2)", "Calls (phase 2)", "Profile". This pattern (like WhatsApp) is a common mobile enhancement. In MVP, only "Chats" and "Profile" are functional.

---

## 17. Loading & Skeleton States

### Page Load — Chat Dashboard

When the dashboard first loads after login, before data arrives from the API:

**Sidebar skeleton:**
- Header zone: placeholder grey bar for name `120px × 14px` + circular grey `32px` for avatar.
- Search bar: grey rounded rectangle full width.
- Chat list: 6 skeleton chat items. Each has:
  - Circular grey `48px` on left.
  - Two grey bars stacked: `120px × 14px` (name) + `200px × 12px` (preview).
  - Small grey bar `40px × 10px` top-right (timestamp).
  - All animated with CSS shimmer (`background: linear-gradient(90deg, #eee, #ddd, #eee)`, `background-size: 200%`, `animation: shimmer 1.5s infinite`).

**Right panel:** Shows the Empty/Welcome state immediately (no skeleton needed since no data is expected there yet).

### Message List Load

When a chat is first opened:
- Message area shows 8–10 skeleton bubbles of varying widths (alternating right/left alignment).
- Each bubble: grey rounded rectangle, `60-200px` wide, `36px` tall.
- Shimmer animation same as sidebar.
- After messages load, skeletons fade out and real messages fade in (`opacity 0→1`, `150ms`).

### Sending a Message (Optimistic)

- Message appears in the bubble immediately upon Send, before server confirmation.
- Shows a single grey clock/spinner icon instead of tick icons while pending.
- On server confirmation: spinner replaced by ✓ sent tick.
- On failure: bubble turns slightly red with a retry icon (⟳). Tooltip: "Failed to send. Tap to retry."

### Uploading Media

- Progress bar in the media preview zone (above input bar) fills from 0% to 100%.
- Send button disabled during upload.
- Upload percentage shown: "Uploading… 47%".

---

## 18. Empty States

Each empty state follows a consistent pattern: centered illustration/icon + heading + sub-text + optional CTA button.

| Screen / Zone | Icon | Heading | Sub-text | CTA |
|---|---|---|---|---|
| Chat list (no chats) | Speech bubble with + | "No chats yet" | "Start a conversation by searching for someone." | "New Chat" button |
| Chat area (chat selected but no messages) | Message bubbles outline | "No messages yet" | "Send a message to start the conversation." | — (focus goes to input) |
| User search (no results) | Magnifier with × | "No users found" | "Try a different name or email address." | — |
| Shared media in contact info (none) | Image outline | "No shared media" | "Images and files shared in this chat will appear here." | — |
| Group participants (empty — should not occur) | People outline | "No members" | — | — |
| Beginning of conversation label | — | — | "— Beginning of conversation —" | — (chip, not a full state) |

---

*ChatSphere UI Screens Specification v1.0 · MVP · Web Application · Next.js + TailwindCSS*
