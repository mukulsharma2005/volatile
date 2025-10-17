import ChatCard from '@/components/custom/chatCard'
import { Menu } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import SingleChat from './singleChat'
import { useGetChats, useLiveSortedChats } from '@/api/chats'
import { useMakeConnection } from '@/sockets/connection'
import { useCheckAuth } from '@/api/auth'
import Navigation from '@/components/custom/Navigation'
import Discover from './Discover'
import ChatInfo from '@/components/custom/ChatInfo'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { PopoverTrigger } from '@radix-ui/react-popover'
import UserMenu from '@/components/custom/userMenu'
import Profile from '@/components/custom/Profile'
import CreateGroup from '@/components/custom/CreateGroup'
import { useSelector } from 'react-redux'
import NoChatWindow from '@/components/custom/NoChatWindow'
import AboutUs from '@/components/custom/aboutUs'
import { Button } from '@/components/ui/button'

const Chats = () => {
    const [navigation, setNavigation] = useState("chats");
    useCheckAuth()
    const { sortedChats } = useLiveSortedChats();
    
    const { makeConnection } = useMakeConnection();
    const [chatInfoOpen, setChatInfoOpen] = useState(false);
    const [menuPopoverOpen, setMenuPopoverOpen] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState("");
    const currentChatId = useSelector(state => state.chats.currentChatId);
    useEffect(() => {
        makeConnection()
    }, [])
    useGetChats();
    if (selectedMenuItem && menuPopoverOpen) {
        setMenuPopoverOpen(false);
    }
    return (
        <>
            <div className='text-white flex text-center h-[100dvh]'>
                <div className="chats w-[100dvw] lg:w-2/5  h-full">
                    <ScrollArea className={"w-full h-full pb-10 "}>
                        <header className='flex justify-between items-center px-4 py-1 border-box sticky top-0 z-10 theme-bg'>
                            <h1 className='bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent text-4xl font-bold py-1 animate-gradient-x title-font'>Volatile</h1>
                            <span className='rounded-lg p-1 hover:bg-gray-800 cursor-pointer'>
                                <Popover open={menuPopoverOpen} onOpenChange={setMenuPopoverOpen}>
                                    <PopoverTrigger><Menu size={30} /></PopoverTrigger>
                                    <PopoverContent className={"p-0 translate-x-[-20px] border-0 w-50 "}><UserMenu selected={selectedMenuItem} setSelected={setSelectedMenuItem} /></PopoverContent>
                                </Popover>
                            </span>
                        </header>
                        <section className='w-[100dvw] lg:w-full'>
                            {
                                navigation == "chats" ? ((sortedChats?.length!=0) ? sortedChats?.map(chat => {
                                    return <ChatCard key={chat._id} chat={chat} setChatInfoOpen={setChatInfoOpen} />
                                }): <div className='my-5 flex flex-col items-center justify-center'>
                                    <div className='text-gray-600'>Discover people to start chatting.</div>
                                    <Button onClick={()=>setNavigation("discover")} className={"bg-blue-500 text-white font-semibold hover:bg-blue-600 cursor-pointer my-2"}>Discover</Button>
                                    </div>) : <Discover />
                            }
                        </section>
                        <footer className='fixed bottom-0 z-10 w-full lg:w-2/5'>
                            <Navigation navigation={navigation} setNavigation={setNavigation} />
                        </footer>
                    </ScrollArea>
                    <ChatInfo chats={sortedChats} chatInfoOpen={chatInfoOpen} setChatInfoOpen={setChatInfoOpen} />
                    <Profile selected={selectedMenuItem} setSelected={setSelectedMenuItem} />
                    <AboutUs selected={selectedMenuItem} setSelected={setSelectedMenuItem}/>
                    <SingleChat orient={"on"} setChatInfoOpen={setChatInfoOpen}/>
                    <CreateGroup selected={selectedMenuItem} setSelected={setSelectedMenuItem} />
                </div>
                <div className="chat  md:w-3/5 box-border hidden lg:block">
                    {currentChatId ? <SingleChat setChatInfoOpen={setChatInfoOpen}/> : <NoChatWindow />}
                </div>
            </div>
            
        </>
    )
}

export default Chats
