import express from "express"
import {createChat, deleteChat, deleteMessage, getAllChats, getChatMessages, syncChatMessages} from "../controllers/chat.controller.js";
import authenticated from "../config/authenticated.js";
const router = express.Router();

router.post("/", authenticated, createChat);
router.get("/", authenticated, getAllChats);
router.get("/messages", authenticated, getChatMessages);
router.get("/messages/sync",authenticated,syncChatMessages);
router.delete("/:chat_id", authenticated, deleteChat);
router.delete("/messages/delete",authenticated,deleteMessage);

export default router;
