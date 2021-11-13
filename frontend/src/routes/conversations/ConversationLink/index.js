
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './conversationLink.css';
import { axiosAuth } from '../../../utils';
import { useHistory } from 'react-router';
import Avatar from '../../../components/Avatar';
import ImageIcon from '@mui/icons-material/Image';

export default function ConversationLink({ conversation, user }) {
    const [participant, setParticipant] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
    const lastMessageChange = useSelector(state => state.conversationReducer.lastMessageChange);
    const curParticipant = useSelector(state => state.conversationReducer.conversation.participant);
    const history = useHistory();
    useEffect(async () => {
        try {
            const response = await axiosAuth.get(`/api/users/${conversation.participantId}`);
            setParticipant(response.data);
            if (conversation.conversationId) {
                const response = await axiosAuth.get(`/api/conversations/${conversation.conversationId}/messages/lastMessage`);
                setLastMessage(response.data.lastMessage);
            }
        } catch (error) {
            console.log(error);
        }
    }, [lastMessageChange])

    const changeConversation = () => {
        history.replace(`/conversations/${participant.id}`)
    }

    return (
        <>
            {participant &&
                <div className={`${curParticipant && participant.id === curParticipant.id ? 'link-selected' : ''} conversation-link`} onClick={changeConversation}>
                    <Avatar width="40px" height="40px" userId={participant.id} />

                    <div className="link-content">
                        <div className="link-name" style={{
                            opacity: curParticipant && participant.id === curParticipant.id ? '1' : '0.7'
                        }}>
                            {participant.userName}
                        </div>
                        <div className={conversation.isRead ? 'last-message' : 'last-message-unread'}>
                            {lastMessage &&
                                (lastMessage.userId === user.id ?
                                    <span>You: {(lastMessage.photos && lastMessage.photos.length) ? <ImageIcon color='success' /> : lastMessage.content}</span>
                                    :
                                    <span>{(lastMessage.photos && lastMessage.photos.length) ? <ImageIcon color='success' /> : lastMessage.content}</span>
                                )
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    )
}