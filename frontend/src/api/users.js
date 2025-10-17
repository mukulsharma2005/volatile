import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLiveSortedChats } from "./chats";
import { setUser } from "@/redux/auth.slice";
import { toast } from "sonner";
const BASE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export function useGetUsers() {
    const [response, setResponse] = useState("");
    const [load, setLoad] = useState(false);
    const user = useSelector(state => state.auth.user);
    const { sortedChats } = useLiveSortedChats();
    const [users, setUsers] = useState([]);
    const chats = useSelector(state=>state.chats.chats);
    useEffect(() => {
        (async function () {
            try {
                setLoad(true)
                const res = await fetch(`${BASE_API_ENDPOINT}/users/all`, {
                    credentials: "include",
                })
                const data = await res.json();
                setResponse({ message: data?.message, success: data?.success });
                if (data?.success) {
                    const users = data?.users;

                    const savedUsersIds = sortedChats.filter(chat => chat?.type == "single").map(singleChatType => singleChatType?.targetUserId?.toString());
                    const unsavedUsers = users.filter(unsavedUser => (!savedUsersIds.includes(unsavedUser?._id) && unsavedUser?._id != user?._id));
                    setUsers(unsavedUsers);
                }
            } catch (error) {
                console.log(error);
                setResponse({
                    success: false,
                    message: error?.message,
                })
            }finally{
                setLoad(false);
            }

        })();
    }, [chats.length])

    return { response, users, load };
}
export function useUpdateUser(){
    const [response, setResponse] = useState("");
    const [load, setLoad] = useState(false);
    const user = useSelector(state=>state.auth.user);
    const dispatch = useDispatch();
    const updateAbout = async (about)=>{
        try {
            const formData = new FormData();
            formData.append("about",about);
            setLoad(true)
            const res = await fetch(`${BASE_API_ENDPOINT}/users`,{
                credentials: "include",
                method: "PUT",
                body: formData,
            });
            const data = await res.json();
            setResponse({
                success: data?.success,
                message: data?.message,
            })
            if (data?.success){                
                dispatch(setUser({...user,about:data?.user?.about}));
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setResponse({
                success: false,
                message: error?.message,
            });
            return;
        }finally{
            setLoad(false);
        }
    }
    const updateProfilePic = async (pic)=>{
        try {
            const formData = new FormData();
            formData.append("profilePic",pic);
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/users`,{
                credentials: "include",
                method: "PUT",
                body:formData,
            });
            const data = await res.json();
            if (data?.success){                
                dispatch(setUser({...user,profilePic: data?.user?.profilePic}));
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
            return({
                success: data?.success,
                message: data?.message,
            })
            
        } catch (error) {
            console.log(error);
            toast.error(data.message);
            return({
                success: false,
                message: error?.message,
            });
        }finally{
            setLoad(false);
        }
    }
    return {updateAbout,updateProfilePic,response,setResponse,load};
}