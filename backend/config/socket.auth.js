import cookie from "cookie"
import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js";
export default async function socketAuthenticated(socket, next) {
    const cookies = socket.request.headers.cookie
    const token = cookies && cookie.parse(cookies).token
    if (!token) {
        return next(new Error("No token provided"))
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const userExists = await userModel.findById(user._id);
        console.log(userExists.username)
        if (!userExists) {
            return next(new Error("Invalid or expired token provided."))
        }
        socket.userId = userExists._id
        next()
    } catch (error) {
        return next( new Error("Authentication failed"))
        // console.log(error);
    }


}