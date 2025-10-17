import { io } from "../index.js";
import { usersMap } from "../connection/connection.handler.js";
import chatModel from "../models/chat.model.js";
import groupModel from "../models/group.model.js";
import userModel from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js"

export async function createGroup(req, res) {
    const user_id = req.user._id;
    const { groupName, groupDescription, members } = req.body;
    const groupPic = req.file;
    if (!groupName || !members) {
        return res.status(400).json({
            message: "Something is missing.",
            success: false
        })
    }
    try {
        const parsedMembers = JSON.parse(members);
        const filteredMembers = parsedMembers.filter(member => member && member != user_id)
        const membersExistPromises = filteredMembers.map(async member => {
            return await userModel.findById(member);
        });
        const membersExist = await Promise.all(membersExistPromises);
        if (membersExist.includes(null)) {
            return res.status(400).json({
                message: "One or more of the user ids are invalid."
            })
        }
        const newChat = new chatModel({
            createdBy: user_id,
            createdFor: membersExist,
            type: "group"
        });
        await newChat.save();
        const populatedChat = await chatModel.findById(newChat._id).populate("createdBy", "username profilePic about").populate("createdFor", "username profilePic about").lean();
        let query = {
            groupName, chat: newChat._id, admin: [user_id]
        };
        if (typeof description== "string"){
            query.description = groupDescription;
        }
        if (groupPic) {
            const b64 = Buffer.from(groupPic.buffer).toString('base64');
            let dataURI = "data:" + groupPic.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "profile_pics"
            });
            query.groupPic = {
                url : result.secure_url,
                publicId : result.public_id,
            }
        }
        const newGroup = new groupModel(query);
        await newGroup.save()
        populatedChat.group = newGroup;
        const participants = [populatedChat.createdBy._id.toString(), ...populatedChat.createdFor.map(member => member._id.toString())]
        participants.forEach(member => {
            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chats", populatedChat)
            }
        })
        return res.status(201).json({
            message: "Group created.",
            success: true,
            chat: populatedChat,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Working on issues.",
            success: false
        })
    }
}
export async function addMember(req, res) {
    const user_id = req.user._id;
    const { aspirant_id, group_id } = req.body;
    if (!aspirant_id || !group_id) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    try {
        const aspirantExists = await userModel.findById(aspirant_id);
        if (!aspirantExists) {
            return res.status(400).json({
                message: "Member to add does not exist.",
                success: false
            })
        }
        const groupExists = await groupModel.findById(group_id);
        if (!groupExists) {
            return res.status(400).json({
                message: "Group id does not exist.",
                success: false
            })
        }
        const admins = groupExists.admin.map(id => id.toString());
        if (!admins.includes(user_id)) {
            return res.status(400).json({
                message: "Only admins can add members",
                success: false
            })
        }
        const chatExists = await chatModel.findById(groupExists.chat);
        const participants = [chatExists.createdBy.toString(), ...chatExists.createdFor.map(id => id.toString())]
        if (participants.includes(aspirant_id)) {
            return res.status(400).json({
                message: `${aspirantExists.username} is already added to the group`,
                success: false
            })
        }
        const newChat = await chatModel.findByIdAndUpdate(groupExists.chat, { $push: { createdFor: aspirant_id } }, { new: true });
        const populatedChat = await chatModel.findById(newChat._id,).populate("createdBy createdFor", "username profilePic about").lean();
        populatedChat.group = groupExists;
        participants.push(aspirant_id);
        participants.forEach(member => {
            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chats", populatedChat)
            }
        })
        return res.status(200).json({
            message: `${aspirantExists.username} is added to the group`,
            success: true,
            chat: populatedChat
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function deleteMember(req, res) {
    const user_id = req.user._id;
    const { aspirant_id, group_id } = req.body;
    if (!aspirant_id || !group_id) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    try {
        const aspirantExists = await userModel.findById(aspirant_id);
        if (!aspirantExists) {
            return res.status(400).json({
                message: "Member to add does not exist.",
                success: false
            })
        }
        const groupExists = await groupModel.findById(group_id);
        if (!groupExists) {
            return res.status(400).json({
                message: "Group id does not exist.",
                success: false
            })
        }
        const admins = groupExists.admin.map(id => id.toString());
        if (!admins.includes(user_id)) {
            return res.status(400).json({
                message: "Only admins can remove members",
                success: false
            })
        }
        const chatExists = await chatModel.findById(groupExists.chat);
        const participants = [chatExists.createdBy.toString(), ...chatExists.createdFor.map(id => id.toString())]
        if (!participants.includes(aspirant_id)) {
            return res.status(400).json({
                message: `${aspirantExists.username} is not a member.`,
                success: false
            })
        }
        if (chatExists.createdBy.toString() === aspirant_id) {
            return res.status(400).json({
                message: "You can't remove the creator of group",
                success: false
            })
        }
        const newGroup = await groupModel.findByIdAndUpdate(groupExists._id, { $pull: { admin: aspirant_id } });
        const newChat = await chatModel.findByIdAndUpdate(groupExists.chat, { $pull: { createdFor: aspirant_id } }, { new: true });
        const populatedChat = await chatModel.findById(newChat._id,).populate("createdBy createdFor", "username profilePic about").lean();
        populatedChat.group = groupExists;

        participants.forEach(member => {

            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chats", populatedChat)
            }

        })
        return res.status(200).json({
            message: `${aspirantExists.username} is removed from the group`,
            success: true,
            chat: populatedChat
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function makeMemberAdmin(req, res) {
    const user_id = req.user._id;
    const { aspirant_id, group_id } = req.body;
    if (!aspirant_id || !group_id) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    try {
        const aspirantExists = await userModel.findById(aspirant_id);
        if (!aspirantExists) {
            return res.status(400).json({
                message: "Member to add does not exist.",
                success: false
            })
        }
        const groupExists = await groupModel.findById(group_id);
        if (!groupExists) {
            return res.status(400).json({
                message: "Group id does not exist.",
                success: false
            })
        }
        const admins = groupExists.admin.map(id => id.toString());
        if (!admins.includes(user_id)) {
            return res.status(400).json({
                message: "Only admins can make members admin",
                success: false
            })
        }
        if (admins.includes(aspirant_id)) {
            return res.status(400).json({
                message: `${aspirantExists.username} is already an admin.`
            })
        }
        const chatExists = await chatModel.findById(groupExists.chat);
        const participants = [chatExists.createdBy.toString(), ...chatExists.createdFor.map(id => id.toString())]
        if (!participants.includes(aspirant_id)) {
            return res.status(400).json({
                message: `${aspirantExists.username} is not a member`,
                success: false
            })
        }
        const newGroup = await groupModel.findByIdAndUpdate(groupExists._id, { $push: { admin: aspirant_id } }, { new: true });
        const populatedChat = await chatModel.findById(chatExists._id,).populate("createdBy createdFor", "username profilePic about").lean();
        populatedChat.group = newGroup;
        participants.forEach(member => {
            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chats", populatedChat)
            }
        })
        return res.status(200).json({
            message: `${aspirantExists.username} is now admin`,
            success: true,
            chat: populatedChat
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function removeMemberAdmin(req, res) {
    const user_id = req.user._id;
    const { aspirant_id, group_id } = req.body;
    if (!aspirant_id || !group_id) {
        return res.status(400).json({
            message: "Something is missing",
            success: false
        })
    }
    try {
        const aspirantExists = await userModel.findById(aspirant_id);
        if (!aspirantExists) {
            return res.status(400).json({
                message: "Member to add does not exist.",
                success: false
            })
        }
        const groupExists = await groupModel.findById(group_id);
        if (!groupExists) {
            return res.status(400).json({
                message: "Group id does not exist.",
                success: false
            })
        }
        const admins = groupExists.admin.map(id => id.toString());
        if (!admins.includes(user_id)) {
            return res.status(400).json({
                message: "Only admins can make admins member",
                success: false
            })
        }
        if (!admins.includes(aspirant_id)) {
            return res.status(400).json({
                message: `${aspirantExists.username} is not an admin.`
            })
        }
        const chatExists = await chatModel.findById(groupExists.chat);
        const participants = [chatExists.createdBy.toString(), ...chatExists.createdFor.map(id => id.toString())]
        if (!participants.includes(aspirant_id)) {
            return res.status(400).json({
                message: `${aspirantExists.username} is not a member`,
                success: false
            })
        }
        const newGroup = await groupModel.findByIdAndUpdate(groupExists._id, { $pull: { admin: aspirant_id } }, { new: true });
        const populatedChat = await chatModel.findById(chatExists._id,).populate("createdBy createdFor", "username profilePic about").lean();
        populatedChat.group = newGroup;
        participants.forEach(member => {
            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chats", populatedChat)
            }
        })
        return res.status(200).json({
            message: `${aspirantExists.username} is no longer admin`,
            success: true,
            chat: populatedChat
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function deleteGroup(req, res) {
    const user_id = req.user._id;
    const { group_id, everyone } = req.body;
    if (!group_id) {
        return res.status(400).json({
            message: "Something is missing"
        })
    };
    try {
        const groupExists = await groupModel.findById(group_id);
        if (!groupExists) {
            return res.status(400).json({
                message: "Group id does not exist.",
                success: false
            })
        }
        const chatExists = await chatModel.findById(groupExists.chat);
        const participants = [chatExists.createdBy.toString(), ...chatExists.createdFor.map(id => id.toString())]
        if (!participants.includes(user_id)) {
            return res.status(400).json({
                message: `You are not a member`,
                success: false
            })
        }
        if (!everyone) {
            if (chatExists.createdBy.toString() == user_id) {
                return res.status(400).json({
                    message: "You cannot delete group for yourself only",
                    success: false
                })
            }
            const newChat = await chatModel.findByIdAndUpdate(groupExists.chat, { $push: { deletedFor: user_id }, $pull: { createdFor: user_id } }, { new: true }).populate("createdBy createdFor", "username profilePic about").lean();
            const group = await groupModel.findOne({ chat: newChat._id }).lean();
            const socket_id = usersMap[user_id];
            if (socket_id) {
                const userSocket = io.sockets.sockets.get(socket_id);
                if (userSocket) {
                    userSocket.leave(newChat._id.toString());
                }
            }
            participants.forEach(member => {
                const socket_id = usersMap[member];
                if (member == user_id) {
                    io.to(socket_id).emit("chats", { ...newChat, group, deleted: true });
                    return
                }

                if (socket_id) {
                    io.to(socket_id).emit("chats", { ...newChat, group })
                }
            })

            return res.status(200).json({
                message: `${groupExists.groupName} group is deleted`,
                success: true,
                chat: {
                    _id: newChat._id,
                    deleted: true
                }
            })
        }
        if (chatExists.createdBy.toString() != user_id) {
            return res.status(200).json({
                message: "Only creator can delete the group.",
                success: false
            })
        }
        await messageModel.deleteMany({ chat: chatExists._id });
        const deletedGroup = await groupModel.findByIdAndDelete(group_id).lean();
        const deletedChat = await chatModel.findByIdAndDelete(chatExists._id).lean();
        participants.forEach(member => {
            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chat_deleted", deletedChat._id)
            }
        })
        return res.status(200).json({
            message: `${groupExists.groupName} is deleted`,
            success: true,
            chat: {
                _id: deletedChat._id,
                deleted: true
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Working on server issues.",
            success: false
        })
    }
}
export async function updateGroupInfo(req, res) {
    const user_id = req.user._id;
    const { group_id, groupName, groupDescription } = req.body;
    const groupPic = req.file;
    if (!group_id) {
        return res.status(400).json({
            success: false,
            message: "Something is missing",
        })
    }
    try {
        const groupExists = await groupModel.findById(group_id);
        if (!groupExists) {
            return res.status(400).json({
                message: "Group id does not exist.",
                success: false
            })
        }
        const admins = groupExists.admin.map(id => id.toString());
        if (!admins.includes(user_id)) {
            return res.status(400).json({
                message: "Only admins can edit group.",
                success: false
            })
        }
        const updateQuery = {};

        if (typeof groupName === "string") {
            updateQuery.groupName = groupName;
        }

        if (typeof groupDescription === "string") {
            updateQuery.description = groupDescription;
        }

        if (groupPic) {
            const b64 = Buffer.from(groupPic.buffer).toString('base64');
            let dataURI = "data:" + groupPic.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "profile_pics"
            });
            updateQuery.groupPic = {
                publicId: result.public_id,
                url: result.secure_url,
            }
            const existingImageId = groupExists.groupPic.publicId;
            if (existingImageId) {
                await cloudinary.uploader.destroy(existingImageId);
            }
        }
        const newGroup = await groupModel.findByIdAndUpdate(group_id, { $set: updateQuery }, { new: true }).lean();
        const chat = await chatModel.findById(newGroup.chat).populate("createdBy createdFor", "username about profilePic").lean();
        chat.group = newGroup;
        const participants = [chat.createdBy._id.toString(), ...chat.createdFor.map(member => member._id.toString())];
        participants.forEach(member => {
            const socket_id = usersMap[member];
            if (socket_id) {
                io.to(socket_id).emit("chats", chat);
            }
        })
        return res.status(200).json({
            success: true,
            message: "Group info updated successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}