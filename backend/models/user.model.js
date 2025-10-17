import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String, required: true, unique: true, trim: true
    },
    email: {
        type: String, required: true, unique: true, trim: true,
        validate: {
            validator: (value) => value.endsWith("@gmail.com"), message: "Email must ends with @gmail.com address"
        }
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