import React, { useState } from 'react'
import { Avatar, Tooltip, Dialog, DialogContent, IconButton } from '@mui/material';
import { baseURL, getTime } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';
import './style.css'

export default function MessageConversation({ message, logInUserId, hasAvatar, lastMessage, userName }) {
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
    return (
        <div className="message-conversation">
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
                            <Tooltip title={getTime(message.createdAt)} placement="left">
                                <div className='message-photo'>
                                    {message.photos && message.photos.map((photo, idx) => {
                                        return (
                                            <div key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)} >
                                                <div style={{
                                                    width: message.photos.length > 1 && '150px',
                                                    height: message.photos.length > 1 && '150px',
                                                }}>
                                                    <img width="100%" height="100%" src={`${baseURL}/api/messages/${message.id}/${photo.id}`} />
                                                </div>
                                            </div>)
                                    })}
                                </div>
                            </Tooltip>
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
                            <div className={message.photo ? 'message-with-photo' : ''}>
                                {message.content &&
                                    <Tooltip title={getTime(message.createdAt)} placement='right'>
                                        <p className={hasAvatar ? 'user-last-message' : ''}>
                                            {message.content}
                                        </p>
                                    </Tooltip>}
                                <Tooltip title={getTime(message.createdAt)} placement='right'>
                                    <div className="message-photo">
                                        {message.photos && message.photos.map((photo, idx) => {
                                            return (
                                                <div key={idx} onClick={e => handlePreviewImg(e, message.id, photo.id)}
                                                    className={`${hasAvatar ? 'photo-last-message' : ''}`}
                                                >
                                                    <div style={{
                                                        width: message.photos.length > 1 && '150px',
                                                        height: message.photos.length > 1 && '150px',
                                                    }}>
                                                        <img width="100%" height="100%" src={`${baseURL}/api/messages/${message.id}/${photo.id}`} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
            }

            <Dialog
                open={isPreviewImg}
                onClose={handleClose}
                fullWidth={false}
                maxWidth='xl'
            >
                <DialogContent>
                    <IconButton
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0
                        }}
                        onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                    <img width="100%" height="100%" src={imgPreviewUrl} />
                </DialogContent>
            </Dialog >
        </div>
    )
}
