import { getUserFromSocket, haveSameElements } from "../utils.js";
import { usersMap } from "../connection.handler.js";
import userModel from "../../models/user.model.js";
import chatModel from "../../models/chat.model.js";
import { io } from "../../index.js";

export default async function disconnectHandler(socket) {
    const user_id = socket.userId;
    if (usersMap[user_id]) {
        delete usersMap[user_id]
    };
    try {
        await userModel.findByIdAndUpdate(user_id, { $set: { presence: { lastSeen: Date.now(), online: false } } });
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
                io.to(socketId).emit("user_offline", user_id);
            }
        })
    } catch (error) {
        console.log(error);
    }
    const user = await getUserFromSocket(socket)
    console.log(`${user.username} is diconnected.`)
}