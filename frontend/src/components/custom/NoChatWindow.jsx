import React from 'react'

const NoChatWindow = () => {
    return (
        <div className=' h-full theme-bg flex flex-col justify-center items-center gap-2 box-border border-l-2 border-white'>
            <div className=' animated-border size-30 text-6xl font-semibold bg-amber-400 flex justify-center items-center'>
                <div className='bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent font-bold animate-gradient-x title-font'>
                    V
                </div>
            </div>
            <h1 className='text-gray-400'>Chat with your friends </h1>
        </div>
    )
}

export default NoChatWindow
