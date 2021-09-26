import React, { useEffect, useRef } from "react";

const Video = ({peer, peerId}) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      console.log('stream', peerId);
      ref.current.srcObject = stream;

    })
  }, []);



  return (
    <video width="100%" height="100%" ref={ref} autoPlay/>
  );
}

export default Video;