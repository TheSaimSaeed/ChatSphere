import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../jwt';
import * as cookie from 'cookie';
import User from '../models/User';
import Chat from '../models/Chat';
import { SOCKET_EVENTS } from './events';

/** Initializes the Socket.io server and auth middleware */
export function initSocketServer(httpServer: HttpServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Verify JWT on connection
    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies['session.token'];
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = verifyToken(token);
            // @ts-ignore
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        // @ts-ignore
        const userId = socket.userId;
        console.log('LOG: [socket:server] client connected', { userId, socketId: socket.id });

        // Join personal room to receive messages even when a chat isn't open
        socket.join(userId.toString());

        try {
            await User.findByIdAndUpdate(userId, { isOnline: true });
            io.emit(SOCKET_EVENTS.PRESENCE_ONLINE, { userId });
        } catch (err) {
            console.error('ERROR: [socket:server] Failed to set user online', err);
        }

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

        socket.on('join_room', (chatId: string) => {
            socket.join(chatId);
        });

        socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data: any) => {
            try {
                // data = { chatId, type, content, mediaId }
                const { sendMessage } = await import('../services/messageService');
                let message = await sendMessage(userId, data);

                const chat = await Chat.findById(data.chatId);
                if (chat) {
                    const { markMessageAsDelivered } = await import('../services/messageService');
                    const deliveredTo: string[] = [];

                    chat.participants.forEach(pId => {
                        const pIdStr = pId.toString();
                        if (pIdStr !== userId.toString()) {
                            io.to(pIdStr).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
                            // If they have any connected sockets, consider it delivered
                            const sockets = io.sockets.adapter.rooms.get(pIdStr);
                            if (sockets && sockets.size > 0) {
                                deliveredTo.push(pIdStr);
                            }
                        }
                    });

                    if (deliveredTo.length > 0) {
                        message = await markMessageAsDelivered(message._id.toString(), deliveredTo) as any;
                    }
                } else {
                    socket.to(data.chatId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
                }

                if (data.tempId) {
                    (message as any).tempId = data.tempId;
                }

                socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, message);

            } catch (err: any) {
                console.error('ERROR: [socket:server] Failed to send message', err);
            }
        });

        socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data: { chatId: string }) => {
            try {
                const { markMessagesAsRead } = await import('../services/messageService');
                await markMessagesAsRead(userId, data.chatId);

                const chat = await Chat.findById(data.chatId);
                if (chat) {
                    chat.participants.forEach(pId => {
                        const pIdStr = pId.toString();
                        if (pIdStr !== userId.toString()) {
                            io.to(pIdStr).emit(SOCKET_EVENTS.MESSAGE_READ, { chatId: data.chatId, readBy: userId });
                        }
                    });
                }
            } catch (err) {
                console.error('ERROR: [socket:server] Failed to handle message read', err);
            }
        });

        socket.on(SOCKET_EVENTS.TYPING_START, async (data: { chatId: string }) => {
            const chat = await Chat.findById(data.chatId).populate('participants', 'name');
            if (chat) {
                const user = (chat.participants as any[]).find(p => (typeof p === 'object' ? p._id : p).toString() === userId.toString());
                chat.participants.forEach(p => {
                    const pIdStr = (typeof p === 'object' ? p._id : p).toString();
                    if (pIdStr !== userId.toString()) {
                        io.to(pIdStr).emit(SOCKET_EVENTS.TYPING_START, { chatId: data.chatId, userId, name: user?.name || 'User' });
                    }
                });
            }
        });

        socket.on(SOCKET_EVENTS.TYPING_STOP, async (data: { chatId: string }) => {
            const chat = await Chat.findById(data.chatId);
            if (chat) {
                chat.participants.forEach(pId => {
                    const pIdStr = pId.toString();
                    if (pIdStr !== userId.toString()) {
                        io.to(pIdStr).emit(SOCKET_EVENTS.TYPING_STOP, { chatId: data.chatId, userId });
                    }
                });
            }
        });
    });

    return io;
}
