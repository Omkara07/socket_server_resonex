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