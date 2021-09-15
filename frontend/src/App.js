import React, { useRef, useState, useEffect, createRef } from 'react'
import socket from './socket-client'
import axios from 'axios'
import Peer from 'peerjs'
import Video from './components/Video'
import './App.css';

function App() {
  const [peers, setPeers] = useState({})
  const [streams, setStreams] = useState([])
  const [roomId, setRoomId] = useState('123456')
  const myVideo = useRef()
  const myPeer = new Peer()

  useEffect(() => {
    async function call() {
      socket.connect()
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        myPeer.on('call', call => {
          call.answer(stream)
          call.on('stream', userVideoStream => {
            setStreams([
              ...streams,
              userVideoStream
            ])
            console.log('first call stream change')
          })
        })

        socket.on('user-connected', userId => {
          console.log(`new user connect ${userId}`)
          connectToNewUser(userId, stream)
        })
      })

      myPeer.on('open', id => {
        console.log(`open ${roomId} ${id}`)
        socket.emit('join-room', roomId, id)
      })

      socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
      })
    }
    call()
  }, [])

  useEffect(() => {
    console.log(streams)
  }, [streams])

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    call.on('stream', userVideoStream => {
      let newStreams = streams.concat(userVideoStream)
      setStreams(newStreams)
      console.log('new user', userId, " stream change", streams)
      console.log('new streams', newStreams)
    })
    call.on('close', () => {
      // video.remove()
    })

    setPeers({
      ...peers,
      [userId]: call
    })
  }

  return (
    <div className="App">
      <video className='my-video' autoPlay ref={myVideo} />
      <div className='video-list'>
        {streams.map((stream, index) => {
          // let newRef = createRef()
          return <Video key={index} stream={stream} />
        })}
      </div>
    </div>
  );
}

export default App;
