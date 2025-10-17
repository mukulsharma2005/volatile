import { Cross, Edit, Pencil, Plus, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from '../ui/separator'
import { useSelector } from 'react-redux'
import GroupMember from './GroupMember'
import { ScrollArea } from '../ui/scroll-area'
import { useDeleteGroup, useGetGroupStatus, useGroupControls, useUpdateGroupInfo } from '@/api/groups'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import UsersSelection from './UsersSelection'
import { useDeleteChat } from '@/api/chats'
import getPresence from '@/utils/getPresence'
import { Button } from '../ui/button'
import ImageViewer from './ImageViewer'
const ChatInfo = ({ chats, chatInfoOpen, setChatInfoOpen }) => {
  const [chat, setChat] = useState("");
  useEffect(() => {
    const selectedChat = chats.find(chat => chat._id == chatInfoOpen);
    if (selectedChat) {
      setChat(selectedChat);
    }
  }, [chatInfoOpen, chats]);
  return (
    <div className={`w-full lg:w-2/5 h-[100dvh] flex flex-col overflow-y-auto hide-scroll absolute top-0 z-60 box-border theme-bg ${(!chatInfoOpen) && "hidden"}`}>

      <div className='flex justify-between items-center box-border pr-3 py-1'>
        <Plus className='rotate-45 p-2  box-content rounded-full hover:backdrop-brightness-150 cursor-pointer' onClick={() => setChatInfoOpen(false)} />
      </div>
      <>
        {chat?.type && chat?.type == "single" ? <SingleUser key={chat?._id} chat={chat} setChatInfoOpen={setChatInfoOpen} /> : <Group key={chat?._id} chat={chat} />}
      </>
    </div>
  )
}
export default ChatInfo
const SingleUser = ({ chat, setChatInfoOpen }) => {
  const user = useSelector(state => state.auth.user);
  const targetUser = [chat?.createdBy, chat?.createdFor[0]].find(obj => obj._id != user._id);
  const { deleteChat, chatDeleteLoad, response: chatDeleteResponse } = useDeleteChat();
  useEffect(() => {
    if (chatDeleteResponse?.success) {
      setChatInfoOpen(false);
    }
  }, [chatDeleteResponse]);
  return <>
    <section className='flex flex-col items-center w-full flex-grow box-border p-1 '>
      <ImageViewer url={chat?.chatPic || "https://github.com/shadcn.png"}>
        <Avatar className={"size-40 box-border"} >
          <AvatarImage className={" "} src={chat?.chatPic || "https://github.com/shadcn.png"} alt="User" />
          <AvatarFallback>Error</AvatarFallback>
        </Avatar>
      </ImageViewer>
      <div className="username text-3xl text-center mt-4 mb-[2px]">{targetUser?.username}</div>
      <div className="center text-sm text-gray-500 font-sans lg:hidden">
        {(targetUser?.presence?.online && "Online") || getPresence(targetUser?.presence?.lastSeen) || ""}
      </div>
      <div className='text-left text-2xl w-full font-semibold ml-2'>About</div>
      <Separator className={"bg-gray-600"} />
      <div className="about text-left w-full text-sm px-2 box-border my-1">
        {targetUser?.about || <span className='text-gray-400'>User has not written about.</span>}
      </div>
    </section>
    <footer className=''>
      <div className="buttons">
        <button onClick={() => deleteChat(chat?._id)} className={`w-full ${chatDeleteLoad && "load"}  bg-[rgba(255,0,0,0.11)] font-semibold text-red-500 py-2 text-center cursor-pointer`}>Delete Chat</button>
      </div>
    </footer>
  </>
}
const Group = ({ chat }) => {
  const members = chat ? [chat?.createdBy, ...chat?.createdFor] : [];
  const [usersSelectionOpen, setUsersSelectionOpen] = useState(false);
  const [groupNameChangeOpen, setGroupNameChangeOpen] = useState(false);
  const [groupDescriptionChangeOpen, setGroupDescriptionChangeOpen] = useState(false);
  const [groupInfo, setGroupInfo] = useState({
    groupName: chat?.group?.groupName,
    groupDescription: chat?.group?.description,
    groupPic: chat?.group?.groupPic?.url,
  });
  const [newImageFile, setNewImageFile] = useState("");
  const changeHandler = (e) => setGroupInfo({ ...groupInfo, [e.target.name]: e.target.value });
  const [load, setLoad] = useState(false)
  const { admin } = useGetGroupStatus(chat?._id);
  const { addMembers } = useGroupControls();
  const { deleteGroup, response: deleteGroupResponse, load: deleteGroupLoad } = useDeleteGroup();
  const [selected, setSelected] = useState([]);
  const { updateGroupName, updateGroupDescription, updateGroupPic, load: groupInfoUpdateLoad, } = useUpdateGroupInfo();
  const user = useSelector(state => state.auth.user);
  const picChangeHandler = (e) => {
    const image = e.target.files[0];
    if (image) {
      const url = URL.createObjectURL(image);
      setGroupInfo({ ...groupInfo, groupPic: url });
      setNewImageFile(image);
    }
  }
  const addMemberHandler = async (selected, group_id) => {
    const selectedMembersIds = selected.map(member => member._id);
    setLoad(true)
    await addMembers(selectedMembersIds, group_id);
    setLoad(false);
    setUsersSelectionOpen(false);
    setSelected([]);
  }
  const updateNameHandler = async (e) => {
    e && e.preventDefault();
    const res = await updateGroupName(chat.group._id, groupInfo.groupName);
    if (res?.success) {
      setGroupNameChangeOpen(false);
    }
  }
  const updateDescriptionHandler = async (e) => {
    e && e.preventDefault();
    const res = await updateGroupDescription(chat.group._id, groupInfo.groupDescription);
    if (res?.success) {
      setGroupDescriptionChangeOpen(false);
    }
  }
  const updatePicHandler = async () => {
    if (!newImageFile) return;
    const res = await updateGroupPic(chat.group._id, newImageFile);
    if (res?.success) {
      setNewImageFile("");
    } else {
      console.log(res);
    }
  }
  return (
    <>
      <section className={`flex flex-col items-center w-full flex-grow box-border p-1 ${(deleteGroupLoad || groupInfoUpdateLoad) && "load"}`}>
        <div className='w-fit mx-auto relative'>

          {admin ? <>
            <label htmlFor='profilePic'>
              <Avatar className={"size-40"}>
                <AvatarImage className={""} src={groupInfo.groupPic || "https://github.com/shadcn.png"} alt="User" />
                <AvatarFallback>Loading...</AvatarFallback>
              </Avatar>
              {admin && <Pencil className='absolute bottom-0 right-0 size-10 rounded-full p-2 bg-blue-500 overflow-visible' />}
            </label>
            <input id="profilePic" type='file' className='hidden' onChange={picChangeHandler} />
          </> : <Avatar className={"size-40"}>
            <AvatarImage className={""} src={groupInfo.groupPic || "https://github.com/shadcn.png"} alt="User" />
            <AvatarFallback>Error</AvatarFallback>
          </Avatar>}
        </div>
        {(newImageFile) && <div className='flex my-1 mt-3 gap-4 justify-center font-bold text-sm'>
          <button onClick={updatePicHandler} className={"bg-blue-600 hover:bg-blue-700 cursor-pointer rounded-lg py-1 w-20"}>Update</button>
          <button className='cursor-pointer rounded-lg py-1 w-20 bg-black border-white border-2 text-white hover:bg-white hover:border-white hover:text-black' onClick={() => { setNewImageFile(""); setProfilePic(user?.profilePic?.url) }}>Cancel</button>
        </div>}
        <>
          {groupNameChangeOpen ? <form onSubmit={updateNameHandler} className="username-update text-center my-4 box-border p-2 flex flex-col justify-center items-center border-blue-500 border-2 rounded-xl py-1 px-2 text-xl gap-1" >
            <input autoFocus defaultValue={chat?.group?.groupName} name='groupName' onChange={changeHandler} value={groupInfo?.groupName} className='text-center focus:outline-0 bg-gray-800 py-0.5 rounded-md border-2 focus:border-gray-400 border-gray-500 my-1' />
            <div className='flex justify-around py-1 w-full my-1 font-bold'>
              <button onClick={() => setGroupNameChangeOpen(false)} type="button" variant="outline" className={"theme-bg rounded-md text-sm px-3 py-0.5 hover:text-black cursor-pointer hover:!bg-white border-2 border-white"}>Cancel</button>
              <button type="submit" className={"bg-blue-600 rounded-md text-sm px-3 py-0.5 hover:bg-blue-700 cursor-pointer"}>Update</button>
            </div>
          </form> :
            <div className="username text-3xl text-center my-4 flex wrap-normal items-center cursor-pointer" onClick={() => admin && setGroupNameChangeOpen(true)}>
              {chat?.group?.groupName} {admin && <Edit className='box-content rounded-full mx-2 p-[6px] overflow-visible size-5 bg-blue-500' />}
            </div>
          }
        </>
        <>
          <div className='text-left text-2xl w-full font-semibold ml-2 my-1'>Group Description</div>
        </>
        <Separator className={"bg-gray-600"} />
        <>
          {
            groupDescriptionChangeOpen ? <form action="" onSubmit={updateDescriptionHandler} className=' border-2 box-border p-1 px-2 my-2 border-blue-600 rounded-xl w-full'>
              <textarea autoFocus defaultValue={groupInfo?.groupDescription || ""} value={groupInfo?.groupDescription} name={"groupDescription"} onChange={changeHandler} className='w-full focus:outline-none focus:border-none hide-scroll p-2 box-border' id="about" placeholder='Describe group'></textarea>
              <div className='flex justify-around py-1'>
                <Button onClick={() => setGroupDescriptionChangeOpen(false)} type="button" variant="outline" className={"theme-bg hover:text-black cursor-pointer hover:!bg-white"}>Cancel</Button>
                <Button type="submit" className={"bg-blue-600 hover:bg-blue-700 cursor-pointer"}>Update</Button>
              </div>
            </form> : <div onClick={() => admin && setGroupDescriptionChangeOpen(true)} className="about text-left w-full text-sm px-2 box-border my-1">
              {chat?.group?.description || <span className='text-gray-400'>Description not set.</span>}
            </div>

          }
        </>

        <div className='text-left text-2xl w-full flex justify-between box-border pr-6 items-center font-semibold ml-2 pt-3 my-1'>
          <span>Participants</span>
          {admin && <div className='w-fit'>
            <Dialog open={usersSelectionOpen} onOpenChange={setUsersSelectionOpen}>
              <DialogTrigger>
                <Plus className='p-1 rounded-full hover:backdrop-brightness-125 box-content' />
              </DialogTrigger>
              <DialogContent className={"p-0 top-4 !max-w-[400px]"}>
                <UsersSelection action={() => addMemberHandler(selected, chat?.group?._id)} selected={selected} setSelected={setSelected} setUsersSelectionOpen={setUsersSelectionOpen} load={load} unwantedUsersIds={members?.map(member => member?._id)} />
              </DialogContent>
            </Dialog>
          </div>}
        </div>
        <Separator className={"bg-gray-600"} />
        <div className="participants w-full my-2 flex flex-col">
          {members && members?.map(member => {
            return <GroupMember key={member?._id} member={member} chat_id={chat?._id} isCreator={chat?.createdBy?._id == member?._id} isAdmin={chat?.group?.admin?.includes(member?._id)} isGroupDeleted={chat?.deleted} />
          })}
        </div>
      </section>
      <footer className=''>
        <div className="buttons">
          {!chat?.deleted && <button onClick={() => deleteGroup(chat?.group?._id, chat?.createdBy?._id)} className={`w-full bg-[rgba(255,0,0,0.11)] font-semibold text-red-500 py-2 text-center cursor-pointer`}>
            {user?._id == chat?.createdBy?._id ? "Delete group for everyone" : "Delete group for me"}
          </button>}
        </div>
      </footer>
    </>
  )
}