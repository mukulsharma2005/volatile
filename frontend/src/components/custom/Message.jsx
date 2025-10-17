import { useMessageConnection } from '@/sockets/connection';
import getClockTime from '@/utils/getClockTime';
import MessageSending from '@/utils/icons/MessageSending';
import { Clock, Mail, MailCheck, MailOpen, MailX } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
const breakLine = (data, max_chr) => {
    if (!data) {
        return ""
    }
    const words = data.split(" ");
    let newData = "";

    words.forEach(word => {
        if (word.length > max_chr) {
            let newWord = "";
            let i = 0;
            while (i < word.length) {
                const subStringToAdd = word.slice(i, i + max_chr);
                newWord = newWord + subStringToAdd + (subStringToAdd.length >= max_chr ? "\n" : "");
                i += subStringToAdd.length;
            }
            newData = newData + " " + newWord;
        } else {
            newData = newData + " " + word;
        }
    });
    return newData.trim();
};
const Message = ({ message }) => {
    const user_id = useSelector(state => state.auth.user?._id);
    let isMessageRead = false;
    const { markRead } = useMessageConnection();
    const messageBox = useRef(null);
    const other = user_id !== message?.sentBy?._id;
    const chat = useSelector(state => state.chats.chats).find(chat => chat._id === message.chat);
    
    const participants = chat ? [chat.createdBy, ...chat.createdFor] : [];
    if (!other) {
        try {
            const filteredParticipants = participants.filter(participant => participant._id != user_id);
            filteredParticipants.forEach(participant => {
                if (!message?.read?.includes(participant._id)) {
                    throw new Error()
                }
            })
            isMessageRead = true;
        } catch (error) {
        }
    }

    other && !message?.read?.includes(user_id) && markRead(message);
  

    return (
        <div className={`message ${!other ? 'ml-auto bg-cyan-800' : 'bg-gray-800'}  max-w-2/3 rounded-md   font-semibold py-1 px-2 w-fit flex flex-col`}>
            <h2 className='text-[11px] px-1 font-semibold text-orange-400 m-0 text-left'>{other && chat?.type == "group" && message?.sentBy?.username}</h2>
            <div className=' w-fit flex'>
                <div  className='text-start h-full  flex-grow max-w-[300px] mx-1 mr-2 break-words '>
                    {message?.message || ""}
                </div>
                <div className={`text-[9px] w-fit text-nowrap flex flex-col justify-end ${!other ? 'text-gray-300' : 'text-gray-400'}`}>
                    {
                        getClockTime(message?.createdAt)
                    }
                </div>
                {!other && <div className='w-fit flex justify-center items-end ml-2'>
                    {message?.sending && <MessageSending bgColor={"bg-cyan-800"} />}
                    {message?.isNotSent && <MailX className='size-4' fill='#a32d2882' />}
                    {!message?.sending && !message?.isNotSent &&
                        <>{(isMessageRead ? <MailOpen fill='#2ed412c9' className='size-4 ' /> : <MailCheck className='size-4' />)}</>
                    }
                </div>}
            </div>

        </div>
    )
}

export default Message
