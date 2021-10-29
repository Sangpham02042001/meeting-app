import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useRouteMatch } from 'react-router-dom'
import Navbar from '../Navbar';
import { socketClient, broadcastLocal } from '../../utils';
import { sendMessageCv, conversationCalling } from '../../store/reducers/conversation.reducer';
import { sendMessage, updateMeetingState } from '../../store/reducers/team.reducer';
import {
  getMeetingMembers, userJoinMeeting, userOutMeeting,
  sendMeetingMessage
} from '../../store/reducers/meeting.reducer'
import './layout.css'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Avatar from '../Avatar/index'

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const team = useSelector(state => state.teamReducer.team)
  const userReducer = useSelector(state => state.userReducer)
  let params = (useRouteMatch('/teams/:teamId/meeting/:meetingId') || {}).params
  const meetingId = params && Number(params.meetingId)
  const conversationCall = useSelector(state => state.conversationReducer.conversationCall);
  const [openCall, setOpenCall] = React.useState(false);

  const handleCloseCall = () => {
    
    setOpenCall(false);
  };
  useEffect(() => {
    socketClient.auth = { userId: userReducer.user.id };
    socketClient.connect();

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
      setOpenCall(true);
    })

    //teams
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
      console.log('disconnect', socketClient)
      socketClient.connect();
    });

    console.log('call layout')

    return () => {
      socketClient.disconnect();
    }
  }, [])
  return (
    <>
      {!meetingId ? <>
        <Navbar />
        <div className="layout">
          <div className="list-selection">
            <div className="btn-list-selection">
              <NavLink exact to='/' activeClassName="btn-active">
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
          <div className="content-layout">
            {children}
          </div>

          <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={openCall}
            onClose={handleCloseCall}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Calling...
            </DialogTitle>
            <DialogContent>
              <div>
                <Avatar width="36px" height="36px" userId={conversationCall.senderId} />
                <span style={{ fontSize: '18px', fontWeight: 600 }}>{conversationCall.senderName}</span> is calling you...
              </div>

            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCall} variant="contained" color="error">Reject</Button>
              <Button onClick={handleCloseCall} variant="contained">
                Agree
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
