import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Loader2, MessageSquarePlus, Trash } from 'lucide-react'
const UserCard = ({ user, pic, username, about, selected, onClick, sideButton,sideButtonAction, sideButtonLoad }) => {
  
    return (
        <div onClick={onClick} className={`w-full py-1 border-gray-600 flex gap-3 box-border px-4 items-center justify-between hover:backdrop-brightness-125 ${selected && "bg-[rgba(69,235,14,0.36)]"} ${sideButtonLoad && " load "}`}>
            <div className="pic">
                <Avatar className={"size-10"}>
                    <AvatarImage className={"w-20"} src={user?.profilePic?.url || pic || "https://github.com/shadcn.png"} alt="User" />
                    <AvatarFallback>Error</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col w-full items-start">
                <div className='flex justify-between w-full items-center'>
                    <div className="name font-semibold text-lg line-clamp-1 text-left flex items-center gap-1">{user?.username || username || ""}{user?.presence?.online && <div className='size-3 rounded-full bg-green-400 inline-block'></div>}</div>

                </div>
                <div className='flex justify-between w-full items-center'>
                    <div className="message text-sm w-9/10 h-4 overflow-hidden overflow-ellipsis text-gray-300 text-left">{user?.about || about || ""}</div>
                </div>
            </div>
            {sideButton == "userAdd" && <div className='mr-2'>
                <MessageSquarePlus onClick={sideButtonAction} className='bg-blue-500 size-5 overflow-visible p-[6px] box-content rounded-full' />
                { sideButtonLoad && <Loader2 className='animate-spin bg-blue-500 size-5 overflow-visible p-[6px] box-content rounded-full'/>}
            </div>}
            {sideButton == "delete" && <div className='mr-2'>
                <Trash onClick={sideButtonAction} className='bg-red-500 cursor-pointer size-5 overflow-visible p-[6px] box-content rounded-full' />
            </div>}
        </div>
    )
}

export default UserCard
