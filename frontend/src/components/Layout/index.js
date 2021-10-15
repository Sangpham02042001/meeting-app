import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { getNotifs } from '../../store/reducers/notification.reducer'
import Navbar from '../Navbar';
import { v1 as uuid } from 'uuid';
import { socketClient } from '../../utils';
import { setMessage, setConversation } from '../../store/reducers/conversation.reducer';
import { sendMessage } from '../../store/reducers/team.reducer';
import './layout.css'

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.userReducer.user);
  useEffect(() => {
    socketClient.on('conversation-receiveMessage', ({ messageId, content, senderId, conversationId, photo }) => {
      dispatch(setMessage({ messageId, content, senderId, userId: user.id, conversationId, photo }));
    })

    socketClient.on('conversation-sentMessage', ({messageId, content, senderId, conversationId, photo}) => {
      dispatch(setMessage({ messageId, content, senderId, userId: user.id, conversationId, photo }));
    })

    socketClient.on('set-conversation', ({ nConversationId, oConversationId }) => {
      dispatch(setConversation({ nConversationId, oConversationId }))
    })

    socketClient.on('sent-message-team', ({ messageId, teamId, senderId, content, photo }) => {
      dispatch(sendMessage({
        messageId, content, senderId, teamId, photo
      }))
    })

    socketClient.on('receive-message-team', ({ messageId, teamId, senderId, content, photo }) => {
      //todo
      dispatch(sendMessage({
        messageId, content, senderId, teamId, photo
      }))
      console.log('team receive message', content);
    })


    socketClient.on("disconnect", () => {
      socketClient.connect();
    });

    return () => {
      socketClient.disconnect();
    }
  }, [])
  return (
    <>
      <Navbar />
      <div className="layout">
        <div className="list-selection">
          <div className="btn-list-selection">
            <NavLink exact to='/' activeClassName="btn-active">
              <button className="btn-default" ><i className="fas fa-home"></i></button>
            </NavLink>
          </div>
          {/* <div className="btn-list-selection">
            <NavLink to="/activities" activeClassName="btn-active">
              <button className="btn-default" >Activity</button>
            </NavLink>
          </div> */}
          <div className="btn-list-selection">
            <NavLink to='/conversations' activeClassName="btn-active">
              <button className="btn-default" ><i className="fas fa-comment-dots"></i></button>

            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/teams' activeClassName="btn-active">
              <button className="btn-default"><i className="fas fa-users"></i></button>
            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/setting' activeClassName="btn-active">
              <button className="btn-default" ><i className="fas fa-cog"></i></button>
            </NavLink>
          </div>
        </div>
        <div className="content-layout">
          {children}
        </div>
      </div>
    </>
  )
}
