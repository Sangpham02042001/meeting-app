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
    <div style={{ color: "white", border: "2px solid white", textAlign: "center" }}>
      {/* <div>{index}</div> */}
      <video width="320px" height="320"  ref={ref} autoPlay/>
    </div>

  );
}

export default Video;