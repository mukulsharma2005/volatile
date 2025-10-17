import { io } from "../../index.js";
import chatModel from "../../models/chat.model.js";
import messageModel from "../../models/message.model.js";


export default async function sendMessage(socket, message,callback) {
    // console.log(socket.userId,message.sentBy);
    try {
        if (!message.message || !message.sentBy || !message.chat) {
            socket.emit("status", {
                code: 400, message: "Something is missing."
            })
        }

        if (message.sentBy != socket.userId) {
            socket.emit("status", {
                code: 400, message: "You can't send this message."
            });
            return;
        }
        const chatExists = await chatModel.findById(message.chat);
        if (!chatExists) {
            socket.emit("status", {
                code: 400, message: "Invalid chat id."
            });
            return;
        }
        const participants = [...chatExists.createdFor.map(id => id.toString()), chatExists.createdBy.toString()]
        if (!participants.includes(message.sentBy.toString())) {
            socket.emit("status", {
                code: 400, message: "You are not a participant in chat."
            });
            return;
        }

        const sockets = await io.in(message.chat).fetchSockets();
        const socketIds = sockets.map(obj => obj.id);
        if (!socketIds.includes(socket.id)) {
            socket.emit("status", {
                code: 400,
                message: "Join chat room to chat."
            });
            return;
        }
        const newMessage = new messageModel({
            sentBy: message.sentBy,
            message: message.message,
            chat: message.chat
        });
        
        try {
            await newMessage.validate()
        } catch (error) {
            socket.emit("status", {
                code: 400, message: error.message
            })
        }

        await newMessage.save();
        const populatedNewMessage = await messageModel.findById(newMessage._id).populate("sentBy","username").lean();
        io.to(message.chat).emit("chat_message", populatedNewMessage);
        if (callback){
            callback({
                success: true,
                message: "Message sent.",
                _id: newMessage._id,
            },{...populatedNewMessage,tempId : message.tempId})
        }
    } catch (error) {
        console.log(error)
        socket.emit("status", {
            code: 400, message: "Working on server issues."
        });
        if (callback){
            callback({
                success: false,
                message: error.message,
            },{...message,isNotSent: true})
        }
    }
}