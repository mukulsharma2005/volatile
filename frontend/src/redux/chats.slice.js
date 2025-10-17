import { createSlice } from '@reduxjs/toolkit';

const chatsSlice = createSlice({
    name: "chats",
    initialState: {
        chats: [],
        loading: false,
        currentChatId: "",
    },
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        updateChat: (state, action) => {
            const newChat = action.payload;
            const oldChatIndex = state.chats.findIndex(oldChat => oldChat._id == newChat._id);
            if (oldChatIndex !== -1) {
                state.chats[oldChatIndex] = newChat;
            } else {
                const chats = state.chats;
                state.chats = [...chats, newChat];
            }
        },
        removeChat: (state, action) => {
            const chatToDelete_id = action.payload;
            const newChats = state.chats.filter(chat => chat._id != chatToDelete_id);
            state.chats = [...newChats];
            const currentChatId = state.currentChatId;
            if (currentChatId == chatToDelete_id) {
                state.currentChatId = ""
            }
        },
        markDelete: (state, action) => {
            const chatIdToMarkDelete = action.payload;
            const chatIndexToMarkDelete = state.chats.findIndex(chat => chat._id == chatIdToMarkDelete);
            if (chatIdToMarkDelete !== -1) {
                const chat = state.chats[chatIndexToMarkDelete];
                state.chats[chatIndexToMarkDelete] = { ...chat, deleted: true };

            }
        },
        addChat: (state, action) => {
            const newChat = action.payload
            const chatExists = state.chats.find(chat => chat._id == newChat._id);
            if (!chatExists) {
                state.chats = [...state.chats, newChat];
            }
        },
        updateChatPresence: (state, action) => {
            const { userToUpdatePresence, online } = action.payload;
            if (userToUpdatePresence) {
                console.log(userToUpdatePresence);

                const chats = state.chats;
                const newChats = chats.map(chat => {
                    if (chat.type == "single") {
                        if (chat.createdBy._id == userToUpdatePresence) {
                            chat.createdBy.presence = {
                                online: online,
                                lastSeen: online ? null : new Date(Date.now()).toString(),
                            };
                            return chat;
                        }
                        if (chat.createdFor.map(i => i._id).includes(userToUpdatePresence)) {
                            chat.createdFor[0].presence = {
                                online: online,
                                lastSeen: online ? null :  new Date(Date.now()).toString(),
                            };
                            return chat;
                        }
                    }
                    return chat;
                })
                state.chats = [...newChats];
            }
        }
    }
})
export const { setChats, setCurrentChatId, setLoading, updateChat, removeChat, addChat, markDelete, updateChatPresence } = chatsSlice.actions;
export default chatsSlice.reducer