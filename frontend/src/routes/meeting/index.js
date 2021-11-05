import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { broadcastLocal, socketClient } from "../../utils";
import './meeting.css';
import { Avatar, Button, Grid, IconButton } from '@mui/material';
import { deepOrange, deepPurple } from '@mui/material/colors';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import MessageIcon from '@mui/icons-material/Message';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
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
    // const classes = useStyles();
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
    let myId = null;
    let mypvtId = null;
    const opaqueId = "videoroomtest-" + Janus.randomString(12)
    // const [sfuRef, setSfutest] = useState(null);
    const sfuRef = useRef()

    // const meetingId = props.match.params.meetingId;

    function getConnectedDevices(type, callback) {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const filtered = devices.filter(device => device.kind === type);
                callback(filtered);
            });
    }

    const publishOwnFeed = (useAudio) => {
        sfuRef.current && sfuRef.current.createOffer(
            {
                media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },
                // simulcast: doSimulcast,
                // simulcast2: doSimulcast2,
                success: function (jsep) {
                    Janus.debug("Got publisher SDP!", jsep);
                    const publish = { request: "configure", audio: useAudio, video: true };

                    // if (acodec)
                    //     publish["audiocodec"] = acodec;
                    // if (vcodec)
                    //     publish["videocodec"] = vcodec;
                    sfuRef.current.send({ message: publish, jsep: jsep });
                },
                error: function (error) {
                    Janus.error("WebRTC error:", error);
                    console.log(error)
                    if (useAudio) {
                        publishOwnFeed(false);
                    } else {
                        alert('WebRTC Error')
                        // $('#publish').removeAttr('disabled').click(function () { publishOwnFeed(true); });
                    }
                }
            });
    }

    const newRemoteFeed = (id, display, audio, video) => {
        let remoteFeed = null;
        janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: opaqueId,
            success: function (pluginHandle) {
                remoteFeed = pluginHandle;
                remoteFeed.simulcastStarted = false;
                Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
                Janus.log("  -- This is a subscriber");
                let subscribe = {
                    request: "join",
                    room: myroom,
                    ptype: "subscriber",
                    feed: id,
                    private_id: mypvtId
                };
                remoteFeed.videoCodec = video;
                remoteFeed.send({ message: subscribe });
            },
            error: function (error) {
                Janus.error("  -- Error attaching plugin...", error);
                alert("Error attaching plugin... " + error);
            },
            onmessage: function (msg, jsep) {
                let event = msg["videoroom"];
                if (msg["error"]) {
                    alert(msg["error"]);
                } else if (event) {
                    if (event === "attached") {
                        console.log(msg)
                    } else if (event === "event") {
                        console.log(msg)
                    }
                }
            }
        })
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
                                sfuRef.current = pluginHandle;
                                const register = {
                                    request: "join",
                                    room: Number(teamId),
                                    ptype: "publisher",
                                    display: userReducer.user.firstName
                                };
                                sfuRef.current.send({ message: register });

                            },
                            iceState: function (state) {
                                console.log("ICE state changed to " + state);
                            },
                            mediaState: function (medium, on) {
                                console.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                            },
                            webrtcState: function (on) {
                                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                                if (!on) {
                                    console.log('no on')
                                    return;
                                }
                            },
                            onmessage: (msg, jsep) => {
                                console.log(jsep)
                                const event = msg["videoroom"];
                                if (event) {
                                    if (event === 'joined') {

                                        myId = msg["id"];
                                        mypvtId = msg["private_id"];
                                        publishOwnFeed(true);

                                        if (msg["publishers"]) {
                                            var list = msg["publishers"];
                                            Janus.debug("Got a list of available publishers/feeds:", list);
                                            for (var f in list) {
                                                var id = list[f]["id"];
                                                var display = list[f]["display"];
                                                var audio = list[f]["audio_codec"];
                                                var video = list[f]["video_codec"];
                                                Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                                newRemoteFeed(id, display, audio, video);
                                            }
                                        }
                                    }
                                }

                                if (jsep) {
                                    Janus.debug("Handling SDP as well...", jsep);
                                    sfuRef.current.handleRemoteJsep({ jsep: jsep });
                                    // Check if any of the media we wanted to publish has
                                    // been rejected (e.g., wrong or unsupported codec)
                                    // var audio = msg["audio_codec"];
                                    // if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                                    //     // Audio has been rejected
                                    //     toastr.warning("Our audio stream has been rejected, viewers won't hear us");
                                    // }
                                    // var video = msg["video_codec"];
                                    // if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                                    //     // Video has been rejected
                                    //     toastr.warning("Our video stream has been rejected, viewers won't see us");
                                    //     // Hide the webcam video
                                    //     $('#myvideo').hide();
                                    //     $('#videolocal').append(
                                    //         '<div class="no-video-container">' +
                                    //         '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                                    //         '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                                    //         '</div>');
                                    // }
                                }
                            },
                            onlocalstream: (stream) => {
                                Janus.attachMediaStream(myVideo.current, stream);
                                let videoTracks = stream.getVideoTracks();

                                if (sfuRef.current.webrtcStuff.pc.iceConnectionState !== "completed" &&
                                    sfuRef.current.webrtcStuff.pc.iceConnectionState !== "connected") {
                                    alert("publishing...")
                                }
                                if (!videoTracks || videoTracks.length === 0) {
                                    // No webcam
                                    alert("no webcam")
                                    myVideo.current = null;
                                    setIsEnableVideo(false)
                                } else {
                                    if (!isVideoActive) {
                                        sfuRef.current.muteVideo();
                                    }
                                }
                            },
                            error: (error) => {
                                console.log(error)
                            },
                            destroyed: function () {
                                window.location.reload();
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
        }
    }, [teamReducer.teamLoaded])

    const toggleAudio = () => {
        let muted = sfuRef.current.isAudioMuted();
        Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
        if (muted)
            sfuRef.current.unmuteAudio();
        else
            sfuRef.current.muteAudio();
        muted = sfuRef.current.isAudioMuted();
        setIsAudioActive(!isAudioActive);
    }

    const toggleVideo = () => {
        let muted = sfuRef.current.isVideoMuted();
        Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
        if (muted) {
            sfuRef.current.unmuteVideo();
        } else {
            sfuRef.current.muteVideo();
        }
        muted = sfuRef.current.isVideoMuted();
        setIsVideoActive(!isVideoActive);
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
        // console.log(myVideo.current.srcObject)
        // myVideo.current.srcObject.getTracks().forEach((track) => {
        //     console.log(track)
        //     track.stop();
        // });
        // socketClient.emit('disconnect-meeting');
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
                        {sfuRef.current && (!isVideoActive && <Avatar
                            sx={{
                                bgcolor: deepOrange[500], position: 'absolute',
                                top: '70px', left: '70px',
                                width: 130, height: 130
                            }}>
                            {userReducer.user.firstName[0]}
                        </Avatar>)}
                    </div>

                </div>
                {isOpenChat && <MeetingChatBox chatVisible={handleVisibleChat} />}

                {isOpenUsers && <MeetingUserList usersVisible={handleVisibleUsers} members={meetingReducer.meeting.members} />}

            </div>
            <Grid container className="btn-list">
                <div style={{ flex: '4', textAlign: 'center' }} >
                    {
                        !isEnableVideo ?
                            <IconButton >
                                <i  className="fas fa-video-slash"></i>
                            </IconButton>
                            :
                            <IconButton  onClick={toggleVideo} >
                                {!isVideoActive ? <i className="fas fa-video-slash"></i> : <i className="fas fa-video"></i>}
                            </IconButton> 
                    }

                    {
                        !isEnableAudio ?
                            <IconButton>
                                <MicOffIcon />
                            </IconButton>
                            :
                            <IconButton onClick={toggleAudio} aria-label="upload picture" >
                                {!isAudioActive ? <MicOffIcon /> : <MicIcon />}
                            </IconButton>
                    }

                    <IconButton style={{backgroundColor: 'red', border: 'red'}} onClick={handleEndMeeting} >
                        <CallEndIcon />
                    </IconButton>
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <IconButton onClick={handleVisibleInfo} >
                        {isOpenInfo ? <i  className="fas fa-question-circle"></i>
                            : <i  className="far fa-question-circle"></i>}
                    </IconButton>

                    <IconButton onClick={handleVisibleUsers} >
                        {isOpenUsers ? <i  className="fas fa-user"></i> :
                            <i className="far fa-user"></i>}
                    </IconButton>

                    <IconButton onClick={handleVisibleChat}>
                        {isOpenChat ? <i className="fas fa-comment-dots"></i> :
                            <i className="far fa-comment-dots"></i>}
                    </IconButton>
                </div>
            </Grid>
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