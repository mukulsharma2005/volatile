import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuth } from '@/api/auth';

const OtpVerify = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const { verifyOtp, setResponse, loading, response, emailToVerify } = useAuth();
    console.log(emailToVerify)
    useEffect(() => {
        if (!emailToVerify) {
            navigate("..");
        }
    }, [emailToVerify, navigate]);
    useEffect(() => {
        setResponse("")
    }, [otp])
    const formRef = useRef(null)
    const submitHandler = async (e) => {
        e.preventDefault()
        await verifyOtp(otp)
    }
    return (
        <div className={`${loading && " load "} flex  items-center flex-col h-[100dvh] gap-5 p-5`}>
            <h2 className=' bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent text-4xl font-bold py-1 animate-gradient-x'>
                OTP Verification
            </h2>
            <p className='font-semibold text-white'>Otp has been sent to {emailToVerify}</p>
            <form ref={formRef} action="" onSubmit={submitHandler} className='flex flex-col items-center gap-2 max-w-[600px] mx-auto text-white'>
                <InputOTP onComplete={() => formRef.current?.requestSubmit()} value={otp} onChange={setOtp} onSubmit={(e) => console.log(e)} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <p className={`text-center text-sm ${response.success ? "text-green-400" : "text-red-400"}`}>{response.message}</p>
            </form>
            <h2 className='text-white font-semibold text-sm'>Please enter your one-time-password(OTP).</h2>
        </div>
    )
}

export default OtpVerify;
