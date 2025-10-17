import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chats',
        required: true
    },
    message: {
        type:String, 
        required: true,
        trim: true
    }
}, {timestamps: true});

export default mongoose.model("notification", notificationSchema);