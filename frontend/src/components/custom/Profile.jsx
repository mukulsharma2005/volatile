import { Cross, LogOut, Pencil, Plus } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { useUpdateUser } from '@/api/users';
import { useAuth } from '@/api/auth';

const Profile = ({ selected, setSelected }) => {
    const user = useSelector(state => state.auth.user);
    const [about, setAbout] = useState(user?.about || "");
    const [profilePic, setProfilePic] = useState( user?.profilePic?.url || null)
    const [aboutEditOpen, setaboutEditOpen] = useState(false);
    const { updateAbout, updateProfilePic, load, response, setResponse } = useUpdateUser();
    const [newImageFile, setNewImageFile] = useState("");
    const { logout, load: authLoad } = useAuth();
    const cancelAboutEdit = () => {
        setaboutEditOpen(false);
        setAbout(user?.about || "");
    }
    const updateAboutHandler = async (e) => {
        e.preventDefault();
        // console.log(about);

        await updateAbout(about);
        // console.log(response)

    }
    const picChangeHandler = (e) => {
        const image = e.target.files[0];
        if (image) {
            const url = URL.createObjectURL(image);
            setProfilePic(url);
            setNewImageFile(image);
            console.log("run");
            
        }
    }
    const updatePicHandler = async ()=>{
       const res = await updateProfilePic(newImageFile);
       if (res?.success){
        setNewImageFile("");
       }
    }
    useEffect(() => {
        if (response?.success) {
            setaboutEditOpen(false);
            setResponse("");
        }
    }, [response])
    
    return (
        <div className={`w-full lg:w-2/5 h-[100dvh] flex flex-col gap-2 items-center absolute top-0 left-0 box-border theme-bg z-50 ${(load || authLoad) && " load "}  ${selected != "profile" && "hidden"}`}>
            <ScrollArea className={"h-full w-full flex flex-col box-border p-2 gap-2 items-center hide-scroll pb-8"}>
                <div className='flex justify-start w-full  '>
                    <Plus className='rotate-45 box-content p-2 cursor-pointer rounded-full hover:backdrop-brightness-125' onClick={() => setSelected("")} />
                </div>
                <div className='w-fit mx-auto relative'>
                    <label htmlFor='profilePic'>
                        <Avatar className={"size-40"}>
                            <AvatarImage className={""} src={profilePic  || "/volatile/user.jpg"} alt="User" />
                            <AvatarFallback>Error</AvatarFallback>
                        </Avatar>
                        <Pencil className='absolute bottom-0 right-0 size-10 rounded-full p-2 bg-blue-500 overflow-visible' />
                    </label>
                    <input accept={"image/*"} id="profilePic" name='profilePic' type='file' className='hidden' onChange={picChangeHandler} />
                </div>
                {(newImageFile) && <div className='flex my-1 mt-3 gap-4 justify-center font-bold text-sm'>
                    <button onClick={updatePicHandler} className={"bg-blue-600 hover:bg-blue-700 cursor-pointer rounded-lg py-1 w-20"}>Update</button>
                    <button className='cursor-pointer rounded-lg py-1 w-20 bg-black border-white border-2 text-white hover:bg-white hover:border-white hover:text-black' onClick={()=>{setNewImageFile("");setProfilePic(user?.profilePic?.url)}}>Cancel</button>
                </div>}
                <section className='flex flex-col justify-center items-center gap-2 flex-grow'>
                    <div className='text-2xl flex justify-center items-center font-semibold'>
                        {user?.username}
                    </div>
                    <div className='text-sm text-gray-600'>
                        {user?.email}
                    </div>
                    <div className='w-full text-start'>
                        <h2 className='text-xl font-semibold ml-1 mb-1'>About</h2>
                        <Separator />
                        <div hidden={aboutEditOpen} className='ml-2 p-2' onClick={(e) => { setaboutEditOpen(true); e.stopPropagation() }}>
                            {user?.about || <span className='text-gray-600'>Describe yourself (Click to change)</span>}
                        </div>
                        <form onSubmit={updateAboutHandler} action="" onClick={(e) => e.stopPropagation()} className=' border-2 p-1 my-2 border-blue-600 rounded-xl' hidden={!aboutEditOpen}>
                            <textarea value={about} onChange={(e) => setAbout(e.target.value)} className='w-full h-full focus:outline-none focus:border-none hide-scroll p-2 box-border' name="about" id="about" placeholder='Describe yourself'></textarea>
                            <div className='flex justify-around py-1'>
                                <Button onClick={() => cancelAboutEdit()} type="button" variant="outline" className={"theme-bg hover:text-black cursor-pointer hover:!bg-white"}>Cancel</Button>
                                <Button type="submit" className={"bg-blue-600 hover:bg-blue-700 cursor-pointer"}>Update</Button>
                            </div>
                        </form>
                    </div>
                </section>

            </ScrollArea>
            <footer className='w-full absolute bottom-0'>
                <div className='w-full bg-[rgba(255,0,0,0.13)] text-red-500 cursor-pointer font-semibold py-1 text-center text-xl flex justify-center items-center gap-1' onClick={() => logout()}>Log out<LogOut /></div>
            </footer>
        </div>
    )
}

export default Profile
