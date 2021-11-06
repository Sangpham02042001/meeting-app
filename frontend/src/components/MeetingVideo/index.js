import React, { useEffect, useRef } from "react";
import Video from './video';
import './meetingVideo.css'

const MeetingVideo = ({ remoteStreams }) => {


  return (
    <div className="meeting-video">
      <div className="remote-video">
        {
          remoteStreams.current.length && remoteStreams.current.map(stream => {
            return <Video key={stream} stream={stream} />
          })
        }
      </div>

    </div>
  );
}

export default MeetingVideo;