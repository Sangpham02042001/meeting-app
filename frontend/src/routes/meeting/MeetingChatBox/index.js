import React, { useState, useEffect, useRef } from 'react'
import { Button, IconButton, TextField } from '@mui/material';
import './meetingChatBox.css';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { socketClient, broadcastLocal } from '../../../utils';
import Message from '../../../components/Message';

export default function ChatBox({ chatVisible }) {
    const { teamId } = useParams()
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const userReducer = useSelector(state => state.userReducer)
    const meetingReducer = useSelector(state => state.meetingReducer)
    const [image, setImage] = useState(null)
    const [imageUrl, setImageUrl] = useState('')
    const currentNumOfMessages = meetingReducer.meeting.messages.length
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        window.addEventListener('paste', e => {
            if (document.activeElement == inputRef.current) {
                if (e.clipboardData.files.length > 0) {
                    let file = e.clipboardData.files[0]
                    let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
                    if (regex.test(file.name)) {
                        setImage(file)
                        let reader = new FileReader()
                        let url = reader.readAsDataURL(file)
                        reader.onloadend = e => {
                            setImageUrl(reader.result)
                        }
                    }
                }
            }
        })

        return () => {
            window.removeEventListener('paste', () => {
                console.log('remove events')
            })
        }
    }, [])

    useEffect(() => {
        if (currentNumOfMessages) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentNumOfMessages])

    const onChangeMessage = (event) => {
        setMessage(event.target.value)
    }
    const handleEnterSendMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setMessage('');
        }
    }

    const handleSendMessage = () => {
        let userId = userReducer.user.id;
        if (message !== '' || image) {
            socketClient.emit('send-message-meeting', {
                senderId: userId,
                meetingId: meetingReducer.meeting.id,
                content: message,
                image,
                teamId
            })
            setMessage('');
            setImageUrl('');
            setImage('');
        }

    }

    const handleImageInputChange = e => {
        e.preventDefault()
        setImage(e.target.files[0])
        let reader = new FileReader()
        let url = reader.readAsDataURL(e.target.files[0])
        reader.onloadend = e => {
            setImageUrl(reader.result)
        }
    }

    return (
        <div className="chatbox">
            <div className="chatbox-header">
                <div>
                    Messages
                </div>
                <div>
                    <IconButton onClick={chatVisible}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>
            <div className="chatbox-content">
                {currentNumOfMessages !== 0 && <div className='message-list'
                    ref={scrollRef} style={{
                        height: `calc(60vh - ${imageUrl ? 120 : 0}px)`
                    }}>
                    {currentNumOfMessages && meetingReducer.meeting.messages.slice(0, currentNumOfMessages - 1)
                        .map((message, idx) => (
                            <Message message={message} key={'message' + message.id}
                                logInUserId={null}
                                hasAvatar={message.userId != meetingReducer.meeting.messages[idx + 1].userId} />
                        ))}
                    {currentNumOfMessages && <Message message={meetingReducer.meeting.messages[currentNumOfMessages - 1]}
                        logInUserId={null}
                        hasAvatar={true} lastMessage={true} />}
                </div>}
                {imageUrl && <div className='image-message-upload'>
                    <div style={{
                        backgroundImage: `url("${imageUrl}")`
                    }}>
                    </div>
                    <IconButton className='remove-image-btn'
                        onClick={e => {
                            setImageUrl('')
                        }}>
                        <CloseIcon />
                    </IconButton>
                </div>}
            </div>
            <div className="chatbox-sender">
                <TextField variant='outlined' ref={inputRef} placeholder="Send message"
                    onKeyDown={handleEnterSendMessage} onChange={onChangeMessage} value={message} />
                <Button >
                    <label htmlFor="images" style={{ cursor: 'pointer' }}>
                        <ImageIcon color='success' />
                    </label>
                    <input type="file" accept='image/*'
                        onChange={handleImageInputChange}
                        id="images" style={{
                            display: 'none'
                        }} />
                </Button>
                <IconButton onClick={handleSendMessage}>
                    <SendIcon style={{ color: "#1A73E8" }} />
                </IconButton>
            </div>
        </div>
    )
}


