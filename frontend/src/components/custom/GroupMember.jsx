import React, { useEffect, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { EllipsisVertical } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { useGetGroupStatus, useGroupControls } from '@/api/groups'
import { useDispatch, useSelector } from 'react-redux'
import { useCreateChat, useLiveSortedChats } from '@/api/chats'
import { setCurrentChatId } from '@/redux/chats.slice'
const GroupMember = ({ member, isCreator, isAdmin, chat_id,isGroupDeleted }) => {
    const [memberOptionsOpen, setMemberOptionsOpen] = useState(false);
    const user = useSelector(state => state.auth.user);
    return (
        <div className={`w-full ${(user._id == member._id) && "order-first"} py-1 border-gray-600 flex gap-3 box-border px-4 items-center justify-between hover:backdrop-brightness-125 `}>
            <div className="pic">
                <Avatar className={"size-10"}>
                    <AvatarImage className={"w-20"} src={member?.profilePic?.url || "/volatile/user.jpg"} alt="User" />
                    <AvatarFallback>Error</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col w-full items-start">
                <div className='flex justify-between w-full items-center '>
                    <div className="name font-semibold text-lg line-clamp-1 flex items-center gap-2 text-left">{member?.username || ""}{(user._id == member._id) && " (You)"}
                        {isCreator && <Badge className={"bg-[rgba(166,101,21,0.19)] rounded-full border-2 border-orange-500 text-orange-500"}>Creator</Badge>}
                        {isAdmin && <Badge className={"bg-[rgba(10,138,250,0.08)] rounded-full border-2 border-blue-500 text-blue-500"}>Admin</Badge>}
                    </div>

                </div>
                <div className='flex justify-between w-full items-center'>
                    <div className="message text-sm w-9/10 h-6 overflow-hidden overflow-ellipsis text-gray-300 text-left">{member?.about || ""}</div>
                </div>
            </div>
            <div className={`mr-2 ${((user._id == member._id) || isGroupDeleted) && "hidden"}`}>
                <Dialog open={memberOptionsOpen} onOpenChange={setMemberOptionsOpen}>
                    <DialogTrigger>
                        <EllipsisVertical className='rounded-full cursor-pointer hover:backdrop-brightness-125' />
                    </DialogTrigger>
                    <DialogContent className={" overflow-hidden theme-bg "}>
                        <MemberPopover setMemberOptionsOpen={setMemberOptionsOpen} member={member} chat_id={chat_id} isMemberAdmin={isAdmin} isMemberCreator={isCreator} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default GroupMember
const MemberPopover = ({ member, isMemberAdmin, isMemberCreator, chat_id, setMemberOptionsOpen }) => {
    const { admin, creator } = useGetGroupStatus(chat_id);
    const { makeMemberAdmin, demoteMemberAdmin, removeMember, response, load } = useGroupControls(chat_id);
    const { createChat, chatCreateLoad,reponse:chatCreateResponse } = useCreateChat();
    const { sortedChats } = useLiveSortedChats();
    
    const dispatch = useDispatch();
    const existingUserChats = sortedChats.filter(chat => chat.type == "single").map(chat => chat?.targetUserId);
    useEffect(()=>{
        if (chatCreateResponse?.success){
            setMemberOptionsOpen(false);
            dispatch(setCurrentChatId(chatCreateResponse?.chat?._id));
        }
    },[chatCreateResponse])
    if (response.success) {
        setMemberOptionsOpen(false);
    }
    const Option = ({ option, onClick }) => {
        return <li className='border-2 border-white rounded-md cursor-pointer py-1 px-1 text-sm w-36 hover:bg-orange-100 hover:text-gray-800 hover:font-bold' onClick={onClick}>{option}</li>
    }
    const messageChat = (_id) => {
        if (_id && existingUserChats.includes(_id)) {

            const chatToMessage = sortedChats.find(chat => {
                return (chat.type == "single") && (chat.createdBy._id == _id || chat.createdFor.map(obj => obj._id).includes(_id))
            });
            setMemberOptionsOpen(false)
            dispatch(setCurrentChatId(chatToMessage._id));
        }
    }
    return (
        <div className={`flex flex-col items-center text-white ${load || chatCreateLoad && "load"}`}>
            <Avatar className={"size-20"}>
                <AvatarImage className={"w-20"} src={member?.profilePic?.url || "https://github.com/shadcn.png"} alt="User" />
                <AvatarFallback>Error</AvatarFallback>
            </Avatar>
            <div className='my-1 text-xl'>{member?.username}</div>
            <ul className='my-1 flex flex-col items-center text-center gap-2'>
                {(!existingUserChats.includes(member._id)) ? <li onClick={()=>{createChat(member?._id);setMemberOptionsOpen(false)}} className='border-2 border-white rounded-md cursor-pointer py-1 px-1 text-sm w-36 hover:bg-orange-100 hover:text-gray-800 hover:font-bold'>Create Chat</li> :
                    <li className='border-2 border-white rounded-md cursor-pointer py-1 px-1 text-sm w-36 hover:bg-orange-100 hover:text-gray-800 hover:font-bold' onClick={() => messageChat(member._id)}>Message</li>}
                {admin && !isMemberAdmin && <Option option={"Make Admin"} onClick={() =>{makeMemberAdmin(member?._id);setMemberOptionsOpen(false)}} />}
                {admin && isMemberAdmin && !isMemberCreator && <Option option={"Demote Admin"} onClick={() =>{demoteMemberAdmin(member?._id);setMemberOptionsOpen(false)}} />}
                {admin && !isMemberCreator && <Option option={"Remove"} onClick={() =>{removeMember(member?._id);setMemberOptionsOpen(false)}} />}
            </ul>
        </div>
    )
}
