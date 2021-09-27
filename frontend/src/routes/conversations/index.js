import React, { useState } from 'react';
import './conversations.css';
import { Button } from 'react-bootstrap';

export default function Conversations() {
    const [rows, setRows] = useState(2);
    const [message, setMessage] = useState('')
    const minRows = 2;
    const maxRows = 5;
    const handleChange = (event) => {
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

    const handleEnterMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setMessage('');
        }
    }

    const handleSendMessage = () => {
        if (message !== '') {
            setMessage('');
        }
    }

    return (
        <>
            <div className="conversation-list">
                <div className="user-chat">
                    <div>Avatar</div>
                    <div style={{ marginLeft: "15px" }}>
                        <div>
                            Name
                        </div>
                        <div>content</div>
                    </div>
                </div>

            </div>
            <div className="conversation-content">
                <div className="content-message">
                    <div>
                        hello
                    </div>
                </div>
                <div className="input-message">
                    <textarea className="input-box"
                        placeholder="Send message"
                        rows={rows}
                        onChange={handleChange}
                        onKeyDown={handleEnterMessage}
                        
                        value={message}
                    />
                    <div>
                        <Button variant="outline-light"  onClick={handleSendMessage}>
                            <i style={{ color: "#1A73E8" }} className="far fa-paper-plane"></i>
                        </Button>
                    </div>

                </div>
            </div>
        </>
    )
}
