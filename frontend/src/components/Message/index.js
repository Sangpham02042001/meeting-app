import React, { useState } from 'react'
import {
  Avatar, Tooltip, Dialog, DialogContent, IconButton,
  Menu, MenuItem
} from '@mui/material';
import { baseURL, getTime } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './style.css'


export default function Message({
  message, logInUserId, hasAvatar, lastMessage,
  userName, conversationId, participantId }) {
  const [isPreviewImg, setIsPreviewImg] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState(null);
  const [selectedPhotoId, setPhotoId] = useState(null)
  const [isContentOptionShow, setContentOptionShow] = useState('none')

  const handlePreviewImg = (e, messageId, photoId) => {
    e.preventDefault();
    setIsPreviewImg(true);
    setImgPreviewUrl(`${baseURL}/api/messages/${messageId}/${photoId}`)
    setPhotoId(photoId)
  }

  const handleClose = () => {
    setIsPreviewImg(false)
    setImgPreviewUrl(null)
    setPhotoId(null)
  }

  const getImageSize = (numOfPhotos) => {
    let itemWidth, height, width
    if (numOfPhotos == 1) {
      if (message.meetingId) {
        itemWidth = '200px',
          width = '200px',
          height = '200px'
      } else {
        itemWidth = '350px';
        width = '350px';
        height = '400px'
      }
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

  const handleFileDownload = (event, messageId, fileId) => {
    event.preventDefault();
    window.open(`${baseURL}/api/messages/files/${messageId}/${fileId}`)
  }

  const handleImageDownload = (event) => {
    event.preventDefault()
    window.open(`${baseURL}/api/messages/photos/${message.id}/${selectedPhotoId}`)
  }

  return (
    <>
      {
        message.userId === logInUserId ?
          <div className={`own-message ${lastMessage ? 'last-message' : ''}`}
            style={{ marginBottom: '0px' }}>
            <Tooltip title={getTime(message.createdAt)} placement="left">
              <div>
                {message.content &&
                  <p>
                    {message.content}
                  </p>
                }
                {message.photos && message.photos.length > 0 &&

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
                }
                {message.files && message.files.length > 0 &&

                  <div className="message-file-list">
                    {message.files.map((file) => {
                      return (
                        <div className="message-file" key={file.id} >
                          <DescriptionIcon sx={{ color: '#000', margin: '5px' }} />
                          <span
                            onClick={e => handleFileDownload(e, message.id, file.id)}
                          >
                            {file.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                }
              </div>
            </Tooltip>
            {/* <div>
              <IconButton onClick={handleOpenMenu}>
                <MoreHorizIcon />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={handleRemoveMessage}>Remove</MenuItem>
              </Menu>
            </div> */}
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
              <Tooltip title={getTime(message.createdAt)} placement='right'>
                <div className={message.photos && message.photos.length > 0 ? 'message-with-photo' : ''}>
                  {message.content &&
                    <p className={hasAvatar ? 'user-last-message' : ''}>
                      {message.content}
                    </p>
                  }
                  {message.photos && message.photos.length > 0 &&
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
                  }
                  {message.files && message.files.length > 0 &&
                    <div
                      className="message-file-list"
                      style={{ marginLeft: hasAvatar ? '5px' : '45px' }}>
                      {message.files.map((file) => {
                        return (
                          <div className="message-file" key={file.id}>
                            <DescriptionIcon sx={{ color: '#000', margin: '5px' }} />
                            <span
                              onClick={e => handleFileDownload(e, message.id, file.id)}
                            >
                              {file.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  }
                </div>
              </Tooltip>
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
          <Tooltip title="Download" placement="bottom">
            <IconButton
              sx={{
                position: 'fixed',
                right: '70px',
                top: '20px',
                padding: '5px',
                background: '#fff !important'
              }}
              onClick={handleImageDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <img width="100%" height="100%" src={imgPreviewUrl} />
        </DialogContent>
      </Dialog >
    </>
  )
}
