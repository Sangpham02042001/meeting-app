import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom'
import { getParticipant } from '../../store/reducers/conversation.reducer';
import { socketClient, baseURL, getConnectedDevices } from '../../utils';
import { Tooltip, IconButton, Avatar, Button, CircularProgress } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import Peer from 'simple-peer';
import './style.css';


export default function RoomCall() {
    const dispatch = useDispatch();
    const query = new URLSearchParams(useLocation().search);
    const { participantId } = useParams();
    const user = useSelector(state => state.userReducer.user);
    const participant = useSelector(state => state.conversationReducer.conversation.participant);


    const [roomCallActive, setRoomCallActive] = useState(true);
    const [isAccepted, setIsAccepted] = useState(false);
    const [peer, setPeer] = useState(null);
    const [shareScreenPeer, setShareScreenPeer] = useState(null)
    const [setupDevice, setSetupDevice] = useState(false);
    const [isEnableVideo, setIsEnableVideo] = useState(false);
    const [isEnableAudio, setIsEnableAudio] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(query.get('type') == 'video' || false);
    const [isAudioActive, setIsAudioActive] = useState(true);
    const [isShareActive, setIsShareActive] = useState(false);
    const [isPartShare, setIsPartShare] = useState(false);
    const [isPartAudio, setIsPartAudio] = useState(true);
    const [isPartVideo, setIsPartVideo] = useState(false);
    const [conversationId] = useState(query.get('cvId'));


    const isAcceptedRef = useRef(false);
    const peerRef = useRef(null);
    const myStreamRef = useRef(null);
    const partStreamRef = useRef(null);
    const myShareScreenRef = useRef(null);
    const partShareScreenRef = useRef(null);
    const peerScreenRef = useRef(null);
    const isAudioRef = useRef(false);
    const isVideoRef = useRef(false);

    // ~15s
    const TIME_END = 30000;

    const createPeer = ({ conversationId, userId, partId, stream }) => {
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
                conversationId, senderId: userId, receiverId: partId, signal,
                isAudio: isAudioRef.current, isVideo: isVideoRef.current
            })
        })
        return peer;
    }


    const addPeer = ({ conversationId, incomingSignal, userId, partId, stream }) => {
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
                conversationId, senderId: userId, receiverId: partId, signal,
                isAudio: isAudioRef.current, isVideo: isVideoRef.current
            })
        })
        peer.signal(incomingSignal);
        return peer;
    }

    useEffect(() => {
        dispatch(getParticipant({ participantId }));
        getConnectedDevices('videoinput', (cameras) => {
            if (cameras.length) {
                isVideoRef.current = true;
                setIsEnableVideo(true);
            }
        })

        getConnectedDevices('audioinput', (audios) => {
            if (audios.length) {
                isAudioRef.current = true;
                setIsEnableAudio(true);
            }
            setSetupDevice(true);
        })

        socketClient.emit('set-room-id', { conversationId });

        let timeout = setTimeout(() => {
            console.log(isAcceptedRef.current)
            if (!isAcceptedRef.current) {
                handleEndCall();
            }
        }, TIME_END)

        return () => {
            clearTimeout(timeout);
        }

    }, [])

    useEffect(() => {
        if (setupDevice && roomCallActive) {
            console.log(isEnableAudio, isEnableVideo)
            if (!isEnableVideo && !isEnableAudio) {

                socketClient.on('conversation-accepted-call', ({ conversationId, senderId, receiverId }) => {
                    let peer = createPeer({ conversationId, userId: receiverId, partId: senderId, stream: false })
                    peerRef.current = peer;
                    setPeer(peer);

                })

                socketClient.on('conversation-sent-signal', ({ conversationId, senderId, receiverId, signal, isVideo, isAudio }) => {
                    let peer = addPeer({ conversationId, incomingSignal: signal, userId: senderId, partId: receiverId, stream: false })
                    peerRef.current = peer;
                    setPeer(peer);
                    setIsAccepted(true);
                    isAcceptedRef.current = true;
                    setIsPartAudio(isAudio);
                    if (query.get('type') == 'video') {
                        setIsPartVideo(isVideo);
                    }
                })

            } else {
                navigator.mediaDevices.getUserMedia({ video: isEnableVideo, audio: isEnableAudio })
                    .then(stream => {

                        myStreamRef.current.srcObject = stream;
                        myStreamRef.current.srcObject.getVideoTracks().forEach(track => {
                            track.enabled = isVideoActive;
                        })

                        socketClient.on('conversation-accepted-call', ({ conversationId, senderId, receiverId }) => {
                            let peer = createPeer({ conversationId, userId: receiverId, partId: senderId, stream })
                            peerRef.current = peer;
                            setPeer(peer);
                        })


                        socketClient.on('conversation-sent-signal', ({ conversationId, senderId, receiverId, signal, isVideo, isAudio }) => {
                            let peer = addPeer({ conversationId, incomingSignal: signal, userId: receiverId, partId: senderId, stream })
                            peerRef.current = peer;
                            setPeer(peer);
                            setIsAccepted(true);
                            isAcceptedRef.current = true;
                            setIsPartAudio(isAudio);
                            if (query.get('type') == 'video') {
                                setIsPartVideo(isVideo);
                            }
                        })
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }

            socketClient.on('conversation-returning-signal', ({ signal, isVideo, isAudio }) => {
                if (peerRef.current) {
                    peerRef.current.signal(signal);
                }
                setIsAccepted(true);
                isAcceptedRef.current = true;
                setIsPartAudio(isAudio);
                if (query.get('type') == 'video') {
                    setIsPartVideo(isVideo);
                }
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
                socketClient.disconnect();
            })

            socketClient.on('started-share-screen', ({ signal }) => {
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
                    stream: false,
                })

                peer.on("signal", signal => {
                    socketClient.emit("screen-return-signal", { signal })
                })
                peer.signal(signal);
                setShareScreenPeer(peer);
                peerScreenRef.current = peer;
                setIsPartShare(true);
            })

            socketClient.on('init-share-screen', () => {
                setIsPartShare(true);
            })

            socketClient.on('screen-returning-signal', ({ signal }) => {
                if (peerScreenRef.current) {
                    peerScreenRef.current.signal(signal);
                }
            })

            socketClient.on('stopped-share-screen', () => {
                if (peerScreenRef.current) {
                    peerScreenRef.current.destroy();
                    handleCloseSharing();
                }

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

    useEffect(() => {
        if (shareScreenPeer) {
            shareScreenPeer.on('stream', stream => {

                stream.getVideoTracks()[0].onended = function () {
                    if (peerScreenRef.current) {
                        handleCloseSharing();
                    }
                };

                partShareScreenRef.current.srcObject = stream;
            })
        }
    }, [shareScreenPeer])

    const handleCloseSharing = () => {
        socketClient.emit('stop-share-screen');
        setShareScreenPeer(null);
        peerScreenRef.current = null;
        setIsPartShare(false);
        setIsShareActive(false);
    }


    const handleEndCall = () => {
        window.open("", "_self").close();
    }

    const toggleAudio = (event) => {
        event.preventDefault();
        console.log(isAudioActive)

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

    const toggleShare = (event) => {
        event.preventDefault();
        if (!isShareActive) {
            setIsShareActive(true);
            navigator.mediaDevices.getDisplayMedia()
                .then(stream => {
                    stream.getVideoTracks()[0].onended = function () {
                        console.log('ended');
                        if (peerScreenRef.current) {
                            handleCloseSharing();
                        }
                    };

                    myShareScreenRef.current.srcObject = stream;
                    socketClient.emit('init-share-screen');
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
                        socketClient.emit("start-share-screen", { signal })
                    })
                    peerScreenRef.current = peer;
                    setShareScreenPeer(peer);
                }).catch(error => {
                    console.log(error);
                    setIsShareActive(false);
                })
        } else {
            handleCloseSharing();
        }

    }

    return (
        <div className="room-call">
            {roomCallActive ?
                <>
                    {!isAccepted && <audio src="ring.mp3" type="audio/mpeg" autoPlay loop />}
                    <div className="video-content">
                        <div className="video-content-user">
                            <div className="user-video" >
                                {(!isVideoActive || !isEnableVideo) &&
                                    <div className="video-avatar">
                                        <Avatar
                                            src={`${baseURL}/api/user/avatar/${user.id}`}
                                            alt={user.firstName} />
                                    </div>
                                }
                                <div className="video-bottom">
                                    <div className="video-name">
                                        You
                                    </div>
                                    <span style={{ color: '#fff' }}> {isAudioActive ? <MicIcon /> : <MicOffIcon />}</span>
                                </div>
                                <video width="100%" height="100%" ref={myStreamRef} autoPlay muted />
                            </div>
                        </div>
                        <div className="video-content-part">
                            <div className={(isPartShare || isShareActive) ? 'part-video-share' : 'part-video'}>
                                {participant &&
                                    <>
                                        {!isPartVideo &&
                                            <div className="video-avatar">
                                                < Avatar
                                                    src={`${baseURL}/api/user/avatar/${participant.id}`}
                                                    alt={participant.firstName} />
                                            </div>
                                        }
                                        {!isAccepted &&
                                            <div className="waiting-join">
                                                Waiting {participant.userName} to join...
                                                <CircularProgress sx={{ color: '#fff' }} />
                                            </div>
                                        }


                                        <div className="video-bottom">
                                            <div className="video-name">
                                                {participant.userName}
                                            </div>
                                            <span style={{ color: '#fff' }}> {isPartAudio ? <MicIcon /> : <MicOffIcon />}</span>
                                        </div>
                                        {peer &&
                                            <video width="100%" height="100%" ref={partStreamRef} autoPlay />
                                        }
                                    </>
                                }
                            </div>
                            {(isPartShare || isShareActive) &&
                                <div className="part-video">
                                    {!shareScreenPeer && <>
                                        <div className="video-avatar">
                                            < Avatar
                                                src={`${baseURL}/api/user/avatar/${participant.id}`}
                                                alt={participant.firstName} />
                                        </div>
                                        <div className="waiting-join">
                                            Waiting to share screen...
                                            <CircularProgress sx={{ color: '#fff' }} />
                                        </div>
                                    </>
                                    }
                                    <div className="video-bottom">
                                        <div className="video-name">
                                            {isShareActive ? 'You' : participant.userName}
                                        </div>
                                        <span style={{ color: '#fff' }}> {isPartAudio ? <MicIcon /> : <MicOffIcon />}</span>
                                    </div>
                                    <video width="100%" height="100%"
                                        style={{ opacity: isShareActive ? 1 : 0 }}
                                        ref={myShareScreenRef}
                                        autoPlay muted />
                                    <video width="100%" height="100%"
                                        style={{ opacity: isPartShare ? 1 : 0 }}
                                        ref={partShareScreenRef}
                                        autoPlay muted />
                                </div>
                            }
                        </div>
                    </div>
                    <div className="room-btn">
                        {isAccepted &&
                            <>
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
                                        <Tooltip placement="top" title={isVideoActive ? "Turn off camera" : "Turn on camera"}>
                                            <div>
                                                <IconButton onClick={toggleVideo} >
                                                    {!isVideoActive ?
                                                        <i className="fas fa-video-slash"></i>
                                                        :
                                                        <i className="fas fa-video"></i>
                                                    }
                                                </IconButton>
                                            </div>
                                        </Tooltip>
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
                                        <Tooltip placement="top" title={isVideoActive ? "Turn off mic" : "Turn on mic"}>
                                            <div>
                                                <IconButton onClick={toggleAudio} >
                                                    {!isAudioActive ?
                                                        <MicOffIcon />
                                                        :
                                                        <MicIcon />
                                                    }
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                }
                                {
                                    (isPartShare) ?
                                        <Tooltip placement="top" title='User has been sharing' >
                                            <div>
                                                <IconButton disabled>
                                                    <ScreenShareIcon />
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                        :
                                        <Tooltip placement="top" title={isShareActive ? "Stop share screen" : "Start share screen"}>
                                            <div>
                                                <IconButton onClick={toggleShare} >
                                                    {!isShareActive ?
                                                        <ScreenShareIcon />
                                                        :
                                                        <CancelPresentationIcon />
                                                    }
                                                </IconButton>
                                            </div>
                                        </Tooltip>

                                }

                            </>

                        }
                        <Tooltip placement="top" title="End the call">
                            <IconButton style={{ backgroundColor: 'red', border: 'red', width: '70px', borderRadius: '20px' }} onClick={handleEndCall} >
                                <CallEndIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </>
                :
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '36px',
                    height: '100%'
                }}>
                    User ended the call
                    <Button variant="contained" onClick={handleEndCall}>Close</Button>
                </div>
            }
        </div >
    )
}
