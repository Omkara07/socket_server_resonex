import { Server, Socket } from "socket.io";
import { prismaClient } from "../prismaClient";

const rooms = new Map<string, {
    activeUsers: Set<string>;
    currentPlayerState: any;
    hostId?: string;
    hostSocketId?: string;
}>();

export function handleUserLeaving(socket: any, roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.activeUsers.delete(socket.id);

    // If the leaving user was the host
    if (room.hostSocketId === socket.id) {
        room.currentPlayerState = null;
        room.hostSocketId = undefined;
        socket.to(roomId).emit('host-disconnected');
    }

    // Clean up empty rooms
    if (room.activeUsers.size === 0) {
        rooms.delete(roomId);
    }

    socket.leave(roomId);
}


export const HandleJoinRoomSocket = (socket: Socket, io: Server) => {
    // socket.on("join-room", ({ roomId, userName, roomName }) => {
    //     console.log("someone joined the room", roomId);
    //     socket.join(roomId);

    //     socket.to(roomId).emit("joined-message", `${userName} joined ${roomName}`);
    // });

    // When a user joins, immediately send them the current state if available
    socket.on('join-room', ({ roomId, userName, roomName }) => {
        socket.join(roomId);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                activeUsers: new Set(),
                currentPlayerState: null,
            });
        }

        const room = rooms.get(roomId)!;
        room.activeUsers.add(socket.id);

        // If this user is the host, store their socket ID
        if (socket.data.userId === room.hostId) {
            room.hostSocketId = socket.id;
        }

        if (room.currentPlayerState) {
            socket.emit('host-player-state', { state: room.currentPlayerState });
        }

        socket.to(roomId).emit('joined-message', `${userName} joined ${roomName}`);
    });

};

export const HandleleaveRoomSocket = (socket: Socket, io: Server) => {
    // socket.on("leave-room", (roomId: string) => {
    //     socket.leave(roomId);
    //     socket.to(roomId).emit("left-message", `A user left the room`);
    // });

    socket.on('host-leaving', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.currentPlayerState = null;
            room.hostSocketId = undefined;
            io.to(roomId).emit('host-disconnected');
        }
    });

    // Enhanced leave room handler
    socket.on('leave-room', (roomId) => {
        handleUserLeaving(socket, roomId);
    });
};

export const HandleSongQueueSocket = (socket: Socket, io: Server) => {
    socket.on('queue-update', async ({ roomId }) => {
        try {
            io.to(roomId).emit("updated-queue", { roomId });
        } catch (e) {
            console.log(e);
        }
    });

    socket.on('curStream-update', async ({ roomId, curStream }) => {
        try {
            io.to(roomId).emit('updated-activeStream', { activeStream: curStream });
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('played-streams-update', async ({ playedStreams, roomId }) => {
        try {

            io.to(roomId).emit('updated-playedStreams', { playedStreams });
        }
        catch (e) {
            console.log(e)
        }
    })
    socket.on('get-updated-played-streams', async ({ roomId }) => {
        try {
            const playedStreams = await prismaClient.stream.findMany({ where: { roomId: roomId ?? "", played: true } });
            io.to(roomId).emit('updated-playedStreams', { playedStreams });
        }
        catch (e) {
            console.log(e)
        }
    })
};

export const HandleVideoStateSocket = (socket: Socket, io: Server) => {
    socket.on('player-command', ({ roomId, command }) => {
        // Broadcast the command to all other clients in the room
        socket.to(roomId).emit('player-command', { command });
    });

    socket.on('client-ready', ({ roomId, userId }) => {
        // Broadcast to all clients in the room that this client is ready
        io.to(roomId).emit('client-ready', { userId });
    });


    // Handle initial state request from new users
    socket.on('request-initial-state', ({ roomId }) => {
        // Forward request to host
        socket.to(roomId).emit('request-initial-state');
    });

    // Handle host state broadcast
    socket.on('host-player-state', ({ roomId, state }) => {
        // Store current state in room data
        const room = rooms.get(roomId);
        if (room) {
            room.currentPlayerState = state;
        }
        // Broadcast to all clients except sender
        socket.to(roomId).emit('host-player-state', { state });
    });

}