import React, { useEffect, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChatId } from '@/redux/chats.slice';
import getClockTime from '@/utils/getClockTime';
const ChatCard = ({ chat ,setChatInfoOpen}) => {
    const dispatch = useDispatch();
    const currentChatId = useSelector(state => state.chats.currentChatId);
    return (
        <div onClick={() => dispatch(setCurrentChatId(chat._id))} className={`w-[100dvw] lg:w-full overflow-y-auto py-1 border-gray-600 flex gap-3 box-border px-4 items-center justify-between hover:backdrop-brightness-125 ${currentChatId == chat?._id && "backdrop-brightness-125"}`}>
            <div className="pic ">
                <Avatar className={"size-10"} onClick={(e)=>{setChatInfoOpen(chat?._id);e.stopPropagation()}}>
                    <AvatarImage className={"w-20"} src={chat?.chatPic || "/user.jpg"} alt="User" />
                    <AvatarFallback>Error</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col w-[84%] lg:w-[95%] items-start ">
                <div className='flex justify-between w-full items-center'>
                    <div className="name font-semibold text-lg line-clamp-1 text-left">{chat?.chatName || ""}</div>
                    <span className='text-[12px] font-medium text-gray-300'>{
                        getClockTime(chat?.lastMessage?.createdAt)
                        }</span>
                </div>
                <div className='flex justify-between w-full items-center '>
                    <div className="message text-sm w-[350px] h-6 overflow-hidden hide-scroll overflow-ellipsis text-gray-300 text-left">{chat?.lastMessage?.message || ""}</div>
                    {chat?.unread > 0 && <span className=' text-sm font-bold rounded-full bg-purple-600 size-5 flex justify-center items-center'>{chat?.unread}</span>}
                </div>
            </div>
        </div>
    )
}

export default ChatCard;

