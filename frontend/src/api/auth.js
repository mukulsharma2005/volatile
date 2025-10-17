import { setLoading, setUser, setEmailToVerify } from "@/redux/auth.slice";
import { setChats } from "@/redux/chats.slice";
import { setMessages } from "@/redux/message.slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetMessages } from "./messages";
const BASE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export function useAuth() {
    const [response, setResponse] = useState("")
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [load,setLoad] = useState(false);
    const { loading, emailToVerify } = useSelector(state => state.auth);
    const {getMessages} = useGetMessages();
    const signIn = async (user) => {
        try {
            dispatch(setLoading(true));
            const res = await fetch(`${BASE_API_ENDPOINT}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(user)
            });
            const data = await res.json();
            setResponse(data)
            if (data.success) {
                dispatch(setUser(data.user));
                navigate("/chats");
                getMessages();
            }
        } catch (error) {
            console.log(error);
            setResponse({
                success: false,
                message: error.message
            })
        } finally {
            dispatch(setLoading(false));
        }
    }
    const signUp = async (user) => {
        try {
            if (user.password !== user.confirmPassword) {
                throw new Error("Passwords mismatched")
            }
            setLoading(true)
            const res = await fetch(`${BASE_API_ENDPOINT}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(user)
            });
            const data = await res.json();
            setResponse(data)
            if (data.success) {
                dispatch(setEmailToVerify(user.email))
                navigate("/signup/otpverify")
            }
        } catch (error) {
            console.log(error);
            setResponse({
                success: false,
                message: error.message
            })
        } finally {
            setLoading(false)
        }

    }
    const verifyOtp = async (otp) => {
        if (!emailToVerify) {
            return navigate("..")
        }
        try {
            setLoading(true)
            const res = await fetch(`${BASE_API_ENDPOINT}/users/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email: emailToVerify, otp })
            });
            const data = await res.json();
            setResponse(data)
            if (data.success) {
                dispatch(setUser(data.user));
                dispatch(setEmailToVerify(""));
                navigate("/chats")
            }
        } catch (error) {
            console.log(error);
            return setResponse({
                success: false,
                message: error.message
            })
        } finally {
            setLoading(false)
        }

    }
    const logout = async () => {
        setResponse("");
        try {
            setLoad(true);
            const res = await fetch(`${BASE_API_ENDPOINT}/users/logout`, {
                credentials: "include",
                method: "POST"
            });
            const data = await res.json();
            setResponse(data)
            if (data?.success){
                navigate("/signin");
                dispatch(setUser(""))
                dispatch(setChats([]));
                dispatch(setMessages([]));
            }
        } catch (error) {
            setResponse({
                success: false,
                message: error.message,
            })
        }finally{
            setLoad(false);
        }
    }
    return { signUp, signIn,logout, verifyOtp, loading, response, setResponse, emailToVerify ,load}
}
export function useCheckAuth() {
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate()
    useEffect(() => {
        if (!Object.keys(user).length > 0) {
            navigate("/signin");
        }
    }, [user])
}
