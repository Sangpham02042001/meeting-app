import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom'
import { getParticipant } from '../../store/reducers/conversation.reducer';
import { socketClient } from '../../utils';
import Peer from 'simple-peer';
import './style.css';
export default function RoomCall() {
    const dispatch = useDispatch()
    const { participantId } = useParams();
    const user = useSelector(state => state.userReducer.user);
    const participant = useSelector(state => state.conversationReducer.conversation.participant);

    useEffect(() => {
        dispatch(getParticipant({ participantId }))
        socketClient.on('conversation-accepted-call', ({ conversationId, senderId, senderName, receiverId }) => {

            if (receiverId == participantId) {
                navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                    .then(stream => {
                        let peer = new Peer({ initiator: true, stream })
                        peer.on('signal', data => {
                            socketClient.emit('conversation-send-signal', { senderId, receiverId, peer })
                        })
                    })

            }
        })

    }, [])
    return (
        <div className="room-call">
            Ringing
        </div>
    )
}
