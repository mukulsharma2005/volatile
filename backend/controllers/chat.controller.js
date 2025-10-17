import { usersMap } from "../connection/connection.handler.js";
import { io } from "../index.js";
import chatModel from "../models/chat.model.js";
import groupModel from "../models/group.model.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
export async function createChat(req, res) {
    const user_id = req.user._id;
    const { targetUser } = req.body;

    if (!targetUser) {
        return res.status(400).json({
            message: "Something is missing", success: false
        })
    }
    try {
        const targetUserExists = await userModel.findById(targetUser)
        if (!targetUserExists) {
            return res.status(400).json({
                message: "Targeted user does not exist.",
                success: false
            })
        }
        const chatExists = await chatModel.findOne({ $or: [
            { createdBy: user_id, createdFor: { $in: targetUser } },
            { createdBy: targetUser, createdFor: { $in: user_id } },
        ], type: "single" })
        if (chatExists) {
            return res.status(400).json({
                message: "Chat already exists.",
                success: false
            })
        }
        const newChat = new chatModel({
            createdBy: user_id, createdFor: [targetUser], type: "single"
        })
        await newChat.save();
        const populatedChat = await chatModel.findById(newChat._id).populate("createdBy createdFor", "username profilePic about").lean()
        const targetSocketId = usersMap[newChat.createdFor[0]]
        targetSocketId && io.to(targetSocketId).emit("chats", populatedChat)
        return res.status(201).json({
            message: `Chat created with ${targetUserExists.username}`,
            success: true,
            chat: populatedChat,
        })
    } catch (error) {
        console.log(error)
        return res.status(500)
    }
}
export async function getAllChats(req, res) {
    const user_id = req.user._id;
    try {
        const chatsUnnamed = await chatModel.find({
            $or: [
                { createdBy: user_id },
                { createdFor: { $in: [user_id] } }
            ], deletedFor: { $nin: [user_id] }
        }).sort({ createdAt: 1 }).populate("createdBy", "username profilePic about presence").populate("createdFor", "username profilePic about presence").lean();
        const chatsPromises = chatsUnnamed.map(async chat => {
            if (chat.type == "single") {
                if (chat.createdBy._id.toString() === user_id) {
                    chat.name = chat.createdFor[0].username;
                    return chat
                }
                chat.name = chat.createdBy.username;
                return chat
            }
            const group = await groupModel.findOne({ chat: chat._id }).lean();
            chat.group = group;
            return chat
        })
        const chats = await Promise.all(chatsPromises);
        // const messages = await messageModel.find({chat:})
        return res.status(200).json({
            message: `No. of chats sent (${chats.length}).`,
            success: true,
            chats
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on issues.",
            success: false
        })
    }
}
export async function getChatMessages(req, res) {
    const user_id = req.user._id;
    try {
        const userChats = await chatModel.find({
            $or: [
                { createdBy: user_id },
                { createdFor: { $in: [user_id] } }
            ]
        }).lean();
        const chatIds = userChats.map(chat => chat._id);
        const messagePromises = chatIds.map(async (chatId) => {
            const messages = await messageModel.find({ chat: chatId, deletedFor: { $nin: [user_id] } }).sort({ createdAt: -1 }).populate("sentBy", "username").lean();
            return messages
        })
        const messages = await Promise.all(messagePromises);
        return res.status(200).json({
            message: `No. of messages sent(${messages.length})`,
            success: true,
            messages: messages.flat()
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function syncChatMessages(req, res) {
    const user_id = req.user._id;
    try {
        const userChats = await chatModel.find({
            $or: [
                { createdBy: user_id },
                { createdFor: { $in: [user_id] } }
            ]
        }).lean();
        const chatIds = userChats.map(chat => chat._id);
        const user = await userModel.findById(user_id);
        const userLastSeen = user.presence.lastSeen;
        const messagePromises = chatIds.map(async (chatId) => {
            const messages = await messageModel.find({
                chat: chatId,
                deletedFor: { $nin: [user_id] },
                $or: [
                    { createdAt: { $gt: userLastSeen } },
                    { updatedAt: { $gt: userLastSeen } },
                ]
            }).sort({ createdAt: -1 }).populate("sentBy", "username").lean();
            return messages
        })
        const messages = await Promise.all(messagePromises);
        return res.status(200).json({
            message: `No. of messages sent(${messages.length})`,
            success: true,
            messages: messages.flat()
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function deleteChat(req, res) {
    const user_id = req.user._id;
    const chat_id = req.params.chat_id;
    try {
        const chatExists = await chatModel.findById(chat_id);
        if (!chatExists) {
            return res.status(400).json({
                message: "Chat does not exist.",
                success: false
            })
        }
        if (chatExists.type != "single") {
            return res.status(400).json({
                message: "Can't delete chat.",
                success: false
            })
        }
        if (!chatExists || chatExists?.deleted) {
            return res.status(400).json({
                message: "Chat does not exist.",
                success: false
            })
        }
        const participants = [...chatExists.createdFor.map(id => id.toString()), chatExists.createdBy.toString()];
        if (!participants.includes(user_id.toString())) {
            return res.status(400).json({
                message: "Chat does not belong to you.",
                success: false
            })
        }
        await messageModel.deleteMany({ chat: chat_id });
        const deletedChat = await chatModel.findByIdAndDelete(chat_id).lean();

        if (deletedChat.type == "single") {
            const targetUser = participants.find(participant => participant != user_id);
            const socketId = usersMap[targetUser];
            if (socketId) {
                io.to(socketId).emit("chat_deleted", deletedChat._id);
            }
        }
        return res.status(200).json({
            message: "Chat deleted.",
            success: true,
            _id: deletedChat._id
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function deleteMessage(req, res) {
    const user_id = req.user._id;
    const { msg_id, everyone } = req.body;
    if (!msg_id) {
        return res.status(400).json({
            message: "Something is missing.",
            success: false
        })
    }
    try {
        const msgExists = await messageModel.findById(msg_id).populate("chat");
        if (!msgExists) {
            return res.status(400).json({
                message: "Message does not exist.",
                success: false
            })
        }
        const chat = msgExists.chat;
        const particpants = [chat.createdBy.toString(), ...chat.createdFor.map(id => id.toString())]
        if (!particpants.includes(user_id)) {
            return res.status(400).json({
                message: "You cannot delete message.",
                success: false
            })
        }
        const deletedFor = msgExists.deletedFor.map(id => id.toString())
        if (deletedFor.includes(user_id)) {
            return res.status(400).json({
                message: "Message is already deleted for you.",
                success: false
            })
        }
        if (everyone && msgExists.sentBy.toString() != user_id) {
            return res.status(400).json({
                message: "You cannot delete this message for everyone.",
                success: false
            })
        }
        if (everyone) {
            const deletedMessage = await messageModel.findByIdAndDelete(msg_id);
            return res.status(200).json({
                message: "Message deleted.",
                success: true,
                msg_id: deletedMessage._id
            })
        }
        const deletedMessage = await messageModel.findByIdAndUpdate(msg_id, {
            $push: {
                deletedFor: user_id
            }
        }, { new: true })
        return res.status(200).json({
            message: "message deleted.",
            success: true,
            _id: deletedMessage._id
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}