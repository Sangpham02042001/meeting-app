import React, { createRef, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { broadcastLocal, socketClient } from "../../utils";
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
import Video from "../../components/MeetingVideo";
import Avatar from '../../components/Avatar'

// ***React Material***
import './meeting.css';
import { Button, IconButton, Tooltip, Paper, styled, Badge } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InfoIcon from '@mui/icons-material/Info';
import ChatIcon from '@mui/icons-material/Chat';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';


function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const Meeting = (props) => {
    let query = useQuery()
    const history = useHistory()
    const { teamId } = useParams()
    const dispatch = useDispatch()
    const userReducer = useSelector(state => state.userReducer)
    const teamReducer = useSelector(state => state.teamReducer)
    const meetingReducer = useSelector(state => state.meetingReducer)
    const [isOpenInfo, setIsOpenInfo] = useState(false);
    const [isOpenUsers, setIsOpenUsers] = useState(false);
    const [isOpenChat, setIsOpenChat] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(query.get('video') == 'true' || false);
    const [isAudioActive, setIsAudioActive] = useState(query.get('audio') == 'true' || false);
    const [isEnableVideo, setIsEnableVideo] = useState(false);
    const [isEnableAudio, setIsEnableAudio] = useState(false);
    const [isMeetingEnd, setIsMeetingEnd] = useState(false);

    //******************janus************
    let janus = null;
    let myId = null;
    let mypvtId = null;
    const opaqueId = "videoroomtest-" + Janus.randomString(12)
    const myVideo = useRef();
    const myStream = useRef();
    const sfuRef = useRef()
    const feedRefs = useRef([])
    const remoteRefs = useRef([])

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
                    room: Number(teamId),
                    ptype: "subscriber",
                    feed: id,
                    private_id: mypvtId
                };
                remoteFeed.videoCodec = video;
                remoteFeed.send({ message: subscribe });
            },
            error: function (error) {
                Janus.error("  -- Error attaching plugin...", error);
                alert("Error attaching plugin... " + error.message);
            },
            iceState: function (state) {
                console.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
            },
            webrtcState: function (on) {
                console.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
            },
            onmessage: function (msg, jsep) {
                let event = msg["videoroom"];
                if (msg["error"]) {
                    alert(msg["error"]);
                } else if (event) {
                    if (event === "attached") {
                        console.log(msg)
                        for (var i = 1; i < 6; i++) {
                            if (!feedRefs.current[i]) {
                                feedRefs.current[i] = remoteFeed;
                                remoteFeed.rfindex = i;
                                break;
                            }
                        }
                        remoteFeed.rfid = msg["id"];
                        remoteFeed.rfdisplay = msg["display"];
                        console.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
                    } else if (event === "event") {
                        console.log(msg)
                    }
                }
                if (jsep) {
                    console.log('jsep answer ')
                    Janus.debug("Handling SDP as well...", jsep);
                    var stereo = (jsep.sdp.indexOf("stereo=1") !== -1);
                    // Answer and attach
                    remoteFeed.createAnswer(
                        {
                            jsep: jsep,
                            // Add data:true here if you want to subscribe to datachannels as well
                            // (obviously only works if the publisher offered them in the first place)
                            media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                            customizeSdp: function (jsep) {
                                if (stereo && jsep.sdp.indexOf("stereo=1") == -1) {
                                    // Make sure that our offer contains stereo too
                                    jsep.sdp = jsep.sdp.replace("useinbandfec=1", "useinbandfec=1;stereo=1");
                                }
                            },
                            success: function (jsep) {
                                Janus.debug("Got SDP!", jsep);
                                var body = { request: "start", room: Number(teamId) };
                                remoteFeed.send({ message: body, jsep: jsep });
                            },
                            error: function (error) {
                                Janus.error("WebRTC error:", error);
                                alert("WebRTC error... " + error.message);
                            }
                        });
                }
            },
            onremotestream: stream => {
                let remote = createRef();
                Janus.attachMediaStream(remote.current, stream);
                remoteRefs.current[remoteFeed.rfindex] = remote;
                console.log(`new feed refs ${remoteRefs.current}`)
                var videoTracks = stream.getVideoTracks();
                if (!videoTracks || videoTracks.length === 0) {
                    remoteRefs.current[remoteFeed.rfindex].current = null;
                }
            }
        })
    }

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        }
        dispatch(getTeamInfo({ teamId }))

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
                                Janus.log("ICE state changed to " + state);
                            },
                            mediaState: function (medium, on) {
                                Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                            },
                            webrtcState: function (on) {
                                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                                if (!on) {
                                    console.log('no on')
                                    return;
                                }
                            },
                            onmessage: (msg, jsep) => {
                                console.log(msg);
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
                                    } else if (event === 'event') {
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
                                        } else if (msg["leaving"]) {
                                            // One of the publishers has gone away?
                                            var leaving = msg["leaving"];
                                            console.log("Publisher left: " + leaving);
                                            // var remoteFeed = null;
                                            // if(remoteFeed != null) {
                                            //     console.log("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                                            //     remoteFeed.detach();
                                            // }
                                        }
                                    }

                                    if (jsep) {
                                        Janus.debug("Handling SDP as well...", jsep);
                                        sfuRef.current.handleRemoteJsep({ jsep: jsep });
                                        // Check if any of the media we wanted to publish has
                                        // been rejected (e.g., wrong or unsupported codec)
                                        var audio = msg["audio_codec"];
                                        if (myStream.current && myStream.current.getAudioTracks() && myStream.current.getAudioTracks().length > 0 && !audio) {
                                            // Audio has been rejected
                                            console.warning("Our audio stream has been rejected, viewers won't hear us");
                                        }
                                        var video = msg["video_codec"];
                                        if (myStream.current && myStream.current.getVideoTracks() && myStream.current.getVideoTracks().length > 0 && !video) {
                                            // Video has been rejected
                                            console.warning("Our video stream has been rejected, viewers won't see us");
                                            // Hide the webcam video
                                            myVideo.current = null;
                                        }
                                    }
                                }
                            },
                            onlocalstream: (stream) => {
                                Janus.attachMediaStream(myVideo.current, stream);
                                myStream.current = stream;
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
            let members = teamReducer.team.members;
            let meetingId = teamReducer.team.meetingActive && teamReducer.team.meetingActive.id;
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
            let meeting = teamReducer.team.meetingActive && meetings.find(meeting => meeting.id == meetingId)
            // if (!meeting) {
            //     history.push(`/notfound`)
            // }
            if (!meeting || !meeting.active) {
                setIsMeetingEnd(true)
            } else {
                dispatch(getMeetingMessages({
                    meetingId
                }))
                socketClient.emit("join-meeting", { teamId, meetingId, userId: userReducer.user.id })
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

    const getTimeInfo = () => {

        return new Date().getHours() + ':' + new Date().getMinutes().toPrecision(2);
    }

    return (
        !isMeetingEnd ? <div className="room-meeting">
            <div className="room-content">
                <div className="video-content">
                    <div className="my-video">
                        <video width="100%" height="100%" ref={myVideo} muted autoPlay />
                        {(!isEnableVideo || !isVideoActive) &&
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '20px', left: '70px',
                                    color: '#fff',
                                    textAlign: 'center',
                                    fontSize: '24px'
                                }}>
                                <Avatar width="180px" height="180px"
                                    userId={userReducer.user.id}
                                    alt={userReducer.user.firstName} />
                                <h3 style={{ marginTop: '15px' }}>You</h3>
                            </div>
                        }

                    </div>
                    {remoteRefs.current.length && remoteRefs.current.map(ref => {
                        return <video width="200px" height="200px" key={ref} ref={ref} autoPlay />
                    })}
                </div>
                {isOpenChat && <MeetingChatBox chatVisible={handleVisibleChat} />}

                {isOpenUsers && <MeetingUserList usersVisible={handleVisibleUsers} members={meetingReducer.meeting.members} />}

            </div>
            <div className="meeting-btn-list" >
                <div style={{
                    width: "30%",
                    color: '#fff',
                    fontSize: "18px",
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <strong>
                        Time: {getTimeInfo()}
                    </strong>
                </div>
                <div className="btn-mid" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '40%'
                }} >
                    {
                        !isEnableVideo ?
                            <Tooltip placement="top" title="No camera found">
                                <div>
                                    <IconButton aria-label="No camera" disabled>
                                        <i className="fas fa-video-slash"></i>
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
                                    <IconButton disabled >
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
                        <IconButton style={{ backgroundColor: 'red', border: 'red' }} onClick={handleEndMeeting} >
                            <CallEndIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <div className="btn-right" style={{
                    flex: '1',
                    textAlign: 'right'
                }}>
                    <Tooltip placement="top" title="Meeting details">
                        <IconButton onClick={handleVisibleInfo} >
                            {isOpenInfo ?
                                <InfoIcon /> : <InfoOutlinedIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip placement="top" title="Show everyone">

                        <IconButton onClick={handleVisibleUsers} >
                            <Badge badgeContent={meetingReducer.meeting.members.length} color="info">
                                {isOpenUsers ? <PeopleAltIcon style={{color: '#fff'}} /> :
                                    <PeopleAltOutlinedIcon style={{color: '#fff'}} />}
                            </Badge>
                        </IconButton>

                    </Tooltip>

                    <Tooltip placement="top" title="Go message">
                        <IconButton onClick={handleVisibleChat}>
                            {isOpenChat ? <ChatIcon /> :
                                <ChatOutlinedIcon />}
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
        </div >
            :
            <div className="room-meeting" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <h1 style={{ color: '#fff' }}>Meeting has already ended</h1>
                <Button color="primary" variant="contained" onClick={e => {
                    e.preventDefault()
                    window.open("", "_self").close();
                }}>
                    Close
                </Button>
            </div>
    );
};

export default Meeting;