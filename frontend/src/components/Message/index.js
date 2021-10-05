import React from 'react'
import {
  Tooltip, OverlayTrigger, Popover
} from 'react-bootstrap'
import Avatar from '../Avatar'
import { convertDate } from '../../utils'
import './style.css'

export default function Message({ message, logInUserId, hasAvatar }) {
  return (message.userId === logInUserId ?
    <div className='own-team-message'>
      <p>
        {message.content}
      </p>
    </div> :
    <div className='team-message'>
      {hasAvatar && <Avatar width="30px" height="30px" userId={message.userId} />}
      <p className={hasAvatar ? 'team-last-message' : ''}>
        {message.content}
      </p>
    </div>
  )
}
