import { ArrowBigUpDash, ArrowLeft, EllipsisVertical } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { ScrollArea } from '@/components/ui/scroll-area'
import Message from '@/components/custom/Message'
import { useDispatch, useSelector } from 'react-redux'
import { useMessageConnection } from '@/sockets/connection'
import { useDeleteChat, useLiveSortedChats } from '@/api/chats'
import { setCurrentChatId } from '@/redux/chats.slice'
import getPresence from '@/utils/getPresence'
import ImageViewer from '@/components/custom/ImageViewer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
const SingleChat = ({ orient, setChatInfoOpen }) => {
    const scrollAreaRef = React.useRef(null);
    const { sendMessage, messageResponse, } = useMessageConnection();
    const [menuPopoverOpen, setmenuPopoverOpen] = useState(false);
    const [message, setMessage] = useState("")
    const currentChatId = useSelector(state => state.chats.currentChatId);
    const { sortedChats } = useLiveSortedChats();
    const currentChat = sortedChats.find(chat => chat._id == currentChatId);
    const dispatch = useDispatch();
    const sendButtonRef = useRef(null);
    const {deleteChat, chatDeleteLoad} = useDeleteChat();
    const chatMessages = useSelector(state => state.message.messages).filter(message => message.chat == currentChat?._id).sort((a, b) => {
        const a_time = new Date(a.createdAt).getTime()
        const b_time = new Date(b.createdAt).getTime()
        return b_time - a_time;
    });
    useEffect(() => {
        const messageBox = document.getElementById('messageBox');
        messageBox.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';

            // Limit expansion to a maximum of 4 rows.
            const maxHeight = 3 * parseInt(window.getComputedStyle(this).lineHeight);
            if (this.scrollHeight > maxHeight) {
                this.style.overflowY = 'scroll';
                this.style.height = maxHeight + 'px';
            } else {
                this.style.overflowY = 'hidden';
            }
        });
    }, [])
    const user_id = useSelector(state => state.auth.user._id);
    useEffect(() => {
        if (messageResponse?.success) {
            setMessage("")
        }
    }, [messageResponse]);
    const sendMessageHandler = async (e) => {
        e && e.preventDefault();
        if (message) {
            sendMessage({
                sentBy: user_id,
                chat: currentChat._id,
                message
            });
            setMessage("")
        }
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageHandler()
        }
    };
    useEffect(() => {

        const scrollViewport = scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]'
        )

        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight
        }
    }, [chatMessages])
    const deleteChatHandler =async  ()=>{
         await deleteChat(currentChat?._id);
         setmenuPopoverOpen(false);
    }
    return (
        <div className={`w-full !h-[100dvh] box-border flex flex-col ${chatDeleteLoad && " load "}` + (!currentChat && " hidden ") + (orient == "on" && " absolute top-0 z-50 left-0 lg:hidden ")}>
            <header className='py-2 px-2 box-border sticky top-0 left-0 flex justify-between items-center h-[10dvh] max-h-14 z-10 theme-bg'>
                <div className='left flex gap-1 items-center'>
                    <div className='rounded-full flex justify-center items-center size-7 hover:backdrop-brightness-150'>
                        <ArrowLeft size={20} onClick={() => dispatch(setCurrentChatId(""))} />
                    </div>
                    <div className="profilePic mr-1 flex items-center">
                        <ImageViewer url={currentChat?.chatPic || "/user.jpg"}>
                            <Avatar className={"lg:size-7"}>
                                <AvatarImage src={currentChat?.chatPic || "/user.jpg"} alt="User" />
                                <AvatarFallback>Error</AvatarFallback>
                            </Avatar>
                        </ImageViewer>
                    </div>
                    <div className='flex flex-col items-start justify-center ml-[2px]' onClick={() => setChatInfoOpen(currentChat?._id)}>
                        <div className="name text-xl font-semibold flex items-center w-fit ">
                            {currentChat?.chatName}
                        </div>
                        <div className="center text-[12px] text-gray-500 font-sans lg:hidden">
                            {(currentChat?.chatPresence?.online && "Online") || getPresence(currentChat?.chatPresence?.lastSeen) || ""}
                        </div>
                    </div>
                </div>
                <div className="center text-[12px] text-gray-500 font-sans hidden lg:block">
                    {(currentChat?.chatPresence?.online && "Online") || getPresence(currentChat?.chatPresence?.lastSeen) || ""}
                </div>
                <div className="right rounded-full size-8 flex justify-center items-center hover:backdrop-brightness-150">
                    <Popover open={menuPopoverOpen} onOpenChange={setmenuPopoverOpen}>
                        <PopoverTrigger>
                            <EllipsisVertical size={18} />
                        </PopoverTrigger>
                        <PopoverContent className={"p-0 translate-x-[-20px] border-0 w-fit "}>
                              <div className='bg-gray-800 flex flex-col items-center justify-center box-border w-full p-2'>
                                  <div>
                                    <ul className='w-full flex flex-col text-white justify-center items-center py-1 bg-gray-800 rounded-lg shadow-md'>
                                      <li onClick={() => {setChatInfoOpen(currentChat?._id);setmenuPopoverOpen(false)}} className='w-full cursor-pointer border-b-[1px] border-gray-700 py-1 px-4 text-center hover:bg-gray-700 transition-colors duration-200'>
                                        View Profile
                                      </li>
                                      
                                      <li onClick={()=>{deleteChat(currentChat?._id);setmenuPopoverOpen(false)}} className='w-full cursor-pointer py-1 px-4 text-red-500 text-center hover:bg-gray-700 transition-colors duration-200'>
                                        { chatDeleteLoad ? "Deleting..." : "Delete Chat"}
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </header>
            <div className="chat-room w-full flex flex-col justify-end box-border px-3 pb-2 min-h-[90dvh] flex-grow ">
                <ScrollArea ref={scrollAreaRef} className={"h-[90%] w-full "}>
                    <div className={`messages flex flex-col box-border justify-end p-4 text-[14px] gap-2 `}>
                        {
                            chatMessages?.length > 0 && chatMessages.toReversed().map((message) => {
                                return <Message key={message._id || message.tempId} message={message} />
                            })
                        }
                    </div>
                </ScrollArea>
                {(!currentChat?.deleted)
                    ?
                    <form onSubmit={sendMessageHandler} className="input-message w-11/12 mx-auto pl-5 h-fit pr-1 box-border flex items-center rounded-xl border-[1px] border-gray-500  bg-[#1f2121] hide-scroll">
                        <textarea ref={sendButtonRef} id="messageBox" rows={1} onKeyDown={handleKeyDown} value={message} onChange={(e) => setMessage(e.target.value)} type="text " className=' focus:outline-0 flex-grow  py-2 hide-scroll' placeholder='Keh dijiye jo dil mein hai'></textarea>
                        <button onClick={() => sendButtonRef?.current?.focus()} className='size-8 bg-blue-600 flex justify-center cursor-pointer items-center rounded-full'>
                            <ArrowBigUpDash size={22} />
                        </button>
                    </form> : <div class="w-full text-center py-1 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 text-lg font-medium shadow-md">
                        {currentChat?.type != "single" ? "You are no longer a participant in group." : "Chat no longer exists."}
                    </div>}
            </div>
        </div>
    )
}

export default SingleChat
