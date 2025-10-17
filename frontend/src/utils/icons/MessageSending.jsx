import { Clock, Mail } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

const MessageSending = ({bgColor}) => {
  
  return (
    <div className='w-fit relative'><Mail strokeOpacity={100} className='size-4 ' fill='#ff99009c' /><Clock className={`size-[9px] absolute top-2 left-2 z-20 ${bgColor}`} /></div>
  )
}

export default MessageSending
