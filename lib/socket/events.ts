/** All Socket.io event name constants used across client and server. */
export const SOCKET_EVENTS = {
    // Client → Server
    MESSAGE_SEND: 'message:send',
    MESSAGE_READ: 'message:read',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',

    // Server → Client
    MESSAGE_RECEIVE: 'message:receive',
    MESSAGE_DELIVERED: 'message:delivered',
    PRESENCE_ONLINE: 'presence:online',
    PRESENCE_OFFLINE: 'presence:offline',

    // Group events — Server → Client
    GROUP_MEMBER_ADDED: 'group:member_added',
    GROUP_MEMBER_REMOVED: 'group:member_removed',
    GROUP_MEMBER_LEFT: 'group:member_left',
    GROUP_SYSTEM_MESSAGE: 'group:system_message',
    CHAT_CREATED: 'chat:created',
} as const;
