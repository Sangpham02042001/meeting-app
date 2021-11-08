import React from 'react'
import { baseURL, getTime } from '../../utils';
import { Avatar, AvatarGroup, Tooltip, IconButton } from '@mui/material'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';

export default function MeetingItem({ meeting }) {
  const hostName = (meeting.members.find(m => m.id === meeting.hostId) || {}).userName || ''
  return (
    <div style={{
      width: '96%',
      margin: '15px auto',
    }}>
      <div className='time-text'>
        <span>
          {getTime(meeting.createdAt)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton style={{
          marginRight: '10px',
          backgroundColor: '#fff',
          padding: '15px'
        }}>
          <VideoCameraFrontIcon />
        </IconButton>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <div style={{ width: '100%' }}>
              <Typography>Meeting created by <strong>{hostName}</strong></Typography>
              <hr />
              <div style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center'
              }}>
                Joined by <AvatarGroup max={5} style={{ marginLeft: '20px' }}>
                  {meeting.members.map(member => (
                    <Tooltip key={member.id} title={member.userName} placement='top'>
                      <Avatar sx={{ width: '40px', height: '40px' }}
                        src={`${baseURL}/api/user/avatar/${member.id}`} />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {JSON.stringify(meeting)}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  )
}
