import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function MeetingInfo({ infoVisible }) {
  const userReducer = useSelector(state => state.userReducer)
  const meetingReducer = useSelector(state => state.meetingReducer)
  const teamReducer = useSelector(state => state.teamReducer)

  const getUserName = userId => {
    let user = teamReducer.team.members.find(user => user.id == userId)
    return (user || {}).userName || '';
  }

  return (
    <>
      <div className="chatbox-header">
        <div>
          Meeting Info
        </div>
        <div>
          <IconButton onClick={infoVisible}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <div style={{ padding: '20px', fontSize: '16px' }}>
        {getUserName(meetingReducer.meeting.hostId) &&
          <div>Meeting created by <strong style={{color: '#000'}}>{getUserName(meetingReducer.meeting.hostId)}</strong></div>}
        {teamReducer.team.name && <div>Meeting created at team <strong style={{color: '#000'}}>{teamReducer.team.name}</strong></div>}
      </div>
    </>
  )
}
