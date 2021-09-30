import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { axiosAuth } from '../../utils';
import { Link } from 'react-router-dom';
import Avatar from '../Avatar';
import './userChatLink.css';


export default function UserChatLink({ conversationId, user }) {
    const [participantInfo, setParticipantInfo] = useState(null);
    const [lastMessage, setLastMessage] = useState({});
        
    useEffect(async () => {
        const resParticipant = await axiosAuth.get(`/api/conversations/${conversationId}/users/${user.id}`);
        setParticipantInfo(resParticipant.data.participant);

        const resLastMessage = await axiosAuth.get(`/api/conversations/${conversationId}/messages/lastMessage`);
        setLastMessage(resLastMessage.data.lastMessage);
    }, [])

    return (
        <>
            {participantInfo &&
                <Link to={`/conversations/${participantInfo.id}`} key={participantInfo.id} style={{ textDecoration: "none", color: "black", width: "100%", display: "flex", justifyContent: "center" }}>
                    <div className="user-chat">
                        <Avatar width="40px" height="40px" userId={participantInfo.id} />
                        <div style={{ marginLeft: "15px" }}>
                            {participantInfo.userName}
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "120px", opacity: "0.6" }}>
                                {lastMessage &&
                                    (lastMessage.userId === user.id ?
                                        <span>You: {lastMessage.content}</span>
                                        :
                                        <span>{lastMessage.content}</span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </Link>
            }
        </>
    )
}
