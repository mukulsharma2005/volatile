import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import UserCard from './userCard';
import { useLiveSortedChats } from '@/api/chats';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { useGetUsers } from '@/api/users';

const UsersSelection = ({ selected, setSelected, setUsersSelectionOpen, action, load, unwantedUsersIds }) => {
  const [chatType, setChatType] = useState("My Chats");
  const { users } = useGetUsers()
  const addableUsers = users.filter(user => !unwantedUsersIds?.includes(user?._id));
  const { sortedChats: localChats } = useLiveSortedChats();
  const localSingleChats = localChats.filter(chat => chat?.type == "single").filter(chat => !unwantedUsersIds?.includes(chat?.targetUserId));
  const selectHandler = (member) => {
    if (!selected?.map(member=>member._id)?.includes(member._id)) {
      setSelected([...selected, member]);
    } else {
      setSelected([...selected.filter(existingMember => existingMember._id != member._id)]);
    }
  }
  return (
    <div className={`w-full h-[90dvh] absolute top-0 z-30 theme-bg flex flex-col text-white p-3 px-5 box-border ${load && "load"}`}>
      <div className='text-xl font-semibold py-4 text-center'>Add particpants</div>
      <div className='text-sm pb-1'>Selected: {selected?.length || 0}</div>
      <div className='flex w-full box-border px-2 justify-around py-1 pb-3'>
        <div className={`rounded-full cursor-pointer w-fit px-3 py-[1px] border-2 border-gray-200 text-gray-200 text-center font-bold text-[13px] ${chatType == "My Chats" && "bg-gray-200 text-gray-800"}`} onClick={() => setChatType("My Chats")}>My Chats</div>
        <div className={`rounded-full cursor-pointer w-fit px-3 py-[1px] border-2 border-gray-200 text-gray-200 text-center font-bold text-[13px] ${chatType == "Global Chats" && "bg-gray-200 text-gray-800"}`} onClick={() => setChatType("Global Chats")}>Global Chats</div>
      </div>

      <ScrollArea className={"w-full h-[62%]"}>
        <div className='flex flex-col gap-1'>
          {chatType == "My Chats" && <>
            {(localSingleChats?.length > 0) ? localSingleChats?.map(chat => {
              return <UserCard onClick={() => selectHandler({_id:chat?.targetUserId,username:chat?.chatName,profilePic: {url : chat?.chatPic},about:chat?.about})} selected={selected?.map(member=>member._id)?.includes(chat?.targetUserId)} key={chat?._id} pic={chat?.chatPic} username={chat?.chatName} about={chat?.about} />
            }) : <div className='w-full h-full flex justify-center items-center pt-8 text-gray-500'>No chat friends can be selected</div>}
          </>}
          {chatType == "Global Chats" && <>
            {
              (addableUsers?.length>0) ? addableUsers?.map(singleUser => {
                return <UserCard onClick={() => selectHandler(singleUser)} selected={selected?.map(member=>member._id)?.includes(singleUser?._id)} key={singleUser?._id} user={singleUser} />
              }) : <div className='w-full h-full flex justify-center items-center pt-8 text-gray-500'>No global friends can be selected</div>
            }
          </>}
        </div>
      </ScrollArea>

      <div className='flex w-full justify-around items-center py-1 z-40 flex-grow'>
        <Button onClick={() => setUsersSelectionOpen(false)} type={"outline"} className={"w-30 rounded-lg hover:scale-105 box-border border-2 border-amber-100"}>Cancel</Button>
        <Button onClick={action} className={"w-30 rounded-lg bg-amber-200 hover:scale-105 hover:bg-amber-200 text-black "}>
          {!load ? "Add" : "Adding"}
        </Button>
      </div>
    </div>
  )
}

export default UsersSelection;
