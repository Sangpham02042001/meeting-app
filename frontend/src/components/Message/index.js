import React from 'react'
import {
  Tooltip, OverlayTrigger, Popover
} from 'react-bootstrap'
import Avatar from '../Avatar'
import { convertDate } from '../../utils'
import './style.css'

export default function Message({ message, logInUserId, hasAvatar, lastMessage }) {
  return (message.userId === logInUserId ?
    <div className={`own-team-message ${lastMessage ? 'team-last-message' : ''}`}>
      <p>
        {message.content}
      </p>
    </div> :
    <div className={`team-message  ${lastMessage ? 'team-last-message' : ''}`}>
      {hasAvatar && <Avatar width="30px" height="30px" userId={message.userId} />}
      <p className={hasAvatar ? 'user-last-message' : ''}>
        {message.content}
      </p>
    </div>
  )
}
