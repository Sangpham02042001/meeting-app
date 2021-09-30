import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Avatar from '../Avatar';
import { socketClient } from '../../utils';
import { sendMessage, getMessagesConversation } from '../../store/reducers/conversation.reducer';
import './userChatList.css';
import {v1 as uuid} from 'uuid';

export default function UserChat({ conversationId, user, participant }) {
    const [message, setMessage] = useState('');
    const [rows, setRows] = useState(1);
    const minRows = 1;
    const maxRows = 5;

    const messages = useSelector(state => state.conversationReducer.messages)

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getMessagesConversation({ conversationId }))
    }, [])

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
        setMessage(event.target.value);
    }

    const onScrollChange = (event) => {
        console.log(event.target.scrollHeight)
        event.target.scrollTop = event.target.scrollHeight;
    }

    const handleEnterMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setMessage('');
        }
    }

    const handleSendMessage = (event) => {
        if (message !== '') {
            const userId = user.id;
            const id = uuid()
            socketClient.emit('conversation-send-message', {id, content: message, userId, conversationId: conversationId });
            dispatch(sendMessage({id, content: message, userId, conversationId: null }));
            setMessage('');
            setRows(minRows);
        }

    }
    return (
        <>
            <div className="conversation-message">
                <div className="header-message">
                    <div className="header-name">
                        <Avatar width="40px" height="40px" userId={user.id} />
                        <div style={{ display: "flex", alignItems: "center", fontSize: "17px", marginLeft: "15px" }}>
                            <Link to="/profile" style={{ color: "black", textDecoration: "none" }}>{participant.userName}</Link>
                        </div>
                    </div>
                    <div className="header-btn-list">
                        <button className="header-btn">
                            <i style={{ color: "#1A73E8", fontSize: "20px" }} className="fas fa-phone"></i>
                        </button>
                        <button className="header-btn">
                            <i style={{ color: "#1A73E8", fontSize: "20px" }} className="fas fa-video"></i>
                        </button>
                    </div>
                </div>
                <div className="content-message" onChange={onScrollChange}>
                    {messages.map((message) => {
                        return (
                            <div key={message.id} className={message.userId === user.id ? "my-message" : "user-message"}>
                                <div className='message-send'>
                                    {message.content}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="input-message">
                    <textarea className="input-box"
                        placeholder="Send message"
                        rows={rows}
                        onChange={onWriteMessage}
                        onKeyDown={handleEnterMessage}
                        value={message}
                    />
                    <div className="input-btn">
                        <Button variant="outline-light" onClick={handleSendMessage}>
                            <i style={{ color: "#1A73E8" }} className="far fa-paper-plane"></i>
                        </Button>
                        <Button variant="outline-light" onClick={handleSendMessage}>
                            <i style={{ color: "#69B00B" }} className="fas fa-image"></i>
                        </Button>
                        <Button variant="outline-light" onClick={handleSendMessage}>
                            <i style={{ color: "#1A73E8" }} className="fas fa-thumbs-up"></i>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="conversation-custom">
                <div className="custom-info">
                    <Avatar width="100px" height="100px" userId={participant.id} />
                    <div style={{ fontSize: "36px" }}>
                        {participant.userName}
                    </div>
                </div>

            </div>
        </>
    )
}
