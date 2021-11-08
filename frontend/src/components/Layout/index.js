import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import Navbar from '../Navbar';
import { Avatar, Snackbar, IconButton } from '@mui/material';
import { socketClient, broadcastLocal, baseURL } from '../../utils';
import { sendMessageCv, conversationCalling, cancelCall } from '../../store/reducers/conversation.reducer';
import { sendMessage, updateMeetingState, setMeetingActive } from '../../store/reducers/team.reducer';
import {
  getMeetingMembers, userJoinMeeting, userOutMeeting,
  sendMeetingMessage
} from '../../store/reducers/meeting.reducer'
import './layout.css'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
// import Avatar from '../Avatar/index'

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const team = useSelector(state => state.teamReducer.team)
  const userReducer = useSelector(state => state.userReducer)
  let params = (useRouteMatch('/teams/:teamId/meeting/:meetingId') || {}).params
  const meetingId = params && Number(params.meetingId)
  const conversationCall = useSelector(state => state.conversationReducer.conversationCall);
  const [isSkConnected, setIsSkConnected] = useState(false);

  useEffect(() => {
    socketClient.auth = { userId: userReducer.user.id };
    socketClient.connect();
    setIsSkConnected(true);
    //conversation
    socketClient.on('conversation-receiveMessage', ({ messageId, content, senderId, receiverId, conversationId, photo, createdAt }) => {
      dispatch(sendMessageCv({ messageId, content, senderId, receiverId, conversationId, photo, createdAt }));
      broadcastLocal.postMessage({ messageId, content, senderId, receiverId, conversationId, photo, createdAt })
    })

    socketClient.on('conversation-sentMessage', ({ messageId, content, senderId, receiverId, conversationId, photo, createdAt }) => {
      dispatch(sendMessageCv({ messageId, content, senderId, receiverId, conversationId, photo, createdAt }));
    })


    socketClient.on('conversation-calling', ({ conversationId, senderId, senderName, receiverId }) => {
      //todo
      console.log('converstation calling')
      dispatch(conversationCalling({ conversationId, senderId, senderName, receiverId }))
    })

    socketClient.on('cancel-call', ({ conversationId, senderId, receiverId }) => {
      dispatch(cancelCall({ conversationId, senderId, receiverId }))
    })

    //teams
    socketClient.on('new-meeting-created', ({ meeting }) => {
      dispatch(setMeetingActive({
        meeting
      }))
    })

    socketClient.on('sent-message-team', ({ messageId, teamId, senderId, content, photo }) => {
      dispatch(sendMessage({
        messageId, content, senderId, teamId, photo
      }))
      broadcastLocal.postMessage({ messageId, teamId, senderId, content, photo })
    })

    socketClient.on('receive-message-team', ({ messageId, teamId, senderId, content, photo }) => {
      dispatch(sendMessage({
        messageId, content, senderId, teamId, photo
      }))
    })

    //meetings
    socketClient.on('user-join-meeting', ({ teamId, meetingId, user }) => {
      dispatch(userJoinMeeting({ teamId, meetingId, user }))
    })

    socketClient.on('joined-meeting', ({ members, meetingId, teamId }) => {
      dispatch(getMeetingMembers({
        members,
        meetingId,
        teamId
      }))
    })

    socketClient.on('sent-message-meeting', ({ messageId, meetingId, senderId, content, photo, teamId }) => {
      dispatch(sendMeetingMessage({
        messageId, content, senderId, meetingId, photo
      }))
      broadcastLocal.postMessage({ messageId, meetingId, senderId, content, photo, teamId })
    })

    socketClient.on('receive-message-meeting', ({ messageId, meetingId, senderId, content, photo, teamId }) => {
      dispatch(sendMeetingMessage({
        messageId, content, senderId, meetingId, photo, teamId
      }))
    })

    socketClient.on('user-out-meeting', ({ meetingId, userId }) => {
      dispatch(userOutMeeting({
        meetingId, userId
      }))
    })

    // socketClient.on('end-meeting', ({ meetingId }) => {
    //   console.log(`end meeting with id, ${meetingId}`)
    //   broadcastLocal.postMessage({
    //     messageType: 'end-meeting',
    //     meetingId
    //   })
    // })

    broadcastLocal.onmessage = (message) => {
      console.log(message);
      if (message.messageType === 'end-meeting') {
        dispatch(updateMeetingState({
          meetingId
        }))
      } else if (message.data.conversationId) {
        dispatch(sendMessageCv(message.data))
      } else if (message.data.teamId) {
        dispatch(sendMessage(message.data))
      }
    }

    socketClient.on("disconnect", () => {
      socketClient.connect();
      console.log('try to auto reconnect')
    });

    socketClient.on('connect_error', (error) => {
      console.log(error)
      setIsSkConnected(false)
    });

    socketClient.on('error', (error) => {
      console.log(error)
      setIsSkConnected(false)
    });

    console.log(socketClient);

    return () => {
      socketClient.disconnect();
    }
  }, [])

  const reconnectAction = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={e => {
        socketClient.connect();
        setIsSkConnected(true);
      }}>
        CONNECT
      </Button>
      
    </React.Fragment>
  )

  useEffect(() => {
    if (!socketClient.connected) {
      socketClient.connect();
    } 
  }, [socketClient.connected])

  const handleCancelCall = () => {
    dispatch(cancelCall({
      conversationId: conversationCall.conversationId
    }))
    socketClient.emit('conversation-cancel-call', {
      conversationId: conversationCall.conversationId,
      senderId: userReducer.user.id, receiverId: conversationCall.senderId
    })
  };

  const handleAcceptCall = () => {
    dispatch(cancelCall({
      conversationId: conversationCall.conversationId
    }))
  };

  return (
    <>
      {!meetingId ? <>

        <div className="layout">
          <div className="list-selection">
            <div>
              <Link to='/home'>
                <Avatar src='/meeting-logo.png' style={{
                  width: '40px',
                  height: '40px',
                  margin: 'auto'
                }} />
              </Link>
            </div>
            <div className="btn-list-selection">
              <NavLink exact to='/home' activeClassName="btn-active">
                <button className="btn-default" ><i className="fas fa-home"></i></button>
              </NavLink>
            </div>
            <div className="btn-list-selection">
              <NavLink to='/conversations' activeClassName="btn-active">
                <button className="btn-default" ><i className="fas fa-comment-dots"></i></button>

              </NavLink>
            </div>
            <div className="btn-list-selection">
              <NavLink to='/teams' activeClassName="btn-active">
                <button className="btn-default"><i className="fas fa-users"></i></button>
              </NavLink>
            </div>
            <div className="btn-list-selection">
              <NavLink to='/setting' activeClassName="btn-active">
                <button className="btn-default" ><i className="fas fa-cog"></i></button>
              </NavLink>
            </div>
          </div>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Navbar />
            <div className="content-layout">
              {children}
            </div>
          </div>

          <Snackbar
            open={!isSkConnected}
            autoHideDuration={6000}
            message="Try to connect network"
            action={reconnectAction}
          />


          <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={conversationCall.isRinging}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Calling...
            </DialogTitle>
            <DialogContent>
              <div>
                <Avatar src={`${baseURL}/api/user/avatar/${conversationCall.senderId}`}
                  alt="user avatar"
                  style={{
                    width: '40px',
                    height: '40px',
                  }} />
                <span style={{ fontSize: '18px', fontWeight: 500 }}>{conversationCall.senderName}</span> is calling you...
              </div>

            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelCall} variant="contained" color="error">Reject</Button>
              <Button onClick={handleAcceptCall} variant="contained">
                Accept
              </Button>
            </DialogActions>
          </Dialog>

        </div>
      </> :
        <div>
          {children}
        </div>}
    </>
  )
}
