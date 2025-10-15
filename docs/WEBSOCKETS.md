# WebSockets and Real-Time Features

This document explains the WebSocket and real-time communication features implemented in Phase 4.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Socket.IO Server](#socketio-server)
4. [Client Hooks](#client-hooks)
5. [Push Notifications](#push-notifications)
6. [Real-Time Chat](#real-time-chat)
7. [Usage Examples](#usage-examples)
8. [Configuration](#configuration)

## Overview

Phase 4 implements comprehensive real-time features including:

- **WebSocket Communication**: Bi-directional real-time messaging using Socket.IO
- **Streaming Responses**: AI responses stream in real-time like ChatGPT
- **Typing Indicators**: See when agents or users are typing
- **Presence Tracking**: Online/offline/away status tracking
- **Push Notifications**: Web push notifications for important events
- **Optimistic Updates**: Instant UI updates with background sync

## Architecture

### Custom Next.js Server

The application uses a custom Next.js server (`server.js`) that integrates Socket.IO:

```javascript
// server.js
const server = createServer(async (req, res) => {
  await handle(req, res, parsedUrl);
});

// Initialize Socket.IO after Next.js is ready
initSocketServer(server);
```

### Event Flow

```
Client                 Socket.IO Server              Backend
  |                         |                           |
  |----- chat:message ----->|                           |
  |                         |---- Authenticate -------->|
  |                         |<--- User Verified --------|
  |                         |                           |
  |                         |---- Generate Response --->|
  |<-- chat:message:stream -|<---- Stream Chunks -------|
  |<-- chat:message:stream -|                           |
  |<-- chat:message:stream -|                           |
  |<- chat:message:complete |<---- Complete ------------|
  |                         |                           |
  |<-- relation:updated ----|<---- Update Emotions -----|
```

## Socket.IO Server

### Location
`lib/socket/server.ts`

### Key Features

1. **Authentication Middleware**
   - Validates API key on connection
   - Attaches userId to socket
   - Rate limiting per user plan

2. **Room Management**
   - User rooms: `user:{userId}`
   - Agent rooms: `agent:{agentId}`
   - Chat rooms: `chat:{agentId}:{userId}`
   - Global room: `global`

3. **Event Handlers**
   - `chat:join` - Join agent chat room
   - `chat:leave` - Leave agent chat room
   - `chat:message` - Send message with streaming response
   - `chat:typing` - Send typing indicator
   - `agent:subscribe` - Subscribe to agent updates
   - `presence:online` - Mark user as online
   - `presence:offline` - Mark user as offline

### Streaming Implementation

Messages are streamed word-by-word to simulate real-time generation:

```typescript
const words = response.split(" ");
const chunkSize = 3;

for (let i = 0; i < words.length; i += chunkSize) {
  const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
  io.to(roomName).emit("chat:message:stream", {
    agentId,
    messageId,
    chunk,
    index: chunkIndex++,
    timestamp: Date.now(),
  });
  await new Promise(resolve => setTimeout(resolve, 50));
}
```

## Client Hooks

### useSocket

Main hook for Socket.IO connection management.

**Location**: `hooks/useSocket.ts`

**Usage**:
```typescript
const { socket, isConnected, emit, on, off } = useSocket({
  token: apiKey,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
});

// Emit event
emit("chat:message", { agentId, message, userId });

// Listen to event
on("chat:message", (data) => {
  console.log("New message:", data);
});
```

### useChatSocket

Specialized hook for chat-specific operations.

**Location**: `hooks/useSocket.ts`

**Usage**:
```typescript
const { sendMessage, sendTyping, on, off } = useChatSocket(
  agentId,
  userId,
  apiKey
);

// Send message
sendMessage("Hello!");

// Send typing indicator
sendTyping(true); // Start typing
sendTyping(false); // Stop typing
```

### useTyping

Hook for managing typing indicators with auto-timeout.

**Location**: `hooks/useTyping.ts`

**Usage**:
```typescript
const { isTyping, startTyping, stopTyping } = useTyping({
  onTypingStart: () => console.log("Started typing"),
  onTypingStop: () => console.log("Stopped typing"),
  timeout: 3000, // Auto-stop after 3 seconds
});
```

### usePresence

Hook for tracking user presence (online/offline/away).

**Location**: `hooks/usePresence.ts`

**Usage**:
```typescript
const {
  presence,
  isUserOnline,
  getUserStatus,
  getLastSeen,
} = usePresence({ userId, token: apiKey });

const status = getUserStatus("user-123"); // "online" | "offline" | "away"
const online = isUserOnline("user-123"); // boolean
const lastSeen = getLastSeen("user-123"); // timestamp
```

## Push Notifications

### VAPID Keys

Generate VAPID keys for web push:

```bash
npx web-push generate-vapid-keys
```

Add to `.env`:
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@yourapp.com
```

### Service Worker

**Location**: `public/sw.js`

Handles push events and notification clicks:

```javascript
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    actions: data.actions,
  });
});
```

### Client-Side Functions

**Location**: `lib/notifications/client.ts`

```typescript
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed,
} from "@/lib/notifications/client";

// Subscribe
await subscribeToPushNotifications();

// Check status
const isSubscribed = await isPushSubscribed();

// Unsubscribe
await unsubscribeFromPushNotifications();
```

### Server-Side Functions

**Location**: `lib/notifications/push.ts`

```typescript
import {
  sendPushNotification,
  notifyAgentMessage,
  notifySubscriptionExpiring,
} from "@/lib/notifications/push";

// Send custom notification
await sendPushNotification(userId, {
  title: "Hello!",
  body: "This is a push notification",
  icon: "/icon.png",
});

// Send agent message notification
await notifyAgentMessage(userId, "Agent Name", "Message preview...");

// Send subscription expiry warning
await notifySubscriptionExpiring(userId, 3); // 3 days remaining
```

## Real-Time Chat

### RealTimeChatInterface Component

**Location**: `components/chat/RealTimeChatInterface.tsx`

Full-featured chat component with:
- Streaming responses
- Typing indicators
- Connection status
- Optimistic updates
- Emotional state updates

**Usage**:
```tsx
<RealTimeChatInterface
  agentId={agent.id}
  agentName={agent.name}
  userId={user.id}
  apiKey={user.apiKey}
  initialMessages={messages}
  initialEmotions={emotions}
  initialRelationLevel={relationLevel}
  initialRelationState={relationState}
/>
```

## Usage Examples

### Complete Chat Integration

```tsx
"use client";

import { useState, useEffect } from "react";
import { RealTimeChatInterface } from "@/components/chat/RealTimeChatInterface";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

export default function AgentChatPage({ params }) {
  const [agent, setAgent] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch agent and user data
    fetchAgentAndUser();
  }, []);

  return (
    <div>
      <NotificationSettings />

      {agent && user && (
        <RealTimeChatInterface
          agentId={agent.id}
          agentName={agent.name}
          userId={user.id}
          apiKey={user.apiKey}
          initialMessages={agent.messages}
        />
      )}
    </div>
  );
}
```

### Manual Socket.IO Usage

```tsx
"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

