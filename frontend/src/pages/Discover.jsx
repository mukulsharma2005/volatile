import { useCreateChat } from '@/api/chats'
import { useGetUsers } from '@/api/users'
import UserCard from '@/components/custom/userCard'
import UsersSkeleton from '@/components/skeletons/usersSkeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'

const Discover = () => {
  const { users, response, load } = useGetUsers();
  const { createChat, response: createChatResponse, chatCreateLoad } = useCreateChat();
  const createChatHandler = async (_id) => {
    await createChat(_id);
  }
  return (
    <div className={` ${chatCreateLoad && " load "}`}>
      <div className='flex justify-center items-center gap-1 sticky top-0 z-30 theme-bg py-1'>
        <Input className={"h-8 w-4/5 my-1 mx-1 rounded-xl bg-[rgb(27,27,27)]"} placeholder={"Search for people"} />
        <Search className='size-6 rounded-full hover:backdrop-brightness-105 ' />
      </div>
      {load ? <UsersSkeleton/> : users && users.length > 0 ? users.map(user => {
        return <UserCard user={user} key={user?._id} sideButton={"userAdd"} sideButtonAction={() => createChatHandler(user?._id)} />
      }) : <div className='text-gray-500 my-3'>No users found.</div>}
    </div>
  )
}

export default Discover
