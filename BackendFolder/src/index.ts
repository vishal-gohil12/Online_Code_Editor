import express from "express";
import { config } from 'dotenv';
import cors from "cors";
import { Server } from "socket.io"
import { roomRoute } from "./routes/room";

config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api/v1/room", roomRoute);


const httpServer = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});

const io = new Server(httpServer);

const socketMap: { [key: string]: string | null } = {}

const getAllClients = (roomId: string) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: socketMap[socketId]
        };
    })
}
io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on("join", ({ roomId, username }: { roomId: string, username: string | null }) => {
        socketMap[socket.id] = username;
        socket.join(roomId);

        const client = getAllClients(roomId);

        client.forEach(({ socketId }) => {
            io.to(socketId).emit("joined", {
                socketId: socket.id,
                username,
                client
            });
        });
    });

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('leave', {
                socket: socket.id,
                username: socketMap[socket.id]
            });
            socket.leave(socket.id);
        });
        delete socketMap[socket.id];
    });

    socket.on('code-change', ({ roomId, code }) => {
        socket.in(roomId).emit('code-change', { code });
    });

    socket.on('code-sync', ({ code, socketId }) => {
        socket.in(socketId).emit('change', {
            code
        });
    });

    socket.on('output-change', ({ roomId, output }) => {
        socket.in(roomId).emit('output-change', { output });
    });
});

