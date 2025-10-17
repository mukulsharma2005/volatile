import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
const BASE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export function useGetGroupStatus(chat_id) {
    const user = useSelector(state => state.auth.user);
    const chats = useSelector(state => state.chats.chats);
    let admin = false;
    let creator = false;

    const chat = chats?.find(chat => chat?._id == chat_id);

    const admins = chat?.group?.admin;
    const createdBy = chat?.createdBy;
    admin = admins?.includes(user?._id);
    creator = createdBy?._id == user?._id;

    return { admin, creator };
}
export function useGroupControls(chat_id) {
    const chats = useSelector(state => state.chats.chats);
    const chat = chats?.find(chat => chat._id == chat_id);
    const [load, setLoad] = useState(false);
    const [response, setResponse] = useState("");
    const makeMemberAdmin = async (aspirant_id) => {
        try {
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/members/makeAdmin`, {
                credentials: "include",
                method: "PUT",
                body: JSON.stringify({
                    aspirant_id, group_id: chat?.group?._id,
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
            setResponse({
                success: data?.success,
                message: data?.message,
            })

        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setResponse({
                success: false,
                message: error?.message,
            })
        } finally {
            setLoad(false);
        }
    }
    const demoteMemberAdmin = async (aspirant_id) => {
        try {
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/members/removeadmin`, {
                credentials: "include",
                method: "PUT",
                body: JSON.stringify({
                    aspirant_id, group_id: chat?.group?._id,
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
            setResponse({
                success: data?.success,
                message: data?.message,
            })

        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setResponse({
                success: false,
                message: error?.message,
            })
        } finally {
            setLoad(false);
        }
    }
    const removeMember = async (aspirant_id) => {
        try {
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/members`, {
                credentials: "include",
                method: "DELETE",
                body: JSON.stringify({
                    aspirant_id, group_id: chat?.group?._id,
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
            setResponse({
                success: data?.success,
                message: data?.message,
            })

        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setResponse({
                success: false,
                message: error?.message,
            })
        } finally {
            setLoad(false);
        }
    }
    const addMembers = async (members, group_id) => {
        let addedMembers = [];
        for (const member of members) {
            try {
                const res = await fetch(`${BASE_API_ENDPOINT}/groups/members`, {
                    credentials: "include",
                    method: "POST",
                    body: JSON.stringify({
                        aspirant_id: member, group_id,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const data = await res.json();
                console.log(data)
                if (data?.success) {
                    addedMembers.push(member);
                    toast.success(data.message)
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
                setResponse({
                    success: false,
                    message: error?.message,
                })
            }
        }
        // setResponse(addedMembers.length!=members.length ? "Unable to add all the members":"All the members added");
        const unaddedMembers = members.filter(member => !addedMembers.includes(member));
        return { addedMembers, unaddedMembers };
    }
    return { makeMemberAdmin, demoteMemberAdmin, removeMember, addMembers, response, load };
}
export function useCreateGroup() {
    const [load, setLoad] = useState(false);
    const [response, setResponse] = useState({})
    const createGroup = async (groupInfo) => {
        const { groupName, groupDescription, groupPic, members } = groupInfo;
        try {
            const formData = new FormData();
            formData.append("groupName", groupName);
            formData.append("description", groupDescription);
            formData.append("groupPic", groupPic);
            formData.append("members", JSON.stringify(members));
            setLoad(true)
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/`, {
                credentials: "include",
                method: "POST",
                body: formData,
            })
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message);
            } setResponse(data);
        } catch (error) {
            console.log(error);
            setResponse({
                success: false,
                message: error.message,
            });
            toast(error.message);
        } finally {
            setLoad(false);
        }
    }
    return { createGroup, load, response }
}
export function useDeleteGroup() {
    const [load, setLoad] = useState(false);
    const [response, setResponse] = useState("");
    const user = useSelector(state => state.auth.user);
    const deleteGroup = async (group_id, creator_id) => {
        const everyone = user._id == creator_id;
        try {
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/`, {
                credentials: "include",
                method: "DELETE",
                body: JSON.stringify({ group_id, everyone }),
                headers: {
                    'Content-Type': "application/json"
                }
            });
            const data = await res.json();
            setResponse(data);
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.log(error);
            setResponse({
                success: false,
                message: error.message,
            })
            toast(error.message);
        } finally {
            setLoad(false)
        }
    }
    return { deleteGroup, load, response };
}
export function useUpdateGroupInfo() {
    const [load, setLoad] = useState(false);
    const updateGroupName = async (group_id, newName) => {
        try {
            const formData = new FormData();
            formData.append("group_id", group_id);
            formData.append("groupName", newName);
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/`, {
                credentials: "include",
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
            return ({
                success: data?.success,
                message: data?.message,
            })
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            return ({
                success: false,
                message: error.message,
            })
        } finally {
            setLoad(false);
        }
    }
    const updateGroupDescription = async (group_id, newDescription) => {
        try {
            const formData = new FormData();
            formData.append("group_id", group_id);
            formData.append("groupDescription", newDescription);
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/`, {
                credentials: "include",
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast(data.message);
            }
            return ({
                success: data?.success,
                message: data?.message,
            })
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            return ({
                success: false,
                message: error.message,
            })
        } finally {
            setLoad(false);
        }
    }
    const updateGroupPic = async (group_id, image) => {
        try {
            const formData = new FormData();
            formData.append("group_id", group_id);
            formData.append("groupPic", image);
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/groups/`, {
                credentials: "include",
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            if (data?.success) {
                toast.success(data.message)
            } else {
                toast(data.message);
            }
            return ({
                success: data?.success,
                message: data?.message,
            })
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            return ({
                success: false,
                message: error.message,
            })
        } finally {
            setLoad(false);
        }
    }
    return { updateGroupName, updateGroupDescription, updateGroupPic, load, };
}