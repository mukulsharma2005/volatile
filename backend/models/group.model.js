import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    groupPic: {
        publicId: {type:String},
        url: {type: String}
    },
    groupName: {
        type: String, required: true, trim: true
    },
    description: {
        type: String
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats",
        required: true,
    },
    admin : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }],
    deleted: {
        type: Boolean, default: false
    }
})

export default mongoose.model("groups", groupSchema);