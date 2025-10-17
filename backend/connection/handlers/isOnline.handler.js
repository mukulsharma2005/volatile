import userModel from "../../models/user.model.js";
import { usersMap } from "../connection.handler.js"

const isOnline = async (socket, user_id) => {
    try {
        const user = await userModel.findById(user_id);
        if (!user) {
            socket.emit("status", {
                code: 400, message: "Invalid user id"
            });
            return;
        }
        const isUserOnline = usersMap[user_id];
        if (isUserOnline) {
            socket.emit({
                online: true
            });
            return;
        }
        socket.emit({
            online: false,
            lastSeen: user.lastSeen,
        })
    } catch (error) {
        socket.emit({
            code: 500, message: "Working on server issues",
        })
        console.log(error);
    }
}

export default isOnline
