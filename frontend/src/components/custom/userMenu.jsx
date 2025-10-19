import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Profile from './Profile';
import { useSelector } from 'react-redux';

const UserMenu = ({selected,setSelected}) => {
  const user = useSelector(state=>state.auth.user);
  return (
    <div className='bg-gray-800 flex flex-col items-center justify-center p-2 box-border w-full'>
      <Avatar className={"size-16"} onClick={(e) => { setChatInfoOpen(chat?._id); e.stopPropagation() }}>
        <AvatarImage src={ user?.profilePic?.url || "/volatile/user.jpg"} alt="User" />
        <AvatarFallback>Error</AvatarFallback>
      </Avatar>
      <h3 className='font-semibold text-xl text-white'>{user?.username}</h3>
      <div className=' box-border px-3 w-30 text-center  overflow-ellipsis overflow-hidden text-[10px] text-gray-300'>{user?.email}</div>
      <div>
        <ul className='w-full flex flex-col text-white justify-center items-center py-1 bg-gray-800 rounded-lg shadow-md'>
          <li onClick={()=>setSelected("profile")} className='w-full cursor-pointer border-b-[1px] border-gray-700 py-1 px-4 text-center hover:bg-gray-700 transition-colors duration-200'>
            Profile
          </li>
          <li onClick={()=>setSelected("createGroup")} className='w-full cursor-pointer border-b-[1px] border-gray-700 py-1 px-4 text-center hover:bg-gray-700 transition-colors duration-200'>
            Create Group
          </li>
          <li onClick={()=>setSelected("aboutUs")} className='w-full cursor-pointer py-1 px-4 text-center hover:bg-gray-700 transition-colors duration-200'>
            About us
          </li>
        </ul>
      </div>
    </div>
  )
}

export default UserMenu
