import React, { useEffect, useRef } from 'react'

const Video = ({ stream }) => {
  const localVideo = useRef();

  // localVideo.current is null on first render
  // localVideo.current.srcObject = stream;

  useEffect(() => {
    // Let's update the srcObject only after the ref has been set
    // and then every time the stream prop updates
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return (
    <div>
      <video style={{ height: 300, width: 300 }} ref={localVideo} autoPlay muted/>
    </div>
  );
};

export default Video;