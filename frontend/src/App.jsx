import { useState } from 'react'
import Login from './pages/login'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import OtpVerify from './pages/otpVerify'
import Chats from './pages/chats'
import { SocketContext } from './sockets/socketContext'
function App() {
  const [socket, setSocket] = useState("")
  return (
    <div className=' min-h-[100dvh] box-border '>
      <SocketContext.Provider value={{socket,setSocket}}>
        
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/signup" element={<Login type={"signup"} />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/signup/otpverify" element={<OtpVerify />} />
          </Routes>
        </HashRouter>
      </SocketContext.Provider>
    </div>
  )
}

export default App
