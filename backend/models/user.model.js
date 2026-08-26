import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String, required: true, unique: true, trim: true, min:5, max:50
    },
    password: {
        type: String, required: true
    },
    profilePic: {
        publicId: { type: String },
        url: { type: String }
    },
    about: {
        type: String, trim: true
    },
    presence: {
        lastSeen: {
            type: Date,
            default: Date.now(),
        },
        online: {type: Boolean, default: false},
    },

}, { timestamps: true })

export default mongoose.model("users", userSchema);