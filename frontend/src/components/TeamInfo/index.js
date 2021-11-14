import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { baseURL } from '../../utils'
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PreviewImage from '../PreviewImage';
import './team-info.css'

export default function TeamInfo() {
  const teamReducer = useSelector(state => state.teamReducer)
  const images = [...teamReducer.team.meetmess]
    .filter(item => item.isMessage)
    .map(item => item.photos)
    .reduce((value, currentArr, idx) => {
      return [...value, ...currentArr]
    }, [])

  const [isPreview, setIsPreview] = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const imgPath = `${baseURL}/api/messages`

  const handlePreviewImage = (event, messageId, photoId) => {
    event.preventDefault();
    setIsPreview(true);
    setImgPreview(imgPath.concat(`/${messageId}/${photoId}`));
  }

  return (
    <div style={{ padding: '10px 5px', width: '100%', overflow: 'auto' }}>
      <strong style={{ padding: '0 5px' }}>About</strong>
      <p style={{ paddingLeft: '10px', margin: 0 }}>{teamReducer.team.name}</p>

      <Accordion className='team-info-expand-container'>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <strong>Members ({teamReducer.team.members.length})</strong>
        </AccordionSummary>
        <AccordionDetails>
          {teamReducer.team.members.slice(0, 5).map(member => (
            <span key={`member ${member.id}`}
              style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', paddingLeft: '10px' }}>
              <div className='team-info-user-avatar'
                style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${member.id}")` }}>
              </div>
              <p style={{ marginBottom: 0 }}>{member.userName}</p>
            </span>
          ))}
          {teamReducer.team.members.length > 5 && <Link to="#">
            See all members
          </Link>}
        </AccordionDetails>
      </Accordion>

      <Accordion className='team-info-expand-container'>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <strong>Shared media</strong>
        </AccordionSummary>
        <AccordionDetails>
          <div className='shared-media-list'>
            {images.map((img, idx) => {
              return (
                <div key={idx}
                  style={{
                    cursor: 'pointer',
                    backgroundImage: `url(${imgPath}/${img.messageId}/${img.id})`
                  }}
                  onClick={event => handlePreviewImage(event, img.messageId, img.id)}
                />
              )
            })}
          </div>
        </AccordionDetails>
      </Accordion>

      <PreviewImage isPreview={isPreview}
        onClose={(e) => { setIsPreview(false) }}
        image={imgPreview}
      />
    </div>
  )
}
