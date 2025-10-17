import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
export default async function authenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "You are not logged in.",
            success: false
        })
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET,);

        if (! await userModel.findById( user._id )) {
            return res.status(401).json({
                message: "Authentication failed.",
                success: false
            })
        }

        req.user = user;
        return next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            message: "Authentication failed. Invalid or expired token.",
            success: false
        })
    }

}