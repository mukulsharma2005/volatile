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
    origin: ["https://mukulsharma2005.github.io/volatile"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies and authentication headers
    optionsSuccessStatus: 204 // For preflight requests
};
app.use(cors(corsOptions));
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
app.use(express.urlencoded())
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/chats", chatRoutes)
app.use("/api/v1/groups", groupRoutes)

const port = process.env.PORT

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
