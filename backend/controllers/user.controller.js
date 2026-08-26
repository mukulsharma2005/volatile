import userModel from "../models/user.model.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js"
import { configDotenv } from "dotenv";
import chatModel from "../models/chat.model.js";
import { io } from "../index.js";
import { usersMap } from "../connection/connection.handler.js";
import groupModel from "../models/group.model.js";
configDotenv()
let usersToVerify = [];
export async function createUser(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    if (username < 5 || username > 30) {
        return res.status(400).json({
            message: "Username is either too short or too long",
            success: false
        })
    }
    try {
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be of minimum eight characters",
                success: false,
            })
        }
        const usernameExists = await userModel.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists.",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username: username,
            password: hashedPassword,
        })
        await newUser.save();
        const jwt_secret = process.env.JWT_SECRET
        const token = jwt.sign({
            _id: newUser._id
        }, jwt_secret, { expiresIn: "30d" })
        return res.status(200).cookie("token", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: "none"
        }).json({
            message: "User created and logged in.",
            success: true,
            user: {
                _id: newUser._id,
                username: newUser.username,
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
        })
    }

}
export async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    try {
        const userExists = await userModel.findOne({ username })
        if (!userExists) {
            return res.status(400).json({
                message: "Username does not exist.",
                success: false
            })
        }
        if (!await bcrypt.compare(password, userExists.password)) {
            return res.status(400).json({
                message: "Incorrect password.",
                success: false
            })
        }
        const jwt_secret = process.env.JWT_SECRET
        const token = jwt.sign({
            _id: userExists._id
        }, jwt_secret, { expiresIn: "30d" })
        const socketId = usersMap[userExists._id];
        if (socketId) {
            const socketToDisconnect = io.sockets.sockets.get(socketId);
            socketToDisconnect && socketToDisconnect.disconnect(true);
        }
        return res.cookie("token", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            message: "Login successfully.", success: true, user: {
                _id: userExists._id,
                username: userExists.username,
                profilePic: { url: userExists.profilePic?.url },
                about: userExists.about,
            }
        })
    } catch (error) {
        conosle.log(error);
        return res.status(500)
    }
}
export async function logout(req, res) {
    const user_id = req?.user?._id;
    try {
        const socketId = usersMap[user_id];
        if (socketId) {
            const socketToDisconnect = io.sockets.sockets.get(socketId);
            socketToDisconnect && socketToDisconnect.disconnect(true);
        }
        return res.status(200).cookie("token", "").json({
            success: true,
            message: "Logout successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}
export async function updateUser(req, res) {
    const user_id = req.user._id;
    const { about } = req.body;
    const profilePic = req.file;
    if (!about && !profilePic) {
        return res.status(400).json({
            message: "Something is missing",
            success: false,
        })
    }
    try {
        const query = {};
        const user = await userModel.findById(user_id);
        if (profilePic) {
            const b64 = Buffer.from(profilePic.buffer).toString('base64');
            let dataURI = "data:" + profilePic.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "profile_pics"
            });
            query.profilePic = {
                publicId: result.public_id,
                url: result.secure_url,
            }
            const existingImageId = user.profilePic?.publicId;
            if (existingImageId) {
                await cloudinary.uploader.destroy(existingImageId);
            }
        }
        if (typeof about === "string") {
            query.about = about;
        }
        const newUser = await userModel.findByIdAndUpdate(user_id, { $set: query }, { new: true });
        const userChats = await chatModel.find({
            $or: [
                { createdBy: { $in: user_id } },
                { createdFor: { $in: user_id } }
            ]
        }).populate("createdBy", "username profilePic about").populate("createdFor", "username profilePic about").lean();
        for (const chat of userChats) {
            const participants = [chat.createdBy, ...chat.createdFor];

            for (const participant of participants) {
                const socketId = usersMap[participant._id.toString()]
                if (socketId) {
                    if (chat.type == "group") {
                        const group = await groupModel.findOne({ chat: chat._id }).lean();
                        chat.group = group;
                    }

                    io.to(socketId).emit("chats", chat);
                }
            }
        }
        return res.status(200).json({
            message: "Updated successfully.", success: true, user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: { url: newUser.profilePic?.url },
                about: newUser?.about
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500)
    }
}
export async function getUsers(req, res) {
    try {
        const users = await userModel.find().lean();
        const usersDataToSent = users.map(user => {
            return {
                _id: user._id,
                username: user.username,
                profilePic: user.profilePic,
                about: user.about,
                presence: { online: user?.presence?.online },
            }
        })
        return res.status(200).json({
            message: "Users sent.",
            success: true,
            users: usersDataToSent,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Working on server issues."
        })
    }
}
