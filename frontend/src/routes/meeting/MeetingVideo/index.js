import React, { useEffect, useRef, useState } from "react";
import './meetingVideo.css'

const MeetingVideo = ({ remoteStreams }) => {


  return (
    <div className="remote-videos">
      {
        remoteStreams.current.length && remoteStreams.current.map((remote, idx) => {
          return <Video key={idx} stream={remote.stream} name={remote.name} />
        })
      }
    </div>
  );
}

const Video = ({ stream, name }) => {
  const videoRef = useRef();

  const [isOpenCamera, setOpenCamera] = useState(true)

  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, []);

  return (
    <div className="remote-video-item">
      <video width="100%" height="100%" ref={videoRef} autoPlay />
      {!isOpenCamera &&
        <Avatar sx={{ width: "120px", height: '120px', zIndex: 10 }}
          src={`${baseURL}/api/user/avatar/${userId}`}
          alt={name} />}
      <h4>{name}</h4>
    </div>
  );
}

export default MeetingVideo;