export function CustomComponent() {
  const { socket, isConnected, emit, on, off } = useSocket({
    token: "your-api-key",
  });

  useEffect(() => {
    if (!socket) return;

    // Subscribe to events
    const handleMessage = (data) => {
      console.log("Message received:", data);
    };

    on("chat:message", handleMessage);

    return () => {
      off("chat:message", handleMessage);
    };
  }, [socket, on, off]);

  const sendMessage = () => {
    emit("chat:message", {
      agentId: "agent-123",
      message: "Hello!",
      userId: "user-123",
    });
  };

  return (
    <div>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# WebSockets
ENABLE_WEBSOCKETS=true  # Set to false to disable WebSocket server

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@example.com
```

### Running the Server

Development:
```bash
npm run dev  # Uses custom server with WebSockets
```

Production:
```bash
npm run build
npm start  # Uses custom server
```

To run without WebSockets (fallback to standard Next.js):
```bash
npm run dev:next  # Standard Next.js dev server
npm run start:next  # Standard Next.js production server
```

### Connection URL

Default: `http://localhost:3000/api/socketio`

Configure in `lib/socket/events.ts`:
```typescript
const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SOCKET_PATH = "/api/socketio";
```

## Troubleshooting

### Connection Fails

1. Check that custom server is running (`npm run dev`)
2. Verify API key is valid
3. Check browser console for errors
4. Verify WebSocket port is not blocked

### Push Notifications Don't Work

1. Ensure HTTPS (required for push)
2. Check VAPID keys are configured
3. Verify service worker is registered
4. Check notification permissions in browser

### Streaming is Slow

Adjust chunk size and delay in `lib/socket/server.ts`:

```typescript
const chunkSize = 5; // Larger chunks
await new Promise(resolve => setTimeout(resolve, 25)); // Faster
```

## Future Enhancements

- [ ] Voice/video calling support
- [ ] File sharing in chat
- [ ] Offline message queue
- [ ] Multi-device sync
- [ ] Read receipts
- [ ] Message reactions
- [ ] Group chat support
- [ ] End-to-end encryption
