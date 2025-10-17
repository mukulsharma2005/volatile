import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sentBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "users", required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId, ref: "chats", required: true,
    },
    message: {
        type: String, required: true, trim: true,
    },
    read: [{
        type: mongoose.Schema.Types.ObjectId, ref: "users",
    }],
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId, ref: "users"
    }]
}, {timestamps : true})

export default mongoose.model("messages", messageSchema)