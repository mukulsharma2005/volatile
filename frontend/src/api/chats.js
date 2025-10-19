import { addChat, setChats, setLoading, removeChat, setCurrentChatId } from "@/redux/chats.slice";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMessages } from "./messages";
import { toast } from "sonner";
import { BASE_API_ENDPOINT } from "@/utils/constants";

export function useGetChats() {
    const dispatch = useDispatch();
    const [response, setResponse] = useState("");
    const { chats, loading } = useSelector(state => state.chats);
    const { syncMessages } = useGetMessages();

    useEffect(() => {
        (async () => {
            try {
                dispatch(setLoading(true))
                const res = await fetch(`${BASE_API_ENDPOINT}/chats`, {
                    credentials: "include"
                });
                const data = await res.json();
                setResponse(data);
                if (data.success) {
                    dispatch(setChats(data.chats));
                    syncMessages()
                }
            } catch (error) {
                console.log(error);
                setResponse({
                    message: error.message,
                    success: false
                })
            } finally {
                dispatch(setLoading(false))
            }
        })()
    }, [])

    return { chats, loading, response, setResponse };
}
export function useLiveSortedChats() {
    const messages = useSelector(state => state.message.messages);
    const user = useSelector(state => state.auth.user);
    const chats = useSelector(state => state.chats.chats);

    const getChatDetails = (chat) => {

        if (chat?.type == "group") {
            const chatName = chat?.group?.groupName;
            const chatPic = chat?.group?.groupPic?.url;
            return { chatName, chatPic };
        }
        else if (chat?.createdBy?._id == user._id) {
            if (chat?.createdFor) {
                const targetUserId = chat?.createdFor[0]?._id;
                const chatName = chat?.createdFor[0]?.username;
                const chatPic = chat?.createdFor[0]?.profilePic?.url;
                const chatPresence = chat?.createdFor[0]?.presence;
                return { chatName, chatPic, targetUserId, chatPresence };
            }
        } else {
            const targetUserId = chat?.createdBy?._id;
            const chatName = chat?.createdBy?.username;
            const chatPic = chat?.createdBy?.profilePic?.url;
            const chatPresence = chat?.createdBy?.presence;
            return { chatName, chatPic, targetUserId, chatPresence };
        }
    }
    const sortedChats = useMemo(() => {

        let sortedChats = [];
        const userExists = user && Object.keys(user).length > 0
        const chatsExists = user && Object.keys(chats).length > 0
        const messagesExists = user && Object.keys(messages).length > 0
        if (userExists && chatsExists) {
            let unreadMessages = [];
            if (messagesExists) {
                unreadMessages = messages?.filter(message => {
                    const isRead = message.read?.includes(user._id);

                    const notSentByCurrentUser = message?.sentBy?._id !== user._id;

                    return !isRead && notSentByCurrentUser;
                });
            }
            const newChats = chats.map(chat => {
                const messagesForChat = messages.filter(msg => msg.chat == chat._id);
                const unreadForChat = unreadMessages.filter(msg => msg.chat == chat._id);
                const lastMessage = messagesForChat[0];
                const unread = unreadForChat.length;
                const { chatName, chatPic, targetUserId, chatPresence } = getChatDetails(chat);
                return { ...chat, chatName, chatPic, lastMessage, unread, targetUserId, chatPresence };
            })

            const newSortedChats = newChats.sort((a, b) => {
                const time_a = new Date(a?.lastMessage?.createdAt);
                const time_b = new Date(b?.lastMessage?.createdAt);
                return time_b - time_a;
            })

            sortedChats = newSortedChats;
        }
        return sortedChats
    }, [chats, user, messages])
    return { sortedChats }
}
export function useCreateChat() {
    const [response, setResponse] = useState("");
    const [chatCreateLoad, setChatCreateLoad] = useState(false);
    const dispatch = useDispatch();
    const createChat = async (_id) => {
        try {
            setChatCreateLoad(true)
            const res = await fetch(`${BASE_API_ENDPOINT}/chats`, {
                credentials: "include",
                method: "POST",
                body: JSON.stringify({ "targetUser": _id }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            setResponse(data)
            if (data?.success) {
                dispatch(addChat(data?.chat));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setResponse({
                success: false,
                message: error?.message
            })
        } finally {
            setChatCreateLoad(false);
        }
    }
    return { createChat, response, chatCreateLoad };
}
export function useDeleteChat() {
    const [response, setResponse] = useState("");
    const [chatDeleteLoad, setChatDeleteLoad] = useState(false);
    const currentChatId = useSelector(state => state.chats.currentChatId);
    const chats = useSelector(state => state.chats.chats);
    const dispatch = useDispatch();
    const deleteChat = async (_id) => {
        const chatExists = chats.find(chat => chat._id == _id);
        if (!chatExists?.deleted) {
            try {
                setChatDeleteLoad(true)
                const res = await fetch(`${BASE_API_ENDPOINT}/chats/${_id}`, {
                    credentials: "include",
                    method: "DELETE",
                });
                const data = await res.json();
                setResponse(data)

                if (data?.success) {

                    if (currentChatId == data?._id) {
                        dispatch(setCurrentChatId(""));
                    }
                    dispatch(removeChat(data?._id));
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
                setResponse({
                    success: false,
                    message: error?.message
                })
            } finally {
                setChatDeleteLoad(false);
            }
        } else {
            dispatch(removeChat(_id));
            toast.success("Chat removed.");
            setResponse({
                success: true,
                message: "Chat removed.",
            })
        }
    }
    return { deleteChat, response, chatDeleteLoad };
}