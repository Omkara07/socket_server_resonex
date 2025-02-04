import { Server, Socket } from "socket.io";
import { prismaClient } from "../prismaClient";

const rooms = new Map();

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

        const room = rooms.get(roomId);
        room.activeUsers.add(socket.id);

        // If we have a stored state, send it immediately
        if (room.currentPlayerState) {
            socket.emit('host-player-state', { state: room.currentPlayerState });
        }

        io.to(roomId).emit('joined-message', `${userName} joined ${roomName}`);
    });

};

export const HandleleaveRoomSocket = (socket: Socket, io: Server) => {
    socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId);
        socket.to(roomId).emit("left-message", `A user left the room`);
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