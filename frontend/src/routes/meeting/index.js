import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { broadcastLocal, socketClient } from "../../utils";
import './meeting.css';
import { Row, Col, Button } from "react-bootstrap";
import Video from "../../components/MeetingVideo";
import MeetingChatBox from "../../components/MeetingChatBox";
import MeetingUserList from "../../components/MeetingUserList";
import { isAuthenticated } from '../../store/reducers/user.reducer';
import {
    getTeamMessages,
    getTeamInfo,
} from '../../store/reducers/team.reducer'
import { getMeetingMessages } from '../../store/reducers/meeting.reducer'
import Janus from '../../janus'
import { janusServer } from '../../utils'

function useQuery() {
    return new URLSearchParams(useLocation().search);
}


const Meeting = (props) => {
    let query = useQuery()
    const history = useHistory()
    const { teamId, meetingId } = useParams()
    const dispatch = useDispatch()
    const userReducer = useSelector(state => state.userReducer)
    const teamReducer = useSelector(state => state.teamReducer)
    const meetingReducer = useSelector(state => state.meetingReducer)
    const [isVideoActive, setIsVideoActive] = useState(query.get('video') == 'true' || false);
    const [isAudioActive, setIsAudioActive] = useState(query.get('audio') == 'true' || false);
    const [isEnableVideo, setIsEnableVideo] = useState(false);
    const [isEnableAudio, setIsEnableAudio] = useState(false);
    const [isMeetingEnd, setIsMeetingEnd] = useState(false);
    const myVideo = useRef();
    //******************janus************
    let janus = null;
    const opaqueId = "videoroomtest-" + Janus.randomString(12)
    let sfutest = null;

    // const meetingId = props.match.params.meetingId;

    function getConnectedDevices(type, callback) {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const filtered = devices.filter(device => device.kind === type);
                callback(filtered);
            });
    }

    function publishOwnFeed(useAudio) {
        // Publish our stream
        sfutest.createOffer(
            {
                // Add data:true here if you want to publish datachannels as well
                media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },	// Publishers are sendonly
                // If you want to test simulcasting (Chrome and Firefox only), then
                // pass a ?simulcast=true when opening this demo page: it will turn
                // the following 'simulcast' property to pass to janus.js to true
                // simulcast: doSimulcast,
                // simulcast2: doSimulcast2,
                success: function (jsep) {
                    Janus.debug("Got publisher SDP!", jsep);
                    const publish = { request: "configure", audio: useAudio, video: true };

                    // You can force a specific codec to use when publishing by using the
                    // audiocodec and videocodec properties, for instance:
                    // 		publish["audiocodec"] = "opus"
                    // to force Opus as the audio codec to use, or:
                    // 		publish["videocodec"] = "vp9"
                    // to force VP9 as the videocodec to use. In both case, though, forcing
                    // a codec will only work if: (1) the codec is actually in the SDP (and
                    // so the browser supports it), and (2) the codec is in the list of
                    // allowed codecs in a room. With respect to the point (2) above,
                    // refer to the text in janus.plugin.videoroom.jcfg for more details.
                    // We allow people to specify a codec via query string, for demo purposes

                    // if (acodec)
                    //     publish["audiocodec"] = acodec;
                    // if (vcodec)
                    //     publish["videocodec"] = vcodec;
                    sfutest.send({ message: publish, jsep: jsep });
                },
                error: function (error) {
                    Janus.error("WebRTC error:", error);
                    if (useAudio) {
                        publishOwnFeed(false);
                    } else {
                        bootbox.alert("WebRTC error... " + error.message);
                        $('#publish').removeAttr('disabled').click(function () { publishOwnFeed(true); });
                    }
                }
            });
    }

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        }
        dispatch(getTeamInfo({ teamId }))

        socketClient.emit("join-meeting", { teamId, meetingId, userId: userReducer.user.id })

        getConnectedDevices('videoinput', (cameras) => {
            if (cameras.length) setIsEnableVideo(true);
        })

        getConnectedDevices('audioinput', (audios) => {
            if (audios.length) setIsEnableAudio(true);
        })

        // window.addEventListener('beforeunload', (ev) => {
        //     ev.preventDefault();
        //     console.log(meetingId, userReducer.user.id)
        //     socketClient.connect()
        //     //disconnect: true
        //     socketClient.emit('out-meeting', {
        //         userId: userReducer.user.id,
        //         meetingId
        //     })
        //     // socketClient.disconnect()
        //     return ev.returnValue = 'Are you sure you want to close?';
        // })

        Janus.init({
            debug: 'all', callback: () => {
                janus = new Janus({
                    server: janusServer,
                    iceServers: [{
                        url: 'turn:numb.viagenie.ca',
                        credential: 'muazkh',
                        username: 'webrtc@live.com'
                    },],
                    success: function () {
                        janus.attach({
                            plugin: "janus.plugin.videoroom",
                            opaqueId,
                            success: (pluginHandle) => {
                                console.log('attach success')
                                sfutest = pluginHandle
                                const register = {
                                    request: "join",
                                    room: 1234,
                                    ptype: "publisher",
                                    display: "Sang"
                                };
                                sfutest.send({ message: register });
                            },
                            iceState: function (state) {
                                console.log("ICE state changed to " + state);
                            },
                            mediaState: function (medium, on) {
                                console.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                            },
                            onmessage: (msg, jsep) => {
                                const event = msg["videoroom"];
                                if (event) {
                                    if (event === 'joined') {
                                        publishOwnFeed(true);
                                    }
                                }
                            },
                            onlocalstream: (stream) => {
                                Janus.attachMediaStream(myVideo.current, stream)
                            },
                            error: (error) => {
                                console.log(error)
                            }
                        })
                    }
                })
            }
        })

        window.addEventListener('beforeunload', function (e) {
            e.preventDefault()
            broadcastLocal.postMessage('own-out-meeting')
        });

        return () => {
            setIsEnableAudio(false);
            setIsEnableVideo(false);
        }
    }, []);

    useEffect(() => {
        if (teamReducer.teamLoaded) {
            dispatch(getMeetingMessages({
                meetingId,
            }))

            let members = teamReducer.team.members
            if (localStorage.getItem('user')) {
                let userId = JSON.parse(localStorage.getItem('user')).id
                let member = members.find(member => member.id === userId)
                if (!member) {
                    history.push('/notfound')
                }
            } else {
                history.push('/notfound')
            }

            let meetings = teamReducer.team.meetings
            let meeting = meetings.find(meeting => meeting.id == meetingId)
            if (!meeting) {
                history.push(`/notfound`)
            }
            if (!meeting.active) {
                setIsMeetingEnd(true)
            }
            if (meeting.active) {
                // (isEnableVideo || isEnableAudio) && navigator.mediaDevices.getUserMedia({ video: isEnableVideo, audio: isEnableAudio })
                //     .then(stream => {
                //         myVideo.current.srcObject = stream;
                //     })
                //     .catch(error => {
                //         console.error('Error accessing media devices.', error);
                //     })
                //     .finally(() => {
                //         if (isEnableVideo && !isVideoActive) {
                //             myVideo.current && myVideo.current.srcObject.getVideoTracks().forEach(track => {
                //                 track.enabled = false
                //             })
                //         }
                //         if (isEnableAudio && !isAudioActive) {
                //             myVideo.current && myVideo.current.srcObject.getAudioTracks().forEach(track => {
                //                 track.enabled = false
                //             })
                //         }
                //     })
            }
        }
    }, [teamReducer.teamLoaded])


    const handleActiveVideo = () => {
        myVideo.current.srcObject.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled
        })

        setIsVideoActive(!isVideoActive);
    }

    const handleActiveAudio = () => {
        myVideo.current.srcObject.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        let checkAudioActive = myVideo.current.srcObject.getAudioTracks()[0].enabled;
        console.log(checkAudioActive);
        // myVideo.current.srcObject.getAudioTracks()[0].enabled = !checkAudioActive;

        setIsAudioActive(!isAudioActive);
    }

    const handleVisibleChat = () => {
        if (isOpenUsers) {
            setIsOpenUsers(false);
        }

        if (isOpenInfo) {
            setIsOpenInfo(false);
        }
        setIsOpenChat(!isOpenChat);
    }

    const handleVisibleUsers = () => {
        if (isOpenChat) {
            setIsOpenChat(false);
        }

        if (isOpenInfo) {
            setIsOpenInfo(false);
        }
        setIsOpenUsers(!isOpenUsers);
    }

    const handleVisibleInfo = () => {
        if (isOpenUsers) {
            setIsOpenUsers(false);
        }

        if (isOpenChat) {
            setIsOpenChat(false);
        }
        setIsOpenInfo(!isOpenInfo);
    }

    const handleEndMeeting = () => {
        console.log(myVideo.current.srcObject)
        myVideo.current.srcObject.getTracks().forEach((track) => {
            console.log(track)
            track.stop();
        });
        socketClient.emit('disconnect-meeting');
        window.open("", "_self").close();
    }

    const [isOpenInfo, setIsOpenInfo] = useState(false);

    const [isOpenUsers, setIsOpenUsers] = useState(false);

    const [isOpenChat, setIsOpenChat] = useState(false);


    return (
        !isMeetingEnd ? <div className="room-meeting">
            <div className="room-content">
                <div className="users-content">
                    <div className="user-frame">
                        <video width="100%" height="100%" ref={myVideo} muted autoPlay />
                        {/* {!isVideoActive && <div style={{ width: "320px", height: "320px", color: "white", border: "2px solid white", textAlign: "center" }}>{socketClient.id}</div>} */}
                    </div>

                </div>
                {isOpenChat && <MeetingChatBox chatVisible={handleVisibleChat} />}

                {isOpenUsers && <MeetingUserList usersVisible={handleVisibleUsers} members={meetingReducer.meeting.members} />}

                {isOpenInfo &&
                    <Col className="meeting-chatbox" md="4">
                        <div className="chatbox-header">
                            Info
                            <span>
                                <Button variant="outline-light" onClick={handleVisibleInfo}>
                                    <i style={{ color: "black" }} className="fas fa-times"></i>
                                </Button>
                            </span>
                        </div>
                        <div className="chatbox-content">

                        </div>
                    </Col>
                }

            </div>
            <Row className="btn-list">
                <Col md={{ span: 3, offset: 5 }} >
                    {
                        !isEnableVideo ?
                            <Button variant="outline-light" onClick={handleActiveVideo}
                                disabled={!isEnableVideo}
                            >
                                <i className="fas fa-video-slash"></i>
                            </Button>
                            :
                            <Button variant="outline-light" onClick={handleActiveVideo}>
                                {!isVideoActive ? <i className="fas fa-video-slash"></i> : <i className="fas fa-video"></i>}
                            </Button>
                    }

                    {
                        !isEnableAudio ?
                            <Button variant="outline-light" disabled={!isEnableAudio} onClick={handleActiveAudio}>
                                <i className="fas fa-microphone-slash"></i>
                            </Button>
                            :
                            <Button variant="outline-light" onClick={handleActiveAudio}>
                                {!isAudioActive ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                            </Button>
                    }

                    <Button variant="danger" onClick={handleEndMeeting}>
                        {/* <Link to="/"><i style={{ color: "white" }} className="fas fa-phone" ></i></Link> */}
                        <i style={{ color: "white" }} className="fas fa-phone" ></i>
                    </Button>
                </Col>

                <Col md={{ span: 2, offset: 2 }} >
                    <Button variant="outline-light" onClick={handleVisibleInfo} >
                        {isOpenInfo ? <i className="fas fa-question-circle"></i> : <i className="far fa-question-circle"></i>}
                    </Button>

                    <Button variant="outline-light" onClick={handleVisibleUsers} >

                        {isOpenUsers ? <i className="fas fa-user"></i> : <i className="far fa-user"></i>}
                    </Button>

                    <Button variant="outline-light" onClick={handleVisibleChat}>
                        {isOpenChat ? <i className="fas fa-comment-dots"></i> : <i className="far fa-comment-dots"></i>}
                    </Button>
                </Col>
            </Row>
        </div> : <div style={{
            background: "#202124",
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            top: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <h1 style={{ color: '#fff' }}>Meeting has already ended</h1>
            <div>
                <Button variant="primary" onClick={e => {
                    e.preventDefault()
                    window.open("", "_self").close();
                }}>
                    Close
                </Button>
            </div>
        </div>
    );
};

export default Meeting;