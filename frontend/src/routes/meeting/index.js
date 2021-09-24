import React, { useEffect, useRef, useState } from "react";
import { socketClient } from "../../utils";
import Peer from "simple-peer";
import './meeting.css';
import { Container, Row, Col, Button } from "react-bootstrap";
import Video from "../../components/MeetingVideo";
import MeetingChatBox from "../../components/MeetingChatBox";
import MeetingUserList from "../../components/MeetingUserList";



const Meeting = (props) => {
    const [peers, setPeers] = useState([]);
    const [isVideoActive, setIsVideoActive] = useState(true);
    const userVideo = useRef();
    let peersRef = useRef([]);
    const meetingId = props.match.params.meetingId;

    console.log(peers);

    useEffect(() => {
        socketClient.connect();
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketClient.emit("join-meeting", meetingId);
            socketClient.on("all-users", users => {
                console.log(users);
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketClient.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push({
                        peerID: userID,
                        peer,
                    });
                })
                setPeers(peers);
            })

            socketClient.on("joined-meeting", ({ signal, callerID }) => {
                const peer = addPeer(signal, callerID, stream);
                peersRef.current.push({
                    peerID: callerID,
                    peer,
                })
                setPeers(peers => [...peers, {
                    peerID: callerID,
                    peer,
                }]);
            });

            socketClient.on("receiving-returned-signal", ({ signal, callerID, userId }) => {
                const item = peersRef.current.find(p => p.peerID === userId);
                item.peer.signal(signal);
            });



            socketClient.on("disconnected-meeting", userId => {
                console.log('disssconneccctteee')
                const item = peersRef.current.find(p => p.peerID === userId);
                item.peer.destroy()
                console.log(item);
                setPeers(peers => {
                    return peers.filter(p => p.peerID !== userId);
                })
            })
        })
    }, []);

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            //server emit user joined
            socketClient.emit("sending-signal", { signal, callerID, userToSignal })
        })

        return peer;
    }

    const addPeer = (incomingSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketClient.emit("returning-signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    const handleActiveVideo = () => {

        let checkVideoActive = userVideo.current.srcObject.getVideoTracks()[0].enabled;
        userVideo.current.srcObject.getVideoTracks()[0].enabled = !checkVideoActive;

        if (checkVideoActive) {
            setMyVideoStyle(Object.assign({}, myVideoStyle, { display: "none" }))

        } else {
            setMyVideoStyle(Object.assign({}, myVideoStyle, { display: "" }))
        }
        setIsVideoActive(!checkVideoActive);

    }

    const handleActiveAudio = () => {
        let checkAudioActive = userVideo.current.srcObject.getAudioTracks()[0].enabled;
        userVideo.current.srcObject.getAudioTracks()[0].enabled = !checkAudioActive;

        setIsMicroActive(!checkAudioActive);
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
        peers.map(peer => {
            peer.peer.destroy();
        })
        userVideo.current.pause();
        socketClient.emit('disconnect-meeting');
    }

    const [isOpenInfo, setIsOpenInfo] = useState(false);

    const [isOpenUsers, setIsOpenUsers] = useState(false);

    const [isOpenChat, setIsOpenChat] = useState(false);

    const [myVideoStyle, setMyVideoStyle] = useState({
        display: ""
    })
    const [isMicroActive, setIsMicroActive] = useState(true);

    return (
        <div className="room-meeting">
            <div className="room-content">
                <div className="users-content">
                    <div className="user-frame">
                        <video width="100%" height="100%" style={myVideoStyle} muted ref={userVideo} autoPlay />
                        {!isVideoActive && <div style={{ width: "320px", height: "320px", color: "white", border: "2px solid white", textAlign: "center" }}>{socketClient.id}</div>}
                    </div>

                    {peers.length > 0 && peers.map((peerObj) => {
                        return (
                            <div key={peerObj.peerID} className="user-frame">
                                <Video peer={peerObj.peer} peerId={peerObj.peerID} />
                            </div>
                        );
                    })}

                </div>
                {isOpenChat && <MeetingChatBox chatVisible={handleVisibleChat} />}

                {isOpenUsers && <MeetingUserList usersVisible={handleVisibleUsers} />}

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
            <Row >
                <Col md={{ span: 3, offset: 5 }} >
                    <Button variant="outline-light" onClick={handleActiveVideo} style={{ borderRadius: "50%", margin: "10px" }}>
                        {!isVideoActive ? <i className="fas fa-video-slash"></i> : <i className="fas fa-video"></i>}
                    </Button>

                    <Button variant="outline-light" onClick={handleActiveAudio} style={{ borderRadius: "50%", margin: "10px" }}>
                        {!isMicroActive ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                    </Button>

                    <Button variant="danger" onClick={handleEndMeeting} href='/' style={{ borderRadius: "50%", margin: "10px" }}>
                        {/* <Link to="/"><i style={{ color: "white" }} className="fas fa-phone" ></i></Link> */}
                        <i style={{ color: "white" }} className="fas fa-phone" ></i>
                    </Button>
                </Col>

                <Col md={{ span: 2, offset: 2 }} >
                    <Button variant="outline-light" onClick={handleVisibleInfo} style={{ borderRadius: "50%", margin: "10px" }}>

                        {isOpenInfo ? <i className="fas fa-question-circle"></i> : <i className="far fa-question-circle"></i>}
                    </Button>

                    <Button variant="outline-light" onClick={handleVisibleUsers} style={{ borderRadius: "50%", margin: "10px" }}>

                        {isOpenUsers ? <i className="fas fa-user"></i> : <i className="far fa-user"></i>}
                    </Button>

                    <Button variant="outline-light" onClick={handleVisibleChat} style={{ borderRadius: "50%", margin: "10px" }}>
                        {isOpenChat ? <i className="fas fa-comment-dots"></i> : <i className="far fa-comment-dots"></i>}
                    </Button>
                </Col>

            </Row>


        </div>
    );
};

export default Meeting;