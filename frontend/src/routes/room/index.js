import React, { useEffect, useRef, useState } from "react";
import { socketClient } from "../../utils";
import Peer from "simple-peer";


const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;

        })
    }, []);

    return (
        <video autoPlay ref={ref} />
    );
}


const Room = (props) => {
    const [peers, setPeers] = useState({});
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
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketClient.on("user joined", ({ signal, callerID }) => {
                const peer = addPeer(signal, callerID, stream);
                peersRef.current.push({
                    peerID: callerID,
                    peer,
                })
                setPeers(peers => [...peers, peer]);
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
                    return peers.filter(p => p !== item.peer)
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

    const handleActiveVideo = (event) => {
        event.preventDefault();
        let checkVideoActive = userVideo.current.srcObject.getVideoTracks()[0].enabled;
        userVideo.current.srcObject.getVideoTracks()[0].enabled = !checkVideoActive;
        setIsVideoActive(!checkVideoActive);
        
    }

    const handleActiveAudio = (event) => {
        event.preventDefault();
        let checkAudioActive = userVideo.current.srcObject.getAudioTracks()[0].enabled;
        userVideo.current.srcObject.getAudioTracks()[0].enabled = !checkAudioActive;
    }

    return (
        <div>
            <button onClick={handleActiveVideo}>Video</button>
            <button onClick={handleActiveAudio}>Audio</button>
            {!isVideoActive && <div>Not show camera</div>}
            <video muted ref={userVideo} autoPlay />
            {peers.length > 0 && peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </div>
    );
};

export default Room;