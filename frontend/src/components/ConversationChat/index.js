import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cancelCall, getParticipant } from '../../store/reducers/conversation.reducer'
import Message from '../Message';
import Avatar from '../Avatar/index';
import {
    Button, IconButton, Tooltip, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import ImageIcon from '@mui/icons-material/Image';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import InfoIcon from '@mui/icons-material/Info';
import { socketClient, broadcastLocal, baseURL } from '../../utils';
import { getMessages, readConversation, startCall } from '../../store/reducers/conversation.reducer';
import './conversationChat.css';

export default function Index({ conversation, user }) {
    const participant = useSelector(state => state.conversationReducer.conversation.participant);
    const dispatch = useDispatch();
    useEffect(async () => {
        dispatch(getParticipant({ participantId: conversation.participantId }));
    }, [conversation.participantId])

    return (
        <>
            {participant &&
                <ConversationChat conversationId={conversation.conversationId} user={user} participant={participant} />
            }
        </>
    )
}

const ConversationChat = ({ conversationId, user, participant }) => {
    const [content, setContent] = useState('');
    const [rows, setRows] = useState(1);
    const minRows = 1;
    const maxRows = 5;

    const [imageMessage, setImageMessage] = useState(null);
    const [imageMessageUrl, setImageMessageUrl] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const conversationCall = useSelector(state => state.conversationReducer.conversationCall);
    const messages = useSelector(state => state.conversationReducer.conversation.messages);
    const dispatch = useDispatch();

    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length])

    useEffect(() => {
        dispatch(getMessages({ conversationId }))
        dispatch(readConversation({ conversationId, userId: user.id }))
    }, [conversationId])

    const onWriteMessage = (event) => {
        const textareaLineHeight = 24;

        const previousRows = event.target.rows;
        event.target.rows = minRows; // reset number of rows in textarea 
        const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }

        if (currentRows >= maxRows) {
            event.target.rows = maxRows;
            event.target.scrollTop = event.target.scrollHeight;
        }
        setRows(currentRows < maxRows ? currentRows : maxRows)
        setContent(event.target.value);
    }

    const handleEnterMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setContent('');
        }
    }

    const handleSendMessage = (event) => {
        if (content !== '' || imageMessage) {
            socketClient.emit('conversation-sendMessage', { content, senderId: user.id, receiverId: participant.id, conversationId, image: imageMessage });
            broadcastLocal.postMessage({ content, senderId: user.id, receiverId: participant.id, conversationId, image: imageMessage })
            setContent('');
            setImageMessage(null);
            setImageMessageUrl('');
            setRows(minRows);
        }
    }



    const handleSendIcon = () => {

        // fetch('./public/logo152.png')
        //     .then(res => res.arrayBuffer())
        //     .then(data => {
        //         console.log(data);
        //         const file = new File(new Uint8Array(data), 'thumb.png');
        //         console.log(file);
        //         socketClient.emit('conversation-sendMessage', { content, senderId: user.id, receiverId: participant.id, conversationId, image: file });
        //         broadcastLocal.postMessage({ content, senderId: user.id, receiverId: participant.id, conversationId, image: imageMessage })
        //     })

    }


    const handleVoiceCall = () => {
        socketClient.emit('conversation-call', { conversationId, senderId: user.id, senderName: user.userName, receiverId: participant.id });
        dispatch(startCall({ conversationId, senderId: user.id, senderName: user.userName, receiverId: participant.id }))
    }

    const handleCancelCall = () => {
        socketClient.emit('conversation-cancel-call', { conversationId, senderId: user.id, receiverId: participant.id })
        dispatch(cancelCall({ conversationId }))
    }

    const onImageInputChange = e => {
        e.preventDefault()
        setImageMessage(e.target.files[0])
        let reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onloadend = e => {
            setImageMessageUrl(reader.result)
        }
    }

    return (
        <>
            <div className="conversation-message" style={{ width: !showInfo ? '100%' : '75%' }}>
                <div className="header-message">
                    <div className="header-left">
                        <Avatar width='40px' height='40px'
                            userId={participant.id} />
                        <span style={{ marginLeft: '15px', fontSize: '1.2em', fontWeight: '500' }}>{participant.userName}</span>
                    </div>
                    <div className="header-btn-list">
                        <Tooltip title="Start a voice call">
                            <IconButton onClick={handleVoiceCall}>
                                <PhoneIcon color='primary' />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Start a video call">
                            <IconButton >
                                <VideocamIcon color='primary' />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Conversation info">
                            <IconButton onClick={e => setShowInfo(!showInfo)}>
                                <InfoIcon color='primary' />
                            </IconButton>
                        </Tooltip>

                    </div>
                </div>
                <div className="content-message" ref={scrollRef}>
                    <div className="info-beginner-content">
                        <Avatar width='80px' height='80px'
                            userId={participant.id} />
                        <div >
                            {participant.userName}
                        </div>
                        <div style={{ fontSize: "18px", opacity: "0.6" }}>
                            Welcome to me!!!
                        </div>
                    </div>
                    {messages.length > 0 && messages.slice(0, messages.length - 1)
                        .map((message, idx) => {
                            return (
                                <Message message={message} key={message.id}
                                    logInUserId={user.id}
                                    hasAvatar={message.userId != messages[idx + 1].userId} />
                            )
                        })}
                    {messages.length > 0 && <Message message={messages[messages.length - 1]}
                        logInUserId={user.id}
                        hasAvatar={true} lastMessage={true} />}

                </div>
                <div className="bottom-message">
                    {imageMessageUrl && <div className='image-message-upload'>
                        <div style={{
                            backgroundImage: `url("${imageMessageUrl}")`
                        }}>
                        </div>
                        <i className="far fa-times-circle remove-image-btn"
                            onClick={e => {
                                e.preventDefault()
                                setImageMessageUrl('')
                                setImageMessage(null);
                            }}></i>
                    </div>}
                    <div className="input-message">
                        <textarea className="input-box"
                            placeholder="Send message"
                            rows={rows}
                            onChange={onWriteMessage}
                            onKeyDown={handleEnterMessage}
                            value={content}
                        />
                        <div className="input-btn">
                            <Tooltip title="Attach a photo">
                                <Button >
                                    <label style={{ cursor: 'pointer' }} htmlFor="images">
                                        <ImageIcon color='success' />
                                    </label>
                                    <input type="file" accept='image/*'
                                        onChange={onImageInputChange}
                                        id="images" style={{
                                            display: 'none'
                                        }} />
                                </Button>
                            </Tooltip>
                            <Tooltip title="Choose an emoji">
                                <Button onClick={handleSendIcon} >
                                    <InsertEmoticonIcon color='secondary' />
                                </Button>
                            </Tooltip>
                            <Tooltip title="Send message">
                                <Button onClick={handleSendMessage}>
                                    <SendIcon style={{ color: "#1A73E8" }} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
            {
                showInfo &&
                <div className="conversation-info" >
                    <div className="custom-info">
                        <Avatar width='40px' height='40px'
                            userId={participant.id} />
                        <div style={{ fontSize: "36px" }}>
                            {participant.userName}
                        </div>
                    </div>
                </div>
            }

            <Dialog
                open={conversationCall.isCalling}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    <Avatar width='40px' height='40px'
                        userId={participant.id} />
                    {participant.userName}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Wait for the other party to pick up the phone ...
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelCall}>Cancel</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}



