import express from "express"
import { configDotenv } from "dotenv"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"
import groupRoutes from "./routes/group.route.js"
import dbConfig from "./config/db.config.js"
import cookieParser from "cookie-parser";
import { createServer } from 'node:http'
import { Server } from 'socket.io';
import socketAuthenticated from "./config/socket.auth.js"
import connectionHandlers from "./connection/connection.handler.js"
import cors from "cors"
await dbConfig;
configDotenv()

const app = express();
const corsOptions = {
    origin: ['http://localhost:5173','https://hhcm64c5-5173.inc1.devtunnels.ms'],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Changed to an array
    credentials: true,                                         // Allow cookies and auth headers
    optionsSuccessStatus: 204,                                  // For legacy browser preflight support
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

app.use(express.urlencoded())
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/chats", chatRoutes)
app.use("/api/v1/groups", groupRoutes)

const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions
});
io.use(socketAuthenticated);
io.on("connection", (socket) => {
    console.log("connection established")

    connectionHandlers(socket)
})
export { io };

const port = process.env.PORT

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
