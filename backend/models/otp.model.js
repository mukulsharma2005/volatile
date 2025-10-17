import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: {
        type: String, required: true, unique: true, validate: {
            validator: (value) => value.endsWith("@gmail.com"), message: "Invalid email address"
        }
    },
    otp: { type: String, required: true },
    expiresAt: {type: Date, required: true}
}, { timestamps: true })
const otpModel =  mongoose.model("otp", otpSchema);
otpModel.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default otpModel;