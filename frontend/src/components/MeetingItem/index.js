import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { baseURL, getTime, axiosAuth } from '../../utils';
import { Avatar, AvatarGroup, Tooltip, IconButton } from '@mui/material'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Message from '../Message'
import './meeting-item.css'

export default function MeetingItem({ meeting }) {
  const user = useSelector(state => state.userReducer.user)
  const teamMembers = useSelector(state => state.teamReducer.team.members)
  const hostName = ((meeting.members || teamMembers || []).find(m => m.id === meeting.hostId) || {}).userName || ''
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!meeting.active) {
      (async () => {
        try {
          let response = await axiosAuth.get(`${baseURL}/api/meetings/${meeting.id}/messages`)
          setMessages(response.data.messages)
        } catch (error) {
          console.log(error)
          setError('Some thing wrong when get messages')
        }
      })()
    }
  }, [])

  const getUserName = userId => {
    let user = meeting.members.find(user => user.id == userId)
    return (user || {}).userName || '';
  }

  return (!meeting.active && <div style={{
    width: '96%',
    margin: '15px auto',
    fontSize: '14px'
  }} className="meeting-item">
    <div className='time-text'>
      <span>
        {getTime(meeting.createdAt)}
      </span>
    </div>
    <Accordion style={{ backgroundColor: 'var(--primary-bg)' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header">
        <div style={{ width: '100%' }}>
          <Typography style={{ fontSize: '14px' }}>Meeting created by <strong>{hostName}</strong></Typography>
          <hr style={{ color: 'var(--text-color)' }} />
          {meeting.members && <div style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span>Joined by</span> <AvatarGroup max={5} style={{ marginLeft: '20px' }}>
              {meeting.members.map(member => (
                <Tooltip key={member.id} title={member.userName} placement='top'>
                  <Avatar sx={{ width: '40px', height: '40px' }}
                    src={`${baseURL}/api/user/avatar/${member.id}`} />
                </Tooltip>
              ))}
            </AvatarGroup>
          </div>}
        </div>
      </AccordionSummary>
      <AccordionDetails style={{
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <Typography style={{ fontSize: '14px' }}>
          {error ? { error } : messages.length ?
            <>
              {messages.slice(0, messages.length - 1).map((message, idx) => (
                <div key={idx}>
                  <Message message={message}
                    logInUserId={null}
                    userName={message.userId != messages[idx + 1].userId ? getUserName(message.userId) : ''}
                    hasAvatar={message.userId != messages[idx + 1].userId} />
                  {messages[idx + 1].userId != message.userId
                    && <p style={{
                      margin: 0,
                      paddingLeft: '40px',
                      color: 'gray'
                    }}>{getUserName(messages[idx + 1].userId)}</p>}
                </div>
              ))}
              <Message message={messages[messages.length - 1]}
                logInUserId={null}
                userName={getUserName(messages[messages.length - 1].userId)}
                hasAvatar={true} lastMessage={true} />
            </> :
            <p>No messages in this meeting</p>
          }
        </Typography>
      </AccordionDetails>
    </Accordion>
  </div>
  )
}
