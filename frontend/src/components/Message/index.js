import React, { useState } from 'react'
import { Avatar, Tooltip, Button, Box, Typography, Modal, Dialog, DialogContent } from '@mui/material';
import { baseURL } from '../../utils'
import './style.css'

export default function Message({ message, logInUserId, hasAvatar, lastMessage, userName }) {
  const [isPreviewImg, setIsPreviewImg] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState(null);
  const handlePreviewImg = (e, messageId) => {
    e.preventDefault();
    setIsPreviewImg(true);
    setImgPreviewUrl(`${baseURL}/api/messages/${message.id}/image`)
    console.log('preview', messageId);
  }
  const handleClose = () => {
    setIsPreviewImg(false)
  }
  return (
    <>
      {
        message.userId === logInUserId ?
          <div className={`own-message ${lastMessage ? 'last-message' : ''}`}
            style={{ marginBottom: '0px' }}>
            <div>
              {message.content && <p>
                {message.content}
              </p>}
              {message.photo && <div onClick={e => handlePreviewImg(e, message.id)} className='message-photo'>
                <img width="100%" height="100%" src={`${baseURL}/api/messages/${message.id}/image`} /></div>}
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
                {message.photo && <div onClick={handlePreviewImg(e, message.id)} className={`message-photo ${hasAvatar ? 'photo-last-message' : ''}`}
                ><img width="100%" height="100%" src={`${baseURL}/api/messages/${message.id}/image`} /></div>}
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
      }

      <Dialog
        open={isPreviewImg}
        onClose={handleClose}
        fullWidth={false}
        maxWidth='xl'
      >
        <DialogContent>
          <img width="100%" height="100%" src={imgPreviewUrl} />
        </DialogContent>
      </Dialog >
    </>
  )
}
