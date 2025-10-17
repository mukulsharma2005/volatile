import express from "express"
import {createUser, getUsers, login, logout, updateUser, verifyOtp} from "../controllers/user.controller.js";
import authenticated from "../config/authenticated.js";
import { upload } from "../config/multer.js";
const router = express.Router();

router.post("/", createUser);
router.put("/",authenticated,upload.single("profilePic"),updateUser)
router.post("/verify",verifyOtp);
router.post("/login", login);
router.post("/logout",authenticated,logout);
router.get("/all",authenticated,getUsers);
export default router;
