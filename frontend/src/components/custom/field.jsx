import React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

const Field = ({name,user,setuser,placeholder,label,type,required}) => {
    const changeHandler = (e) => {
        setuser({ ...user, [e.target.name]: e.target.value })
    }
    return (
        <div className=' flex flex-col  w-full '>
            <Label className={"text-white mx-1 capitalize text-sm"}>{label || name}</Label>
            <Input minLength={type=="password" && 8}  className={"text-white"} name={name} value={user[name]}  placeholder={placeholder} onChange={changeHandler} type={type || "text"} required={(required===false ? false:true) }/>
        </div>
    )
}

export default Field
