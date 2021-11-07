import React, { useEffect, useRef } from "react";
import Video from './video';
import './meetingVideo.css'

const MeetingVideo = ({ remoteStreams }) => {


  return (
    <div className="remote-videos">
      {
        remoteStreams.current.length && remoteStreams.current.map((remote, idx) => {
          return <Video key={remote} stream={remote.stream} name={remote.name} />
        })
      }
    </div>
  );
}

export default MeetingVideo;