import React from 'react'
import { Avatar, Tooltip } from '@mui/material'
import { baseURL } from '../../utils'
import './style.css'

export default function Message({ message, logInUserId, hasAvatar, lastMessage, userName }) {
  return (message.userId === logInUserId ?
    <div className={`own-message ${lastMessage ? 'last-message' : ''}`}
      style={{ marginBottom: '7px' }}>
      <div>
        {message.content && <p>
          {message.content}
        </p>}
        {message.photo && <div className='message-photo' style={{
          backgroundImage: `url(${baseURL}/api/messages/${message.id}/image)`
        }}></div>}
      </div>
    </div > :
    <div >
      <div className={`message  ${lastMessage ? 'last-message' : ''}`}
        style={{ marginBottom: '7px' }}>
        {hasAvatar && <span className='avatar-message'>
          <Avatar sx={{ width: '40px', height: '40px' }}
            src={`${baseURL}/api/user/avatar/${message.userId}`} />
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
      {userName && <p style={{
        paddingLeft: '40px',
        fontSize: '14px',
        color: 'gray',
        marginBottom: '10px',
        marginTop: 0
      }}>{userName}</p>}
    </div>
  )
}
