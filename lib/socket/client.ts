import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** 
 * Connects and maintains the Socket.io client singleton.
 */
export function getSocketClient(): Socket {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
            autoConnect: false,
            withCredentials: true,
        });
    }
    return socket;
}

export function connectSocket() {
    const s = getSocketClient();
    if (!s.connected) {
        s.connect();
    }
}

export function disconnectSocket() {
    if (socket?.connected) {
        socket.disconnect();
    }
}
