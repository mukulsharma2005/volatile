import chatModel from "../../models/chat.model.js";
import messageModel from "../../models/message.model.js";
import { getUserFromSocket } from "../utils.js";

export default async function joinRoom(socket, chat_id) {
    try {
        const user = await getUserFromSocket(socket);
        const chatExists = await chatModel.findOne({
            $or: [
                { createdBy: user._id }, { createdFor: { $in: [user._id] } }
            ], _id: chat_id,
        })
        if (!chatExists) {
            socket.emit("status", {
                code: 400,
                message: "Chat does not exist."
            });
            return;
        }
        socket.join(chat_id);
        socket.emit("status", {
            code: 200, message: "Join the chat."
        })
    } catch (error) {
        console.log(error);
        socket.emit("status", {
            code: 500,
            message: "Working on the server issues."
        })
    }
}