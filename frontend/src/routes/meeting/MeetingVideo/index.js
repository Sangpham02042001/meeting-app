import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import { baseURL } from "../../../utils";
import './meetingVideo.css'

const MeetingVideo = ({ remoteStreams, remoteVideos }) => {


  return (
    <div className="remote-videos">
      {
        remoteStreams.current.length && remoteStreams.current.map((remote, idx) => {
          return remote && remote.stream && <Video key={remote.userId + ' ' + remoteVideos.current[idx]} userId={remote.userId}
            stream={remote.stream} name={remote.name} isVideo={remoteVideos.current[idx]} />
        })
      }
    </div>
  );
}

const Video = ({ stream, name, userId, isVideo }) => {
  const videoRef = useRef();

  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, []);

  return (
    <div className="remote-video-item">
      <video width="100%" height="100%" ref={videoRef} autoPlay style={{
        display: isVideo ? 'block' : 'none'
      }} />
      {!isVideo &&
        <Avatar sx={{ width: "70px", height: '70px', zIndex: 10 }}
          src={`${baseURL}/api/user/avatar/${userId}`}
          alt={name} />}
      <h4>{name}</h4>
    </div>
  );
}

export default MeetingVideo;