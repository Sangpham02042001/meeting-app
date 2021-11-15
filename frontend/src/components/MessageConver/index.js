import React, { useState } from 'react'
import { Avatar, Tooltip, Dialog, DialogContent, IconButton, imageListClasses } from '@mui/material';
import { baseURL, getTime } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';

export default function Message({ message, logInUserId, hasAvatar, lastMessage, userName }) {
  const [isPreviewImg, setIsPreviewImg] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState(null);

  const handlePreviewImg = (e, messageId, photoId) => {
    e.preventDefault();
    setIsPreviewImg(true);
    setImgPreviewUrl(`${baseURL}/api/messages/${messageId}/${photoId}`)
  }

  const handleClose = () => {
    setIsPreviewImg(false)
  }

  const getImageSize = (numOfPhotos) => {
    let itemWidth, height, width
    if (numOfPhotos == 1) {
      itemWidth = '350px';
      width = '350px';
      height = '400px'
    } else if (numOfPhotos <= 3) {
      width = '410px';
      itemWidth = '200px'
      height = '200px'
    } else {
      width = '470px';
      itemWidth = '150px'
      height = '150px'
    }
    return { itemWidth, height, width }
  }

  return (
    <>
      {
        message.userId === logInUserId ?
          <div className={`own-message ${lastMessage ? 'last-message' : ''}`}
            style={{ marginBottom: '0px' }}>
            <div>
              {message.content &&
                <Tooltip title={getTime(message.createdAt)} placement="left">
                  <p>
                    {message.content}
                  </p>
                </Tooltip>}
              {message.photos && message.photos.length > 0 &&
                <Tooltip title={getTime(message.createdAt)} placement="left">
                  <div className='message-photo-list'>
                    {message.photos.map((photo, idx) => {
                      return (message.photos.length > 1 ?
                        <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                          src={`${baseURL}/api/messages/${message.id}/${photo.id}`}
                          className={`${hasAvatar ? 'photo-last-message' : ''}`}
                          style={{
                            width: getImageSize(message.photos.length).itemWidth,
                            height: getImageSize(message.photos.length).height,
                          }} />
                        :
                        <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                          src={`${baseURL}/api/messages/${message.id}/${photo.id}`}
                          className={`${hasAvatar ? 'photo-last-message' : ''}`}
                          style={{
                            maxWidth: getImageSize(message.photos.length).itemWidth,
                            maxHeight: getImageSize(message.photos.length).height,
                          }} />
                      )
                    })}
                  </div>
                </Tooltip>}
              {message.files && message.files.length > 0 &&
                <div className="message-file-list">
                  {message.files.map((file, idx) => {
                    return (
                      <a key={idx}
                        href={`${baseURL}/api/messages/files/${message.id}/${file.id}`} target="_blank">
                        {file.name}
                      </a>
                    )
                  })}
                </div>
              }
            </div>
          </div >
          :
          <div >
            <div className={`message  ${lastMessage ? 'last-message' : ''}`}
              style={{ marginBottom: hasAvatar ? '10px' : 0 }}>
              {hasAvatar && (userName ?
                <Tooltip title={userName}>
                  <Avatar sx={{ width: '40px', height: '40px' }}
                    src={`${baseURL}/api/user/avatar/${message.userId}`} />
                </Tooltip> : <Avatar sx={{ width: '40px', height: '40px' }}
                  src={`${baseURL}/api/user/avatar/${message.userId}`} />)}
              <div className={message.photos && message.photos.length > 0 ? 'message-with-photo' : ''}>
                {message.content &&
                  <Tooltip title={getTime(message.createdAt)} placement='right'>
                    <p className={hasAvatar ? 'user-last-message' : ''}>
                      {message.content}
                    </p>
                  </Tooltip>}
                {message.photos && message.photos.length > 0 &&
                  <Tooltip title={getTime(message.createdAt)} placement="right">
                    <div className='message-photo-list'
                      style={{ marginLeft: hasAvatar ? '5px' : '45px' }}>
                      {message.photos.map((photo, idx) => {
                        return (message.photos.length > 1 ?
                          <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                            src={`${baseURL}/api/messages/${message.id}/${photo.id}`}
                            className={`${hasAvatar ? 'photo-last-message' : ''}`}
                            style={{
                              width: getImageSize(message.photos.length).itemWidth,
                              height: getImageSize(message.photos.length).height,
                            }} />
                          :
                          <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                            src={`${baseURL}/api/messages/${message.id}/${photo.id}`}
                            className={`${hasAvatar ? 'photo-last-message' : ''}`}
                            style={{
                              maxWidth: getImageSize(message.photos.length).itemWidth,
                              maxHeight: getImageSize(message.photos.length).height,
                            }} />
                        )
                      })}
                    </div>
                  </Tooltip>}
                {message.files && message.files.length > 0 &&
                  <div
                    className="message-file-list"
                    style={{ marginLeft: hasAvatar ? '5px' : '45px' }}>
                    {message.files.map((file, idx) => {
                      return (
                        <a key={idx}
                          style={{background: '#cdcfd5'}}
                          href={`${baseURL}/api/messages/files/${message.id}/${file.id}`} target="_blank">
                          {file.name}
                        </a>
                      )
                    })}
                  </div>
                }

              </div>
            </div>
          </div>
      }

      <Dialog
        open={isPreviewImg}
        onClose={handleClose}
        maxWidth='xl'
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)' }}
      >
        <DialogContent style={{ padding: 0 }}>
          <Tooltip title="Close" placement="bottom">
            <IconButton
              sx={{
                position: 'fixed',
                right: '20px',
                top: '20px',
                padding: '5px',
                background: '#fff !important'
              }}
              onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <img width="100%" height="100%" src={imgPreviewUrl} />
        </DialogContent>
      </Dialog >
    </>
  )
}
