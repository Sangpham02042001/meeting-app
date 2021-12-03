import React, { useState } from 'react'
import {
  Avatar, Tooltip, Dialog, DialogContent, IconButton,
  Menu, MenuItem
} from '@mui/material';
import { baseURL, getTime, socketClient, getAmTime, getFileSize } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import emojiRegex from 'emoji-regex';
import joypixels from 'emojione';
import parse from 'html-react-parser';
import './style.css'




const Message = React.memo(({
  message, logInUserId, hasAvatar, lastMessage,
  userName, conversationId, participantId, messageDif,
  changeMessage
}) => {
  const [isPreviewImg, setIsPreviewImg] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState(null);
  const [selectedPhotoId, setPhotoId] = useState(null)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [regex] = useState(emojiRegex());

  const urlify = (text) => {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
      return `<a style="color: #fff;" href="${url}" target="_blank" > ${url} </a>`;
    })
  }

  const handleRemoveMessage = () => {
    setAnchorEl(null);
    if (conversationId && participantId) {
      socketClient.emit('conversation-remove-message', { messageId: message.id, receiverId: participantId })
    } else {
      socketClient.emit('team-remove-message', { teamId: message.teamId, messageId: message.id, senderId: logInUserId })
    }
  }

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handlePreviewImg = (e, messageId, photoId) => {
    e.preventDefault();
    setIsPreviewImg(true);
    setImgPreviewUrl(`${baseURL}/api/messages/${messageId}/image/${photoId}`)
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
    window.open(`${baseURL}/api/messages/${messageId}/files/${fileId}`)
  }

  const handleImageDownload = (event) => {
    event.preventDefault()
    window.open(`${baseURL}/api/messages/${message.id}/photos/${selectedPhotoId}`)
  }

  const parseMessage = (content) => {
    if (content) {
      let emojiList = [...content.matchAll(regex)];
      if (content.replaceAll(regex, '').trim().length === 0) {
        let emojiRenderList = []
        for (let emoji of emojiList) {
          emojiRenderList.push(joypixels.toImage(emoji[0]))
        }
        return (
          <div className="emoji-message">
            {emojiRenderList.map((e, idx) => {
              return (
                <span key={idx} >{parse(e)}</span>
              )
            })}
          </div>
        )
      } else {
        let newContent = urlify(content);
        if (emojiList[0]) {
          newContent = content.replaceAll(regex, `<span className="img-emoji">${joypixels.toImage(emojiList[0][0])}</span>`)
        }

        return (
          <p>
            {parse(newContent)}
          </p>
        )
      }
    }
  }

  return (
    <div className="message-component">
      {messageDif &&
        <div className='time-text'>
          <span>
            {messageDif}
          </span>
        </div>
      }
      {
        message.userId === logInUserId ?
          <div>
            {changeMessage && getAmTime(message.createdAt) && <span className="own-time">
              {changeMessage && getAmTime(message.createdAt)}
            </span>}
            <div className={`own-message ${lastMessage ? 'last-message' : ''}`}>
              <div>
                <IconButton onClick={handleOpenMenu}>
                  <MoreVertIcon className="icon-hover-menu" />
                </IconButton>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                  PaperProps={{
                    sx: {
                      background: 'var(--primary-bg)'
                    }
                  }}
                >
                  <MenuItem onClick={handleRemoveMessage} style={{ color: 'var(--text-color)' }}>Remove</MenuItem>
                </Menu>
              </div>
              <Tooltip title={getTime(message.createdAt)} placement="left">
                <div>
                  {message.content &&
                    parseMessage(message.content)
                  }
                  {message.photos && message.photos.length > 0 &&

                    <div className='message-photo-list'>
                      {message.photos.map((photo, idx) => {
                        return (message.photos.length > 1 ?
                          <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                            src={`${baseURL}/api/messages/${message.id}/image/${photo.id}`}
                            className={`${hasAvatar ? 'photo-last-message' : ''}`}
                            style={{
                              width: getImageSize(message.photos.length).itemWidth,
                              height: getImageSize(message.photos.length).height,
                            }} />
                          :
                          <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                            src={`${baseURL}/api/messages/${message.id}/image/${photo.id}`}
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
                          file.type === "audio" ?

                            <audio key={file.id} src={`${baseURL}/api/messages/${message.id}/files/${file.id}`} controls />

                            :
                            <div className="message-file" key={file.id} onClick={e => handleFileDownload(e, message.id, file.id)}>
                              <div className="file-name" >
                                <DescriptionIcon sx={{ color: '#000', margin: '5px' }} />
                                <span>
                                  {file.name}
                                </span>
                              </div>
                              <div className="file-size">
                                {getFileSize(file.size)}
                              </div>
                            </div>
                        )
                      })}
                    </div>
                  }
                </div>
              </Tooltip>
            </div >
          </div>
          :
          <div >
            <span className="message-time">
              {changeMessage && getAmTime(message.createdAt) &&
                <>
                  <span style={{ maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis' }} >
                    {userName.split(' ')[0]}
                  </span>, {getAmTime(message.createdAt)}
                </>}
            </span>
            <div className={`message  ${lastMessage ? 'last-message' : ''}`}
              style={{ marginBottom: hasAvatar ? '10px' : 0 }}>
              {hasAvatar &&
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>{userName ?
                  <Tooltip title={userName}>
                    <Avatar sx={{ width: '40px', height: '40px' }}
                      src={`${baseURL}/api/user/avatar/${message.userId}`} />
                  </Tooltip> : <Avatar sx={{ width: '40px', height: '40px' }}
                    src={`${baseURL}/api/user/avatar/${message.userId}`} />}
                </div>
              }
              <Tooltip title={getTime(message.createdAt)} placement='right'>
                <div className={message.photos && message.photos.length > 0 ? 'message-with-photo' : ''}>
                  {message.content &&
                    <div className={'text-message ' + (hasAvatar ? 'user-last-message' : '')}>
                      {parseMessage(message.content)}
                    </div>
                  }
                  {message.photos && message.photos.length > 0 &&
                    <div className='message-photo-list'
                      style={{ marginLeft: hasAvatar ? '5px' : '45px' }}>
                      {message.photos.map((photo, idx) => {
                        return (message.photos.length > 1 ?
                          <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                            src={`${baseURL}/api/messages/${message.id}/image/${photo.id}`}
                            className={`${hasAvatar ? 'photo-last-message' : ''}`}
                            style={{
                              width: getImageSize(message.photos.length).itemWidth,
                              height: getImageSize(message.photos.length).height,
                            }} />
                          :
                          <img key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                            src={`${baseURL}/api/messages/${message.id}/image/${photo.id}`}
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
                          file.type === 'audio' ?

                            <audio key={file.id} src={`${baseURL}/api/messages/${message.id}/files/${file.id}`} controls />

                            :
                            <div className="message-file" key={file.id} onClick={e => handleFileDownload(e, message.id, file.id)}>
                              <div className="file-name">
                                <DescriptionIcon sx={{ color: '#000', margin: '5px' }} />
                                <span>
                                  {file.name}
                                </span>
                              </div>
                              <div className="file-size">
                                {getFileSize(file.size)}
                              </div>
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
    </div>
  )
})

export default Message;