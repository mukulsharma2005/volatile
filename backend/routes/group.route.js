import express from "express"
import { addMember, createGroup, deleteGroup, deleteMember, makeMemberAdmin, removeMemberAdmin, updateGroupInfo } from "../controllers/group.controller.js";
import authenticated from "../config/authenticated.js";
import { upload } from "../config/multer.js";
const router = express.Router();

router.post("/", authenticated,upload.single("groupPic"), createGroup);
router.delete("/",authenticated,deleteGroup)
router.put("/",authenticated,upload.single("groupPic"),updateGroupInfo);
// router.post("/join/:chat_id", authenticated, joinChat);
router.post("/members",authenticated, addMember);
router.put("/members/makeadmin",authenticated, makeMemberAdmin);
router.put("/members/removeadmin",authenticated, removeMemberAdmin);
router.delete("/members",authenticated, deleteMember);
export default router;
