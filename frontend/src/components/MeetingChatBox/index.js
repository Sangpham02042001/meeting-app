import React, { useState, useEffect } from 'react'
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import './meetingChatBox.css';
import { useDispatch, useSelector } from 'react-redux';
import { saveMessage } from '../../store/reducers/roomChatBox';
import { socketClient } from '../../utils';

export default function ChatBox({ chatVisible }) {
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const messages = useSelector(state => state.roomChatBoxReducer.messages);

    useEffect(() => {
        socketClient.on('receive-message', ({ message, userId }) => {
            dispatch(saveMessage({ message, userId }));
        })
    }, [])

    const handleChangeMessage = (event) => {
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
        console.log(message);
        let userId = socketClient.id;
        if (message !== '') {
            dispatch(saveMessage({ message, userId }));

            socketClient.emit("send-message", ({ message, userId }))
            setMessage('');
        }

    }


    return (
        <div className="chatbox">
            <div className="chatbox-header">
                <div className="chatbox-header-title">
                    Message
                </div>
                <div>
                    <Button variant="outline-light" onClick={chatVisible}>
                        <i style={{ color: "black" }} className="fas fa-times"></i>
                    </Button>
                </div>
            </div>
            <div className="chatbox-content">
                {messages.map((message, idx) => {
                    return <div key={idx}>
                        {message.userId}
                        <div>
                            {message.message}
                        </div>
                    </div>
                })}
            </div>
            <div className="chatbox-sender">
                <InputGroup>
                    <FormControl className="input-box" as="textarea" placeholder="Send message" onKeyDown={handleEnterSendMessage} onChange={handleChangeMessage} value={message} />
                    <Button type="submit" variant="outline-light" onClick={handleSendMessage}>
                        <i style={{ color: "#1A73E8" }} className="far fa-paper-plane"></i>
                    </Button>
                </InputGroup>

            </div>
        </div>
    )
}


