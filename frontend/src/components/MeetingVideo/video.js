import React, { useEffect, useRef } from "react";

const Video = ({ stream }) => {
    const videoRef = useRef();

    useEffect(() => {
        ref.current.srcObject = stream;
    }, []);

    return (
        <video width="250px" height="250px" ref={videoRef} autoPlay />
    );
}

export default Video;