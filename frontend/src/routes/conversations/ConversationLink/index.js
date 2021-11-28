
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './conversationLink.css';
import { axiosAuth } from '../../../utils';
import { useHistory } from 'react-router';
import Avatar from '../../../components/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import AttachFile from '@mui/icons-material/AttachFile';
import Badge from '@mui/material/Badge';


const getElementLastMessage = (lastMessage) => {
    if (lastMessage.photos && lastMessage.photos.length) {
        return (
            <>
                <ImageIcon color='success' />
                Image
            </>
        )
    } else if (lastMessage.files && lastMessage.files.length) {
        return (
            <>
                <AttachFile color='primary' />
                Attach file
            </>
        )
    } else {
        return lastMessage.content;
    }

}


export default function ConversationLink({ conversation, user }) {
    const [lastMessage, setLastMessage] = useState(null);
    const lastMessageChange = useSelector(state => state.conversationReducer.lastMessageChange);
    const curParticipant = useSelector(state => state.conversationReducer.conversation.participant);
    const history = useHistory();
    useEffect(async () => {
        try {
            if (conversation.conversationId) {
                const response = await axiosAuth.get(`/api/conversations/${conversation.conversationId}/messages/lastMessage`);
                setLastMessage(response.data.lastMessage);
            }
        } catch (error) {
            console.log(error);
        }
    }, [lastMessageChange])

    const changeConversation = (event) => {
        event.preventDefault();
        history.replace(`/conversations/${conversation.participantId}`)
    }


    const getColorStatus = (status) => {
        if (status === 'active') {
            return 'success';
        } else if (status === 'sleep') {
            return 'warning';
        } else if (status === 'busy') {
            return 'error';
        } else if (status === 'inactive') {
            return 'info';
        }
    }

    return (

        <div className={`${curParticipant && conversation.participantId === curParticipant.id ? 'link-selected' : ''} conversation-link`}
            onClick={changeConversation}>
            <Badge
                badgeContent=" "
                variant="dot"
                color={getColorStatus(conversation.status)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                invisible={conversation.status === 'inactive'}

            >
                <Avatar width="40px" height="40px" userId={conversation.participantId} />
            </Badge>

            <div className="link-content">
                <div className="link-name" style={{
                    opacity: curParticipant && conversation.participantId === curParticipant.id ? '1' : '0.7'
                }}>
                    <span>{conversation.participantName}</span>
                </div>
                <div className={conversation.isRead ? 'last-message' : 'last-message-unread'}>
                    {lastMessage &&
                        (lastMessage.userId === user.id ?
                            <span>You: {getElementLastMessage(lastMessage)}</span>
                            :
                            <span> {getElementLastMessage(lastMessage)}</span>
                        )
                    }
                </div>
            </div>
        </div>

    )
}