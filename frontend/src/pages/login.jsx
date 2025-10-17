import { useAuth } from '@/api/auth'
import Field from '@/components/custom/field'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Login = ({ type }) => {
    const isSignUp = type == "signup";
    const { signIn, signUp, loading, response, setResponse } = useAuth()
    const navigate = useNavigate();
    const userExists = useSelector(state => state.auth.user);
    useEffect(() => {
        if (userExists && Object.keys(userExists).length > 0) {
            navigate("..")
        }
    }, [])

    const [user, setuser] = useState({
        username: "", password: "", ...(isSignUp && {
            email: "", confirmPassword: ""
        })
    })
    useEffect(() => {
        setResponse("")
    }, [isSignUp, user])
    const submitHandler = async (e) => {
        e.preventDefault()
        if (!isSignUp) {
            await signIn(user);
        } else {
            await signUp(user);
        }
    }
    const loginFields = [
        { name: "username", placeholder: "ex: sumit123" },
        { name: "password", placeholder: "Enter your password", type: "password" },
        ...(isSignUp ? [
            { name: "email", placeholder: "ex: sumit@gmail.com", type: "email" },
            { name: "confirmPassword", placeholder: "Confirm your password", label: "Confirm Password", type: "password" }
        ] : [])
    ]
    return (
        <div className={`${loading && " load "} flex justify-center items-center flex-col h-[100dvh] gap-5 p-5`}>
            <h2 className=' bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent text-4xl font-bold py-1 animate-gradient-x'>
                {isSignUp ? "Sign Up" : "Login"} to Volatile
            </h2>
            <form action="" onSubmit={submitHandler} className='flex flex-col gap-2 max-w-[600px] mx-auto'>
                {loginFields.map((field) => {
                    return <Field key={"Login" + field.name} name={field.name} placeholder={field.placeholder} type={field.type} user={user} setuser={setuser} label={field.label} required={field.required} />
                })}
                <p className={`text-center text-sm ${response.success ? "text-green-400" : "text-red-400"}`}>{response.message}</p>
                <Button className={"bg-purple-600 hover:bg-purple-700 hover:text-white"}>{isSignUp ? "Sign Up" : "Login"}</Button>
                {isSignUp ?
                    <p className='text-white text-sm text-center'>
                        Have an account?
                        <span className='underline underline-offset-1 hover:text-purple-600 mx-1' onClick={() => navigate("/signin")}> Login</span>
                    </p> : <p className='text-white text-sm text-center'>
                        Don't have an account
                        <span className='underline underline-offset-1 hover:text-purple-600 mx-1' onClick={() => navigate("/signup")}>Sign Up</span>
                    </p>}
            </form>
        </div>
    )
}

export default Login
