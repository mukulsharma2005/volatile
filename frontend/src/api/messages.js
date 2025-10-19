import { addMessage,  addMessages,  setLoading, setMessages } from "@/redux/message.slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_API_ENDPOINT } from "@/utils/constants";
export function useGetMessages() {
    const dispatch = useDispatch();
    const getMessages = async () => {
        try {
            dispatch(setLoading(true))
            const res = await fetch(`${BASE_API_ENDPOINT}/chats/messages`, {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                dispatch(setMessages(data.messages))
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const syncMessages = async () => {
        try {
            dispatch(setLoading(true))
            const res = await fetch(`${BASE_API_ENDPOINT}/chats/messages/sync`, {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                    dispatch(addMessages(data.messages));
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(setLoading(false))
        }
    }
    return { getMessages,syncMessages };
}

