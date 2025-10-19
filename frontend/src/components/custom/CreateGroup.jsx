import { Pencil, Plus } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import UserCard from './userCard'
import { Separator } from '../ui/separator'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import UsersSelection from './UsersSelection'
import { useCreateGroup } from '@/api/groups'
const CreateGroup = ({ selected, setSelected }) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [finalSelectedMembers, setFinalSelectedMembers] = useState([]);
    const [groupInfo, setGroupInfo] = useState({
        groupName: "",
        groupDescription: "",
        groupPic: "",
    });
    const [groupPicURL, setGroupPicURL] = useState("");
    const [userSelectionOpen, setUsersSelectionOpen] = useState(false);
    const { createGroup, load: createGroupLoad, response: createGroupResponse } = useCreateGroup();
    const groupForm = useRef();
    useEffect(() => {
        if (createGroupResponse?.success) {
            setSelected("");
            setGroupInfo({});
            setFinalSelectedMembers([]);
            setSelectedMembers([]);
        }
    }, [createGroupResponse])
    const addMemberHandler = () => {
        setUsersSelectionOpen(false);
        setFinalSelectedMembers(selectedMembers);
    }
    const createGroupHandler = async () => {
        if (groupInfo.groupName) {
            await createGroup({
                groupName: groupInfo.groupName,
                groupDescription: groupInfo.groupDescription,
                groupPic: groupInfo.groupPic,
                members: finalSelectedMembers.map(member => member._id)
            })
        }
    }
    const removeHandler = (_id) => {
        setFinalSelectedMembers(members => members.filter(member => member._id != _id));
        setSelectedMembers(members => members.filter(member => member._id != _id));
    }
    const changeHandler = (e) => { setGroupInfo({ ...groupInfo, [e.target.name]: e.target.value }) }
    const picChangeHandler = (e)=>{
        const image = e.target.files[0];
        if (image){
            const url = URL.createObjectURL(image);
            setGroupPicURL(url);
            setGroupInfo({...groupInfo,groupPic: image});
        }
    }
    return (
        <div className={`${selected != "createGroup" && "hidden"} ${createGroupLoad && "load"} absolute top-0 left-0 h-full w-full lg:w-2/5 z-30 box-border p-2 theme-bg overflow-y-auto hide-scroll`}>
            <div className='flex justify-between items-center'>
                <Plus className='rotate-45 hover:backdrop-brightness-125 rounded-full box-content p-2 cursor-pointer' onClick={() => setSelected("")} />
                <div onClick={() => createGroupHandler()} className={`w-fit mr-2 flex items-center justify-center text-white font-semibold text-[13px]  ${(!groupInfo.groupName) && "opacity-50 !cursor-not-allowed"} bg-green-600 button-1 cursor-pointer px-2 py-[2px] rounded-lg h-fit`}> Create Group</div>
            </div>
            <section className='flex flex-col justify-center items-center'>
                <div className='w-fit mx-auto relative'>
                    <label htmlFor='groupPic'>
                    <Avatar className={"size-36"}>
                        <AvatarImage className={""} src={groupPicURL || "/volatile/user.jpg"} alt="User" />
                        <AvatarFallback>Error</AvatarFallback>
                    </Avatar>
                    </label>
                    <input className='hidden' id="groupPic" name="groupPic" type="file" accept="image/*" onChange={picChangeHandler}/>
                <Pencil className='absolute bottom-0 right-0 size-10 rounded-full p-2 bg-blue-500 overflow-visible' />
                </div>
                <form action="" onSubmit={createGroupHandler} ref={groupForm} className='w-full box-border px-3 flex flex-col gap-2'>
                    <Label htmlFor='groupName' className='flex flex-col gap-1'>
                        <div className='text-[11px] font-semibold text-start ml-1'>Group Name</div>
                        <Input required name="groupName" onChange={changeHandler} value={groupInfo?.groupName} />
                    </Label>
                    <Label htmlFor='groupDescription' className='flex flex-col gap-1'>
                        <div className='text-[11px] font-semibold text-start ml-1'>Group Description</div>
                        <Textarea required name="groupDescription" value={groupInfo?.groupDescription} className={"hide-scroll"} onChange={changeHandler} />
                    </Label>
                    <div className="my-1 box-border p-2">
                        <h1 className='text-start font-semibold text-[16px] mx-1 flex justify-between '>
                            <span>Members</span>
                            <Dialog open={userSelectionOpen} onOpenChange={setUsersSelectionOpen}>
                                <DialogTrigger>
                                    <Plus className='size-6 rounded-full p-1 hover:backdrop-brightness-125 cursor-pointer' />
                                </DialogTrigger>
                                <DialogContent className={"p-0 top-4 !max-w-[400px]"}>
                                    <UsersSelection selected={selectedMembers} setSelected={setSelectedMembers} setUsersSelectionOpen={setUsersSelectionOpen} action={addMemberHandler} />
                                </DialogContent>
                            </Dialog>
                        </h1>
                        <Separator />
                        <div className='flex flex-col box-border py-2 px-1'>
                            {finalSelectedMembers?.length > 0 ? finalSelectedMembers.map(member => {
                                return <UserCard key={member?._id} user={member} sideButton={"delete"} sideButtonAction={() => removeHandler(member._id)} />
                            }) : <div className='text-sm text-center text-gray-600 my-2'>Add members to your group</div>}
                        </div>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default CreateGroup
