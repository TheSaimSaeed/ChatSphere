import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../jwt';
import * as cookie from 'cookie';
import User from '../models/User';
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

        // We'll add remaining events in Slice 4 and Slice 8
    });

    return io;
}
