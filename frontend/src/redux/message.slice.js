import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
        loading: false,
    },
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            const message = action.payload;
            const messageExists = state.messages.find(existingMessage => {
                if (existingMessage._id && message._id) {
                    return (existingMessage._id == message._id)
                }
                if (existingMessage.tempId && message.tempId) {
                    return (existingMessage.tempId == message.tempId);
                }
                return false
            })
            if (!messageExists) {
                return {
                    ...state,
                    messages: [message, ...state.messages]
                };
            }
            return state;
        },
        addMessages: (state, action) => {
            const newMessages = action.payload;
            const newMessagesToAdd = newMessages.filter(message => {
                const messageExists = state.messages.find(existingMessage => {
                    if (existingMessage._id && message._id) {
                        return (existingMessage._id === message._id)
                    }
                    if (existingMessage.tempId && message.tempId) {
                        return (existingMessage.tempId === message.tempId);
                    }
                    return false
                })
                if (!messageExists) {
                    return true;
                }
                return false;
            })
            const sortedNewMessages = newMessagesToAdd.sort((a,b)=>b.createdAt - a.createdAt);
            state.messages = [ ...sortedNewMessages,...state.messages];
        },
        updateMessage: (state, action) => {
            const newMessage = action.payload;
            const oldMessageIndex = state.messages.findIndex(oldMessage => {
                if (oldMessage._id && newMessage._id) {
                    return (oldMessage._id == newMessage._id)
                }
                if (oldMessage.tempId && newMessage.tempId) {
                    return (oldMessage.tempId == newMessage.tempId);
                }
                return false
            });
            state.messages[oldMessageIndex] = newMessage;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
})
export const { setMessages, addMessage, addMessages, updateMessage, setLoading } = messageSlice.actions;
export default messageSlice.reducer