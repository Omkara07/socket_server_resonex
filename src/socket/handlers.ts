import { Server, Socket } from "socket.io";
import { prismaClient } from "../prismaClient";


export const HandleJoinRoomSocket = (socket: Socket, io: Server) => {
    socket.on("join-room", ({ roomId, userName, roomName }) => {
        console.log("someone joined the room", roomId);
        socket.join(roomId);

        socket.to(roomId).emit("joined-message", `${userName} joined ${roomName}`);
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
            // const streams = await prismaClient.stream.findMany({
            //     where: {
            //         roomId: roomId,
            //         played: false
            //     },
            //     include: {
            //         _count: {
            //             select: {
            //                 upvotes: true
            //             }
            //         },
            //         upvotes: {
            //             where: {
            //                 userId: userId
            //             }
            //         }
            //     }
            // });

            // // 🔥 Fix: Map streams to ensure `upvotes` is an integer
            // const formattedStreams = streams.map(({ _count, ...rest }) => ({
            //     ...rest,
            //     upvotes: _count.upvotes,
            //     haveUpvoted: rest.upvotes.length ? true : false
            // }));

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


    socket.on('request-player-state', ({ roomId }) => {
        socket.to(roomId).emit('request-player-state');
    });

    socket.on('player-state', ({ roomId, state }) => {
        socket.to(roomId).emit('player-state', { state });
    });

    socket.on('player-sync', ({ roomId, syncState }) => {
        socket.to(roomId).emit('player-sync', { syncState });
    });

    socket.on('request-sync', ({ roomId }) => {
        socket.to(roomId).emit('request-sync');
    });

}