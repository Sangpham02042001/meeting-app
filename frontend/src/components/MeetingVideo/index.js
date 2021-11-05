import React, { useEffect, useRef } from "react";
import Janus from '../../janus'

const Video = ({ stream }) => {
  const ref = useRef();

  useEffect(() => {
    Janus.attachMediaStream(ref.current, stream);
    // ref.current
  }, []);



  return (
    <video width="100%" height="100%" ref={ref} autoPlay />
  );
}

export default Video;