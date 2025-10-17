import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    createdBy : {
        type: mongoose.Schema.Types.ObjectId, ref: "users", required: true,
    },
    createdFor : [{
        type: mongoose.Schema.Types.ObjectId, ref: "users", required: true,
    }],
    type: {
        type: String,
        enum: ["single", "group"],
        default: "single"
    },
}, {timestamps: true})

export default mongoose.model("chats", chatSchema);