import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  const user = useSelector(state=>state.auth.user);
  const isUserLoggedIn = Object.keys(user).length>0 ? true : false;
  useEffect(()=>{
    if (isUserLoggedIn){
      navigate("/chats");
    }
  },[])
  return (
    <div className='text-white'>
      <div>This is home</div>
      <div className="buttons flex flex-col">
        {!isUserLoggedIn && <button onClick={() => navigate("/signin")}>Go to sign in</button>}
        {!isUserLoggedIn && <button onClick={() => navigate("/signup")}>Go to sign up</button>}
      </div>
    </div>
  )
}

export default Home
