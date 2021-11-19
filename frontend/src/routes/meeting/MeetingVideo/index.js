import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { baseURL, socketClient } from "../../../utils";
import MicOffIcon from '@mui/icons-material/MicOff';
import './meetingVideo.css'

const MeetingVideo = ({ remoteStreams, remoteVideos, remoteAudios }) => {
  const usersAudio = useSelector(state => state.meetingReducer.meeting.usersAudio)

  return (
    <div className="remote-videos">
      {
        remoteStreams.current.length && remoteStreams.current.map((remote, idx) => {
          return remote && remote.stream && <Video
            key={remote.userId + ' ' + remoteVideos.current[idx] + ' ' + remoteAudios.current[idx]} userId={remote.userId}
            stream={remote.stream} name={remote.name} isVideo={remoteVideos.current[idx]} isAudio={usersAudio[remote.userId]} />
        })
      }
    </div>
  );
}

const Video = ({ stream, name, userId, isVideo, isAudio }) => {
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
      <h4>
        {name}
        {!isAudio && <MicOffIcon />}
      </h4>
    </div>
  );
}

export default MeetingVideo;