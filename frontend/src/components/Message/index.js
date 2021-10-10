import React from 'react'
import {
  Tooltip, OverlayTrigger, Popover, Image
} from 'react-bootstrap'
import Avatar from '../Avatar'
import { convertDate, baseURL } from '../../utils'
import './style.css'

export default function Message({ message, logInUserId, hasAvatar, lastMessage }) {
  return (message.userId === logInUserId ?
    <div className={`own-message ${lastMessage ? 'last-message' : ''}`}>
      <div>
        {message.content && <p>
          {message.content}
        </p>}
        {message.photo && <div className='message-photo' style={{
          backgroundImage: `url(${baseURL}/api/messages/${message.id}/image)`
        }}>
        </div>}
      </div>
    </div> :
    <div className={`message  ${lastMessage ? 'last-message' : ''}`}
      style={{
        marginBottom: hasAvatar ? '5px' : 0
      }}>
      {hasAvatar && <span className='avatar-message'>
        <Avatar width="30px" height="30px" userId={message.userId} />
      </span>}
      <div className={message.photo ? 'message-with-photo' : ''}>
        {message.content && <p className={hasAvatar ? 'user-last-message' : ''}>
          {message.content}
        </p>}
        {message.photo && <div className={`message-photo ${hasAvatar ? 'photo-last-message' : ''}`} style={{
          backgroundImage: `url(${baseURL}/api/messages/${message.id}/image)`
        }}></div>}
      </div>
    </div>
  )
}
