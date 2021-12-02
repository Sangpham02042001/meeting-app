import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom'
import { getParticipant } from '../../store/reducers/conversation.reducer';
import { socketClient, baseURL, getConnectedDevices } from '../../utils';
import { Tooltip, IconButton, Avatar, Button } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { LoadingButton } from '@mui/lab';
import Peer from 'simple-peer';
import './style.css';

const Video = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        console.log(peer)
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
            console.log(stream)
        })
    }, []);

    return (
        <>
            <video width="100%" height="100%" ref={ref} autoPlay />
        </>
    );
}




export default function RoomCall() {
    const dispatch = useDispatch();
    const query = new URLSearchParams(useLocation().search);
    const { participantId } = useParams();
    const user = useSelector(state => state.userReducer.user);
    const participant = useSelector(state => state.conversationReducer.conversation.participant);


    const [roomCallActive, setRoomCallActive] = useState(true);
    const [isAccepted, setIsAccepted] = useState(false);
    const [peer, setPeer] = useState(null);
    const [setupDevice, setSetupDevice] = useState(false);
    const [isEnableVideo, setIsEnableVideo] = useState(false);
    const [isEnableAudio, setIsEnableAudio] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(query.get('video') == 'true' || false);
    const [isAudioActive, setIsAudioActive] = useState(true);
    const [isPartAudio, setIsPartAudio] = useState(true);
    const [isPartVideo, setIsPartVideo] = useState(false);
    const [conversationId, setConversationId] = useState(null);

    const peerRef = useRef(null);
    const myStreamRef = useRef(null);
    const partStreamRef = useRef(null);

    const createPeer = ({ conversationId, userId, participantId, stream }) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        url: 'turn:numb.viagenie.ca',
                        credential: 'muazkh',
                        username: 'webrtc@live.com'
                    }]
            },
            stream,
        });
        peer.on("signal", signal => {
            socketClient.emit("conversation-send-signal", {
                conversationId, senderId: userId, receiverId: participantId, signal,
                isAudio: isAudioActive, isVideo: isVideoActive
            })
        })
        return peer;
    }

    const addPeer = ({ conversationId, incomingSignal, senderId, receiverId, stream }) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        url: 'turn:numb.viagenie.ca',
                        credential: 'muazkh',
                        username: 'webrtc@live.com'
                    }]
            },
            stream,
        })
        peer.on("signal", signal => {
            socketClient.emit("conversation-return-signal", {
                conversationId, senderId, receiverId, signal,
                isAudio: isAudioActive, isVideo: isVideoActive
            })
        })
        peer.signal(incomingSignal);
        return peer;
    }

    useEffect(() => {
        dispatch(getParticipant({ participantId }));
        getConnectedDevices('videoinput', (cameras) => {
            if (cameras.length) setIsEnableVideo(true);
        })

        getConnectedDevices('audioinput', (audios) => {
            if (audios.length) setIsEnableAudio(true);
            setSetupDevice(true);
        })

    }, [])

    useEffect(() => {
        if (setupDevice && roomCallActive) {
            console.log(isEnableAudio, isEnableVideo)
            if (!isEnableVideo && !isEnableAudio) {

                socketClient.on('conversation-accepted-call', ({ conversationId, senderId, receiverId }) => {
                    console.log('create peer')
                    let peer = createPeer({ conversationId, userId: receiverId, participantId: senderId, stream: false })
                    peerRef.current = peer;
                    setPeer(peer);
                    setConversationId(conversationId);
                })

                socketClient.on('conversation-sent-signal', ({ conversationId, senderId, receiverId, signal, isAudio, isVideo }) => {
                    let peer = addPeer({ conversationId, incomingSignal: signal, senderId, receiverId, stream: false })
                    peerRef.current = peer;
                    setPeer(peer);
                    setIsAccepted(true);
                    setIsPartAudio(isAudio);
                    setIsPartVideo(isVideo);
                })

            } else {
                navigator.mediaDevices.getUserMedia({ video: isEnableVideo, audio: isEnableAudio })
                    .then(stream => {

                        myStreamRef.current.srcObject = stream;
                        myStreamRef.current.srcObject.getVideoTracks().forEach(track => {
                            track.enabled = isVideoActive;
                        })

                        socketClient.on('conversation-accepted-call', ({ conversationId, senderId, receiverId }) => {
                            console.log('create peer')
                            let peer = createPeer({ conversationId, userId: receiverId, participantId: senderId, stream })
                            peerRef.current = peer;
                            setPeer(peer);
                        })


                        socketClient.on('conversation-sent-signal', ({ conversationId, senderId, receiverId, signal, isAudio, isVideo }) => {
                            let peer = addPeer({ conversationId, incomingSignal: signal, senderId, receiverId, stream })
                            peerRef.current = peer;
                            setPeer(peer);
                            setIsAccepted(true);
                            setIsPartAudio(isAudio);
                            setIsPartVideo(isVideo);
                        })
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }

            socketClient.on('conversation-returning-signal', ({ signal, isAudio, isVideo }) => {
                peerRef.current.signal(signal);
                setIsAccepted(true);
                setIsPartAudio(isAudio);
                setIsPartVideo(isVideo);
            })

            socketClient.on('muted-device', ({ type, isActive }) => {
                console.log(type, isActive)
                if (type === 'audio') {
                    setIsPartAudio(isActive);
                } else if (type === 'video') {
                    setIsPartVideo(isActive)
                }
            })

            socketClient.on('cancel-call', ({ conversationId }) => {
                setRoomCallActive(false);
            })

        }

    }, [setupDevice])


    useEffect(() => {
        if (peer) {
            peer.on('stream', stream => {
                console.log(stream)
                partStreamRef.current.srcObject = stream;
            })
        }
    }, [peer])


    const handleEndCall = () => {
        window.open("", "_self").close();
    }

    const toggleAudio = (event) => {
        event.preventDefault();

        myStreamRef.current.srcObject.getAudioTracks().forEach(track => {
            track.enabled = !isAudioActive
        })

        socketClient.emit('mute-device', { type: 'audio', isActive: !isAudioActive })

        setIsAudioActive(!isAudioActive);
    }

    const toggleVideo = (event) => {
        event.preventDefault();
        myStreamRef.current.srcObject.getVideoTracks().forEach(track => {
            track.enabled = !isVideoActive
        })
        socketClient.emit('mute-device', { type: 'video', isActive: !isVideoActive })
        setIsVideoActive(!isVideoActive);
    }

    return (
        <div className="room-call">
            {roomCallActive ?
                <>
                    <div className="video-content">
                        <div className="video-content-user">
                            <div className="user-video" >
                                {(!isVideoActive || !isEnableVideo) &&
                                    <Avatar className="video-avatar"
                                        src={`${baseURL}/api/user/avatar/${user.id}`}
                                        alt={user.firstName} />
                                }
                                <video width="100%" height="100%" ref={myStreamRef} autoPlay muted />
                                <div className="video-name">
                                    You
                                </div>
                            </div>
                        </div>
                        <div className="video-content-part">
                            <div className="part-video">

                                {participant &&
                                    <>
                                        <div className="video-avatar">
                                            {!isPartVideo && < Avatar
                                                sx={{
                                                    width: '120px',
                                                    height: '120px'
                                                }}
                                                src={`${baseURL}/api/user/avatar/${participant.id}`}
                                                alt={participant.firstName} />
                                            }
                                            <span style={{ color: '#fff' }}> {isAccepted ? '' : 'Joining...'}
                                                <LoadingButton sx={{ color: '#fff' }} loading={!isAccepted} ></LoadingButton>
                                            </span>
                                        </div>

                                        <div className="video-name">
                                            {participant.userName}
                                            <span style={{ color: '#fff' }}> {isPartAudio ? <MicIcon /> : <MicOffIcon />}</span>
                                        </div>
                                        {peer && <>
                                            <video width="100%" height="100%" ref={partStreamRef} autoPlay />

                                        </>}
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="room-btn">
                        {
                            !isEnableVideo ?
                                <Tooltip placement="top" title="No camera found">
                                    <div>
                                        <IconButton style={{ borderColor: '#908f8f' }} disabled>
                                            <i style={{ color: '#908f8f' }} className="fas fa-video-slash"></i>
                                        </IconButton>
                                    </div>
                                </Tooltip >
                                :
                                <IconButton onClick={toggleVideo} >
                                    {!isVideoActive ?
                                        <Tooltip placement="top" title="Turn on camera">
                                            <i className="fas fa-video-slash"></i>
                                        </Tooltip>
                                        :
                                        <Tooltip placement="top" title="Turn off camera">
                                            <i className="fas fa-video"></i>
                                        </Tooltip>}
                                </IconButton>
                        }
                        {
                            !isEnableAudio ?
                                <Tooltip placement="top" title="No micro found">
                                    <div>
                                        <IconButton style={{ color: '#908f8f', borderColor: '#908f8f' }} disabled >
                                            <MicOffIcon />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                                :
                                <IconButton onClick={toggleAudio} >
                                    {!isAudioActive ?
                                        <Tooltip placement="top" title="Turn on mic">
                                            <MicOffIcon />
                                        </Tooltip>
                                        :
                                        <Tooltip placement="top" title="Turn off mic">
                                            <MicIcon />
                                        </Tooltip>}
                                </IconButton>
                        }
                        <Tooltip placement="top" title="End the call">
                            <IconButton style={{ backgroundColor: 'red', border: 'red' }} onClick={handleEndCall} >
                                <CallEndIcon />
                            </IconButton>
                        </Tooltip>

                    </div>
                </>
                :
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '36px',
                    height: '100%'
                }}>
                    Room call end.
                    <Button variant="contained" onClick={handleEndCall}>Close</Button>
                </div>
            }
        </div>
    )
}
