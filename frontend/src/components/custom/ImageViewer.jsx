import React, { useState } from 'react'
import { Plus } from 'lucide-react'

const ImageViewer = ({ children, url }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <>
      <div className='w-fit' onClick={() => setDialogOpen(true)}>{children}</div>
      {dialogOpen && <div className='w-[100vw] h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center'>
        <img src={url} className='h-[80%] opacity-100' />
        <Plus className='size-7 cursor-pointer rotate-45 fixed top-2 right-2 rounded-full p-2 box-content hover:bg-[rgba(93,93,93,0.33)] text-white' onClick={() => setDialogOpen(false)} />
      </div>}
      
    </>
  )
}

export default ImageViewer
