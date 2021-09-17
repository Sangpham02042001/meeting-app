import React, { useEffect, useRef, useState } from "react";
import { socketClient } from "../../utils";
import Peer from "simple-peer";
import Video from "../../components/Video";
import './room.css';
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";



const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const [isVideoActive, setIsVideoActive] = useState(true);
    const userVideo = useRef();
    let peersRef = useRef([]);
    const roomID = props.match.params.roomID;

    console.log(peers);

    useEffect(() => {
        socketClient.connect();
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketClient.emit("join room", roomID);
            socketClient.on("all users", users => {
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

            socketClient.on("user joined", ({ signal, callerID }) => {
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

            socketClient.on("receiving returned signal", ({ signal, callerID, userId }) => {
                const item = peersRef.current.find(p => p.peerID === userId);
                item.peer.signal(signal);
            });



            socketClient.on("user disconnected", userId => {

                const item = peersRef.current.find(p => p.peerID === userId);
                item.peer.destroy()
                console.log(item);
                setPeers(peers => {

                    return peers.filter(p => p.peerID !== userId);
                })
            })
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            //server emit user joined
            socketClient.emit("sending signal", { signal, callerID, userToSignal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketClient.emit("returning signal", { signal, callerID })
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

    const [myVideoStyle, setMyVideoStyle] = useState({
        display: ""
    })
    const [isMicroActive, setIsMicroActive] = useState(true);

    return (
        <div className="room-meeting">
            <Container >
                <div className="all-video">
                    <div>
                        <video width="320px" height="320px" style={myVideoStyle} muted ref={userVideo} autoPlay />
                        {!isVideoActive && <div style={{ width: "320px", height: "320px", color: "white", border: "2px solid white", textAlign: "center" }}>{socketClient.id}</div>}

                    </div>
                    <div>
                        {peers.length > 0 && peers.map((peerObj) => {
                            console.log('eee', peers)
                            return (
                                <Video key={peerObj.peerID}  peer={peerObj.peer} peerId={peerObj.peerID} />
                            );
                        })}
                    </div>
                </div>
                <Row className="tool-bar justify-content-md-center" >
                    <Col xs lg="6" >
                        <Button variant="outline-light" onClick={handleActiveVideo} style={{ borderRadius: "50%", margin: "10px" }}>
                            {!isVideoActive ? <i className="fas fa-video-slash"></i> : <i className="fas fa-video"></i>}
                        </Button>

                        <Button variant="outline-light" onClick={handleActiveAudio} style={{ borderRadius: "50%", margin: "10px" }}>
                            {!isMicroActive ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                        </Button>

                        <Button variant="danger" style={{ borderRadius: "50%", margin: "10px" }}>
                            <Link to="/"><i style={{ color: "white" }} className="fas fa-phone" ></i></Link>
                        </Button>

                    </Col>

                </Row>
            </Container>
        </div>
    );
};

export default Room;