import { io } from "../../index.js";
import chatModel from "../../models/chat.model.js";
import messageModel from "../../models/message.model.js";
import { usersMap } from "../connection.handler.js";
import { getUserFromSocket} from "../utils.js";

export default async function markRead(socket, msg_id) {
    try {
        const user = await getUserFromSocket(socket)
        const msgExists = await messageModel.findOne({
            _id: msg_id, read: { $nin: [user._id] }
        });
        if (!msgExists) {
            socket.emit("status", {
                code: 400,
                message: "Message is either read or does not exist."
            });
            return;
        };
        const chat = await chatModel.findById(msgExists.chat);
        const participants = [...chat.createdFor.map(id => id.toString()), chat.createdBy.toString()]
        if (!participants.includes(user._id.toString())) {
            socket.emit("status", {
                code: 400, message: "You are not a participant in chat."
            });
            return;
        }
        const newMessage = await messageModel.findByIdAndUpdate(msg_id, {
            $push: {
                read: user._id
            }
        },{new:true}).populate("sentBy","username").lean()
        socket.emit("is_read", newMessage);
        const senderSocketId = usersMap[newMessage.sentBy._id.toString()];
        senderSocketId && io.to(senderSocketId).emit("is_read", newMessage);
    } catch (error) {
        console.log(error);
        socket.emit("status", {
            code: 500, message: "Working on server issues."
        })
    }
}