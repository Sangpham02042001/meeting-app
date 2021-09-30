import React, { useEffect, useState } from 'react';
import { axiosAuth } from '../../utils';
import {  Route } from 'react-router';
import UserChat from './UserChat'
import './userChatList.css'

export default function UserChatBox({ conversationId, user }) {
    const [participantInfo, setParticipantInfo] = useState(null);

    useEffect(async () => {
        const response = await axiosAuth.get(`/api/conversations/${conversationId}/users/${user.id}`);
        setParticipantInfo(response.data.participant);
    }, [])

    return (
        <>
            {participantInfo &&
                <Route path={`/conversations/${participantInfo.id}`} key={participantInfo.id}>
                    <UserChat conversationId={conversationId} user={user} participant={participantInfo}/>
                </Route>
            }
        </>
    )
}
