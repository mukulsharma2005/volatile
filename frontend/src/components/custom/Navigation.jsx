import { Globe, MessagesSquare } from 'lucide-react';
import React, { useState } from 'react'

const Navigation = ({navigation,setNavigation}) => {
    
  return (
    <div className="w-full flex justify-around items-center bg-gray-800 py-[6px] px-2">
      <div className={`py-1 px-8 ${navigation=="chats" && "bg-blue-600"} font-semibold rounded-2xl`} onClick={()=>setNavigation("chats")} title='chats'>
        <MessagesSquare />
      </div>
      <div className={`py-1 px-8  ${navigation=="discover" && "bg-blue-600"} font-semibold rounded-2xl`} onClick={()=>setNavigation("discover")} title='discover'><Globe/></div>
    </div>
  )
}

export default Navigation
