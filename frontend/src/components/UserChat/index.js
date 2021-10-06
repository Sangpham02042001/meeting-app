import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getParticipant } from '../../store/reducers/conversation.reducer'
import Avatar from '../Avatar';
import Message from '../Message';
import { Button } from 'react-bootstrap';
import { socketClient } from '../../utils';
import { setMessage, getMessages, setConversation } from '../../store/reducers/conversation.reducer';
import './userChat.css';
import { v1 as uuid } from 'uuid';

export default function Index({ conversation, user }) {
    const participant = useSelector(state => state.conversationReducer.participant);
    const dispatch = useDispatch();
    useEffect(async () => {
        dispatch(getParticipant({ participantId: conversation.participantId }));
    }, [conversation.participantId])

    return (
        <>
            {participant &&
                <UserChat conversationId={conversation.conversationId} user={user} participant={participant} />
            }
        </>
    )
}

const UserChat = ({ conversationId, user, participant }) => {
    const [content, setContent] = useState('');
    const [rows, setRows] = useState(1);
    const minRows = 1;
    const maxRows = 5;

    const messages = useSelector(state => state.conversationReducer.messages)
    const dispatch = useDispatch();

    useEffect(() => {
        socketClient.on('conversation-receiveMessage', ({ content, senderId, conversationId }) => {
            const id = uuid()
            dispatch(setMessage({ id, content, userId: senderId, conversationId }));
            console.log('receive message', content, user.id);
        })

        socketClient.on('set-conversation', ({ nConversationId, oConversationId }) => {
            dispatch(setConversation({ nConversationId, oConversationId }))
        })
    }, [])

    useEffect(() => {

        dispatch(getMessages({ conversationId }))
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

    const onScrollChange = (event) => {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaa')
        console.log(event.target.scrollHeight)
        event.target.scrollTop = event.target.scrollHeight;
    }

    const handleEnterMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setContent('');
        }
    }

    const handleSendMessage = (event) => {
        if (content !== '') {
            const id = uuid();
            socketClient.emit('conversation-sendMessage', { content, senderId: user.id, receiverId: participant.id, conversationId });
            dispatch(setMessage({ id, content, userId: user.id, conversationId }));
            setContent('');
            setRows(minRows);
        }
    }


    return (
        <>
            <div className="conversation-message">
                <div className="header-message">
                    <div className="header-name">
                        <Avatar width="40px" height="40px" userId={user.id} />
                        <div style={{ margin: "auto 15px", fontSize: "17px", marginLeft: "15px" }}>
                            <div style={{ color: "black", textDecoration: "none" }}>{participant.userName}</div>
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
                            <Button variant="outline-light" onClick={handleSendMessage}>
                                <i style={{ color: "#69B00B" }} className="fas fa-image"></i>
                            </Button>
                            <Button variant="outline-light" onClick={handleSendMessage}>
                                <i style={{ color: "#1A73E8" }} className="fas fa-thumbs-up"></i>
                            </Button>
                        </div>
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



