import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../jwt';
import * as cookie from 'cookie';
import User from '../models/User';
import Chat from '../models/Chat';
import { SOCKET_EVENTS } from './events';

/** Module-level reference so API routes can emit events after the server starts. */
let _io: SocketIOServer | null = null;

/** Returns the shared Socket.io server instance. Throws if called before init. */
export function getIO(): SocketIOServer {
    if (!_io) throw new Error('Socket.io server not initialised yet');
    return _io;
}

/** Initializes the Socket.io server and auth middleware */
export function initSocketServer(httpServer: HttpServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    _io = io;

    // Verify JWT on every connection
    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies['session.token'];
            if (!token) return next(new Error('Authentication error'));
            const decoded = verifyToken(token);
            // @ts-ignore
            socket.userId = decoded.userId;
            next();
        } catch {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        // @ts-ignore
        const userId = socket.userId as string;
        console.log('LOG: [socket:server] client connected', { userId, socketId: socket.id });

        // Join personal room (for direct events)
        socket.join(userId.toString());

        // Join all group rooms this user is a member of
        try {
            const groups = await Chat.find({ isGroup: true, participants: userId }).select('_id').lean();
            groups.forEach((g) => socket.join(g._id.toString()));
        } catch (err) {
            console.error('ERROR: [socket:server] Failed to join group rooms', err);
        }

        // Mark online
        try {
            await User.findByIdAndUpdate(userId, { isOnline: true });
            io.emit(SOCKET_EVENTS.PRESENCE_ONLINE, { userId });
        } catch (err) {
            console.error('ERROR: [socket:server] Failed to set user online', err);
        }

        // ── Disconnect ─────────────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log('LOG: [socket:server] client disconnected', { userId, socketId: socket.id });
            try {
                const lastSeen = new Date();
                await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
                io.emit(SOCKET_EVENTS.PRESENCE_OFFLINE, { userId, lastSeen });
            } catch (err) {
                console.error('ERROR: [socket:server] Failed to set user offline', err);
            }
        });

        // ── Manual room join (legacy — client can call this too) ───
        socket.on('join_room', (chatId: string) => {
            socket.join(chatId);
        });

        // ── Message send ───────────────────────────────────────────
        socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data: any) => {
            try {
                const { sendMessage } = await import('../services/messageService');
                let message = await sendMessage(userId, data);

                const chat = await Chat.findById(data.chatId);
                if (chat) {
                    const { markMessageAsDelivered } = await import('../services/messageService');
                    const deliveredTo: string[] = [];

                    chat.participants.forEach((pId) => {
                        const pIdStr = pId.toString();
                        if (pIdStr !== userId.toString()) {
                            io.to(pIdStr).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
                            const sockets = io.sockets.adapter.rooms.get(pIdStr);
                            if (sockets && sockets.size > 0) {
                                deliveredTo.push(pIdStr);
                            }
                        }
                    });

                    if (deliveredTo.length > 0) {
                        message = (await markMessageAsDelivered(
                            message._id.toString(),
                            deliveredTo,
                        )) as any;
                    }
                } else {
                    socket.to(data.chatId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
                }

                if (data.tempId) {
                    (message as any).tempId = data.tempId;
                }

                socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, message);
            } catch (err) {
                console.error('ERROR: [socket:server] Failed to send message', err);
            }
        });

        // ── Message read ───────────────────────────────────────────
        socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data: { chatId: string }) => {
            try {
                const { markMessagesAsRead } = await import('../services/messageService');
                await markMessagesAsRead(userId, data.chatId);

                const chat = await Chat.findById(data.chatId);
                if (chat) {
                    chat.participants.forEach((pId) => {
                        const pIdStr = pId.toString();
                        if (pIdStr !== userId.toString()) {
                            io.to(pIdStr).emit(SOCKET_EVENTS.MESSAGE_READ, {
                                chatId: data.chatId,
                                readBy: userId,
                            });
                        }
                    });
                }
            } catch (err) {
                console.error('ERROR: [socket:server] Failed to handle message read', err);
            }
        });

        // ── Typing ─────────────────────────────────────────────────
        socket.on(SOCKET_EVENTS.TYPING_START, async (data: { chatId: string }) => {
            const chat = await Chat.findById(data.chatId).populate('participants', 'name');
            if (chat) {
                const self = (chat.participants as any[]).find(
                    (p) => (typeof p === 'object' ? p._id : p).toString() === userId.toString(),
                );
                chat.participants.forEach((p) => {
                    const pIdStr = (typeof p === 'object' ? p._id : p).toString();
                    if (pIdStr !== userId.toString()) {
                        io.to(pIdStr).emit(SOCKET_EVENTS.TYPING_START, {
                            chatId: data.chatId,
                            userId,
                            name: self?.name || 'User',
                        });
                    }
                });
            }
        });

        socket.on(SOCKET_EVENTS.TYPING_STOP, async (data: { chatId: string }) => {
            const chat = await Chat.findById(data.chatId);
            if (chat) {
                chat.participants.forEach((pId) => {
                    const pIdStr = pId.toString();
                    if (pIdStr !== userId.toString()) {
                        io.to(pIdStr).emit(SOCKET_EVENTS.TYPING_STOP, {
                            chatId: data.chatId,
                            userId,
                        });
                    }
                });
            }
        });
    });

    return io;
}

/**
 * Emits CHAT_CREATED to every new member of a freshly created group.
 * Call from the /api/chats/group POST route after saving to DB.
 */
export function emitGroupCreated(chat: any) {
    try {
        const io = getIO();
        chat.participants.forEach((p: any) => {
            const pId = typeof p === 'object' ? p._id.toString() : p.toString();
            io.to(pId).emit(SOCKET_EVENTS.CHAT_CREATED, chat);
        });
    } catch {
        // Socket server may not be running in test/build envs
    }
}

/**
 * Emits GROUP_MEMBER_ADDED to all remaining group members.
 */
export function emitMemberAdded(chat: any) {
    try {
        const io = getIO();
        chat.participants.forEach((p: any) => {
            const pId = typeof p === 'object' ? p._id.toString() : p.toString();
            io.to(pId).emit(SOCKET_EVENTS.GROUP_MEMBER_ADDED, { chat });
        });
    } catch { /* silent in build */ }
}

/**
 * Emits GROUP_MEMBER_REMOVED to all remaining members and the removed user.
 */
export function emitMemberRemoved(chat: any, removedUserId: string) {
    try {
        const io = getIO();
        // Notify remaining members
        chat.participants.forEach((p: any) => {
            const pId = typeof p === 'object' ? p._id.toString() : p.toString();
            io.to(pId).emit(SOCKET_EVENTS.GROUP_MEMBER_REMOVED, { chat, removedUserId });
        });
        // Notify the removed user too (so they can remove from sidebar)
        io.to(removedUserId).emit(SOCKET_EVENTS.GROUP_MEMBER_LEFT, {
            chatId: chat._id.toString(),
            userId: removedUserId,
        });
    } catch { /* silent */ }
}

/**
 * Emits GROUP_MEMBER_LEFT to all remaining members when someone voluntarily leaves.
 */
export function emitMemberLeft(chatId: string, userId: string, remainingParticipants: any[]) {
    try {
        const io = getIO();
        remainingParticipants.forEach((p: any) => {
            const pId = typeof p === 'object' ? p._id.toString() : p.toString();
            io.to(pId).emit(SOCKET_EVENTS.GROUP_MEMBER_LEFT, { chatId, userId });
        });
    } catch { /* silent */ }
}
