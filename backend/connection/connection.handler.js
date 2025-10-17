import joinRoom from "./handlers/joinRoom.handler.js";
import markRead from "./handlers/markRead.handler.js";
import sendMessage from "./handlers/sendMessage.handler.js";
import disconnectHandler from "./handlers/disconnect.handler.js";
import isOnline from "./handlers/isOnline.handler.js";
import userModel from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import { io } from "../index.js";
const usersMap = {};
export { usersMap };
export default async function connectionHandlers(socket) {
    if (usersMap[socket.userId]) {
        delete usersMap[socket.userId]
    }
    usersMap[socket.userId] = socket.id;
    try {
        const user_id = socket.userId;
        await userModel.findByIdAndUpdate(user_id, { $set: { presence: { online: true } } });
        const chats = await chatModel.find({
            $or: [
                { createdBy: user_id },
                { createdFor: { $in: [user_id] } },
            ], type: "single",
        }).lean();
        const friends = []
        chats.forEach(chat => {
            if (chat.createdBy.toString() != user_id && !friends.includes(chat.createdBy.toString())) {
                friends.push(chat.createdBy.toString());
            } else {
                if (!friends.includes(chat.createdFor[0].toString())) {
                    friends.push(chat.createdFor[0].toString());
                }
            }
        });
        friends.forEach(friend => {
            const socketId = usersMap[friend];
            if (socketId) {
                io.to(socketId).emit("user_online", user_id);
            }
        })
    } catch (error) {
        console.log(error);
    }
    socket.on("join_room", (chat_id) => joinRoom(socket, chat_id))
    socket.on("is_read", (msg_id) => markRead(socket, msg_id))
    socket.on("chat_message", (message, callback) => sendMessage(socket, message, callback));
    socket.on("disconnect", () => disconnectHandler(socket));
    socket.on("is_online", (user_id) => isOnline(socket, user_id));
}