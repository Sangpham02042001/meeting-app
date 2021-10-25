import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getParticipant } from '../../store/reducers/conversation.reducer'
import Avatar from '../Avatar';
import Message from '../Message';
import { Button } from 'react-bootstrap';
import { socketClient, broadcastLocal } from '../../utils';
import { getMessages, readConversation } from '../../store/reducers/conversation.reducer';
import './conversationChat.css';

export default function Index({ conversation, user }) {
    const participant = useSelector(state => state.conversationReducer.participant);
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
    const [showInfo, setShowInfo] = useState(true);

    const messages = useSelector(state => state.conversationReducer.messages)
    const dispatch = useDispatch();

    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length])

    useEffect(() => {
        dispatch(getMessages({ conversationId }))
        dispatch(readConversation({ conversationId }))
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
        socketClient.emit('conversation-call', { conversationId: conversationId, senderId: user.id, receiverId: participant.id });
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
            <div className="conversation-message" style={{ width: !showInfo ? '100%' : '' }}>
                <div className="header-message">
                    <div className="header-name">
                        <Avatar width="40px" height="40px" userId={participant.id} />
                        <div style={{ margin: "auto 15px", fontSize: "17px", marginLeft: "15px" }}>
                            <div style={{ color: "black", textDecoration: "none" }}>{participant.userName}</div>
                        </div>
                    </div>
                    <div className="header-btn-list">
                        <button className="header-btn" onClick={handleVoiceCall}>
                            <i style={{ color: "#1A73E8", fontSize: "18px" }} className="fas fa-phone"></i>
                        </button>
                        <button className="header-btn">
                            <i style={{ color: "#1A73E8", fontSize: "18px" }} className="fas fa-video"></i>
                        </button>
                        <button className="header-btn" onClick={e => setShowInfo(!showInfo)}>
                            <i style={{ color: "#1A73E8", fontSize: "18px" }} className="fas fa-info"></i>
                        </button>
                    </div>
                </div>
                <div className="content-message" ref={scrollRef}>
                    <div className="info-beginner-content">
                        <Avatar width="100px" height="100px" userId={participant.id} />
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
                            <Button variant="outline-light" onClick={handleSendMessage}>
                                <i style={{ color: "#1A73E8" }} className="far fa-paper-plane"></i>
                            </Button>
                            <Button variant="outline-light">
                                <label htmlFor="images">
                                    <i style={{ color: "#69B00B", cursor: "pointer" }} className="fas fa-image"></i>
                                </label>

                                <input type="file" accept='image/*'
                                    onChange={onImageInputChange}
                                    id="images" style={{
                                        display: 'none'
                                    }} />
                            </Button>
                            <Button variant="outline-light" onClick={handleSendIcon} >
                                <i style={{ color: "#1A73E8" }} className="fas fa-thumbs-up"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {showInfo &&
                <div className="conversation-info">
                    <div className="custom-info">
                        <Avatar width="100px" height="100px" userId={participant.id} />
                        <div style={{ fontSize: "36px" }}>
                            {participant.userName}
                        </div>
                    </div>
                </div>
            }

        </>
    )
}



