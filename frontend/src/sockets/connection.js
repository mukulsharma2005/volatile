import { addMessage, updateMessage } from '@/redux/message.slice';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { SocketContext } from './socketContext';
import { markDelete, updateChat, updateChatPresence } from '@/redux/chats.slice';
import { v4 as uuidv4 } from 'uuid';
import { BASE_URL } from '@/utils/constants';

export function useMakeConnection() {
  const { socket, setSocket } = useContext(SocketContext);
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chats.chats);
  const user = useSelector(state=>state.auth.user);
  const makeConnection = () => {
    setSocket(io(BASE_URL, {
      withCredentials: true,
    }))
  }
  useEffect(() => {
    if (socket && Object.keys(socket).length > 0) {
      socket.on("chat_message", (message) => {    
        if (message.sentBy._id!=user._id){
        dispatch(addMessage(message));}
      })

      socket.on("status", (response) => console.log(response));
      socket.on("is_read", (message) => {
        dispatch(updateMessage(message));
      });
      socket.on("chats", (chat) => {
        dispatch(updateChat(chat));
      });
      socket.on("chat_deleted",(deletedChatId)=>{
        
        dispatch(markDelete(deletedChatId));
      });
      socket.on("user_online",(_id)=>{
        dispatch(updateChatPresence({ userToUpdatePresence: _id, online: true }))
        console.log(_id," is online");
      })
      socket.on("user_offline",(_id)=>{
        dispatch(updateChatPresence({ userToUpdatePresence: _id, online: false }))
        console.log(_id," is offline");
      })
      socket.on("connect", () => {
        if (socket && Object.keys(socket).length > 0) {
          const chat_ids = chats.length > 0 && chats?.map(chat => chat._id);
          chat_ids.length > 0 && chat_ids.forEach((chat_id) => {
            socket.emit("join_room", chat_id.toString());
          })
        }
      })
    }
  }, [socket]);

  useEffect(() => {
    if (socket && Object.keys(socket).length > 0) {
      const chat_ids = chats.length > 0 && chats?.map(chat => chat._id);
      chat_ids.length > 0 && chat_ids.forEach((chat_id) => {
        socket.emit("join_room", chat_id.toString());
      })
    }
  }, [socket, chats])

  return { makeConnection, };

}
export function useMessageConnection() {
  const { socket, setSocket } = useContext(SocketContext);
  const [messageResponse, setMessageResponse] = useState("")
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  function sendMessage(message) {
    message.tempId = uuidv4();
    message.createdAt = new Date(Date.now()).toString();
    dispatch(addMessage({...message,sending: true,sentBy: {_id: message.sentBy}}));
    
    socket && Object.keys(socket).length > 0 && socket.emit("chat_message", message,(response,sentMessage)=>{

      setMessageResponse(response);
      if (response?.success){
        dispatch(updateMessage(sentMessage));
      }else{
        dispatch(updateMessage({...message,isNotSent:true}));
        console.error(response);
      }
    });
  }
  function markRead(message) {
    if (!message._id || message.isNotSent){ return}
    if (message?.read?.includes(user._id)) {
      return;
    }
    socket && Object.keys(socket).length > 0 && socket.emit("is_read", message._id.toString());
  }
  return { sendMessage, markRead,messageResponse }
}

