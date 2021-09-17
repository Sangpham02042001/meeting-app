import React, { useEffect, useRef } from "react";

const Video = ({peer}) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      ref.current.srcObject = stream;

    })
  }, []);

  return (
    <div>
      <video width="320px" height="320"  ref={ref} autoPlay/>
    </div>

  );
}

export default Video;