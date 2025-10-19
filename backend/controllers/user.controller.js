import userModel from "../models/user.model.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js"
import { configDotenv } from "dotenv";
import generateOtp from "../utils/generateOtp.js";
import otpModel from "../models/otp.model.js";
import maskEmail from "../utils/maskEmail.js";
import chatModel from "../models/chat.model.js";
import { io } from "../index.js";
import { usersMap } from "../connection/connection.handler.js";
import groupModel from "../models/group.model.js";
import { sendOtpEmail } from "../config/nodemailer.js";
configDotenv()
let usersToVerify = [];
export async function createUser(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    if (!email.endsWith("@gmail.com")) {
        return res.status(400).json({
            message: "Invalid email",
            success: false
        })
    }
    try {
        const emailExists = await userModel.findOne({ email });
        if (password.length<8){
            return res.status(400).json({
                message : "Password must be of minimum eight characters",
                success : false,
            })
        }
        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists.",
                success: false
            })
        }
        const usernameExists = await userModel.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists.",
                success: false
            })
        }
        const otpExists = await otpModel.findOne({ email });
        if (otpExists) {
            const resendTime = (Date.now() - otpExists.updatedAt.getTime())
            if (resendTime < 30000) {
                return res.status(400).json({
                    message: `You can request otp after ${30 - Math.round(resendTime / 1000)}s}`,
                    success: false
                })
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const hashedOtp = crypto.createHmac('sha256', process.env.OTP_SECRET).update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        const newOtp = await otpModel.updateOne({ email }, {
            $set: {
                email, username, password: hashedPassword, otp: hashedOtp, expiresAt
            }
        }, { upsert: true })
        await sendOtpEmail(otp,5,email);
        const maskedEmail = maskEmail(email)
        return res.status(200).json({
            message: "OTP has been sent.",
            success: true,
            email: maskedEmail
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message,
        })
    }

}
export async function verifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({
            message: "Something is missing", success: false
        })
    }
    try {
        const emailExists = await otpModel.findOne({ email });
        if (!emailExists) {
            return res.status(400).json({
                message: "No request for otp has been made for this email",
                success: false
            })
        }
        if (Date.now() > +emailExists.expiresAt) {
            return res.status(400).json({
                message: "Expired otp",
                success: false
            })
        }
        const storedOtp = emailExists.otp;
        const hashedOtp = crypto.createHmac('sha256', process.env.OTP_SECRET).update(otp).digest('hex');
        if (storedOtp !== hashedOtp) {
            return res.status(400).json({
                message: "Invalid OTP", success: false
            })
        }
        const newUser = new userModel({
            username: emailExists.username,
            email: emailExists.email,
            password: emailExists.password,
        })
        await newUser.save()
        await otpModel.deleteOne({ email });
        const jwt_secret = process.env.JWT_SECRET
        const token = jwt.sign({
            _id: newUser._id
        }, jwt_secret, { expiresIn: "30d" })
        return res.status(201).cookie("token", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: "none"
        }).json({
            message: "User created and logged in.",
            success: true,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic?.url,
                about: newUser.about
            }

        })
    } catch (error) {
        console.log(error)
        return res.status(500)
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
                email: userExists.email,
                profilePic: {url : userExists.profilePic?.url},
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
                publicId : result.public_id,
                url : result.secure_url,
            }
            const existingImageId = user.profilePic?.publicId;
            if (existingImageId){
                await cloudinary.uploader.destroy(existingImageId);
            }
        }
        if (typeof about === "string"){
            query.about = about;
        }
        const newUser = await userModel.findByIdAndUpdate(user_id, { $set: query}, { new: true });
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
                profilePic: {url : newUser.profilePic?.url},
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