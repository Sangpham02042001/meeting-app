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
      <div>
        {getUserName(meetingReducer.meeting.hostId) &&
          <h5>Meeting created by {getUserName(meetingReducer.meeting.hostId)}</h5>}
        {teamReducer.team.name && <h5>Meeting created at team {teamReducer.team.name}</h5>}
      </div>
    </>
  )
}
