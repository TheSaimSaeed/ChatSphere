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
} as const;
