import express, { Request, Response } from 'express';
import http from "http";
import { Server } from "socket.io";
import { HandleJoinRoomSocket, HandleleaveRoomSocket, HandleSongQueueSocket, HandleVideoStateSocket } from './socket/handlers';
import axios from 'axios';
import cors from "cors";

const app = express();
const server = http.createServer(app);


app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));

// Serve a basic route
app.get("/", (req: Request, res: Response) => {
    res.send("Socket.io Server is Running!");
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Access-Control-Allow-Origin"]
    }
});
// Socket.io connection handling

io.on("connection", (socket) => {
    console.log("socket is working successfully");
    console.log("all rooms ", io.sockets.adapter.rooms);

    socket.on("message", (data) => {
        socket.broadcast.emit("message", data);
    });

    HandleJoinRoomSocket(socket, io);
    HandleleaveRoomSocket(socket, io);
    HandleSongQueueSocket(socket, io);
    HandleVideoStateSocket(socket, io);
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

const PORT = 5000;

app.get("/self-call", (req: Request, res: Response) => {
    res.status(200).send("Server is alive!");
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running`);

    const SELF_CALL_INTERVAL = 840000;
    const SELF_URL = process.env.PING_URL || `http://localhost:${PORT}/self-call`;

    setInterval(async () => {
        try {
            await axios.get(SELF_URL);
        } catch (error: any) {
            console.error("Error during self-call:", error.message);
        }
    }, SELF_CALL_INTERVAL);
});


// ----- look tomorrow ------------
// import express, { Request, Response } from 'express';
// import http from "http";
// import { Server } from "socket.io";
// import { HandleJoinRoomSocket, HandleleaveRoomSocket, HandleSongQueueSocket, HandleVideoStateSocket } from './socket/handlers';
// import axios from 'axios';
// import cors from "cors";

// const app = express();
// const server = http.createServer(app);

// app.use(cors({
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true
// }));

// // Serve a basic route
// app.get("/", (req: Request, res: Response) => {
//     res.send("Socket.io Server is Running!");
// });

// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//         credentials: true,
//         allowedHeaders: ["Access-Control-Allow-Origin"]
//     },
//     pingTimeout: 60000, // 60 seconds
//     pingInterval: 25000, // 25 seconds
//     maxHttpBufferSize: 1e8, // 100 MB
// });

// // Socket.io connection handling
// io.on("connection", (socket) => {
//     console.log("socket is working successfully");
//     console.log("all rooms ", io.sockets.adapter.rooms);

//     socket.on("message", (data) => {
//         try {
//             socket.broadcast.emit("message", data);
//         } catch (error) {
//             console.error("Error handling message event:", error);
//         }
//     });

//     HandleJoinRoomSocket(socket, io);
//     HandleleaveRoomSocket(socket, io);
//     HandleSongQueueSocket(socket, io);
//     HandleVideoStateSocket(socket, io);

//     // Handle disconnection
//     socket.on("disconnect", () => {
//         console.log("A user disconnected:", socket.id);

//         // Clean up the user from all rooms
//         const rooms = io.sockets.adapter.sids.get(socket.id);
//         if (rooms) {
//             rooms.forEach(roomId => {
//                 socket.leave(roomId);
//                 console.log(`User ${socket.id} left room ${roomId}`);

//                 // Clean up empty rooms
//                 const room = io.sockets.adapter.rooms.get(roomId);
//                 if (room && room.size === 0) {
//                     io.sockets.adapter.rooms.delete(roomId);
//                     console.log(`Room ${roomId} deleted`);
//                 }
//             });
//         }
//     });
// });

// const PORT = 5000;

// app.get("/self-call", (req: Request, res: Response) => {
//     console.log("Self-call endpoint hit");
//     res.status(200).send("Server is alive!");
// });

// // Start the server
// server.listen(PORT, () => {
//     console.log(`Server is running`);

//     const SELF_CALL_INTERVAL = 840000; // 14 minutes
//     const SELF_URL = process.env.PING_URL || `http://localhost:${PORT}/self-call`;

//     setInterval(async () => {
//         try {
//             const response = await axios.get(SELF_URL);
//             console.log("Self-call successful:", response.data);
//         } catch (error: any) {
//             console.error("Error during self-call:", error.message);
//             // Optionally, send a notification (e.g., email, Slack) if the self-call fails
//         }
//     }, SELF_CALL_INTERVAL);
// });