import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useRouteMatch, Link } from 'react-router-dom'
import Navbar from '../Navbar';
import { Avatar, Snackbar, Alert, Tooltip, Badge } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import { socketClient, baseURL } from '../../utils';
import { setMyStatus } from '../../store/reducers/user.reducer'
import {
  sendMessageCv, conversationCalling, cancelCall,
  removeMessageCv, setConversationStatus, getNumberMessageUnread
} from '../../store/reducers/conversation.reducer';
import {
  sendMessage, setMeetingActive, endActiveMeeting,
  clearMeetingJoined, getCurrentMeeting, inviteUsers, receiveTeamInvitation,
  confirmRequest, receiveTeamConfirm, joinRequest, receviceTeamRequest,
  removeTeamMessge
} from '../../store/reducers/team.reducer';
import {
  getMeetingMembers, userJoinMeeting, userOutMeeting,
  sendMeetingMessage, meetingUserAudioChange
} from '../../store/reducers/meeting.reducer'
import { receivceNotification, readNotif } from '../../store/reducers/notification.reducer'
import './layout.css'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const userReducer = useSelector(state => state.userReducer)
  const settingReducer = useSelector(state => state.settingReducer)
  const conversationCall = useSelector(state => state.conversationReducer.conversationCall);
  const numberMessagesUnread = useSelector(state => state.conversationReducer.numberMessagesUnread);
  const params = (useRouteMatch('/teams/:teamId/meeting/:meetingId') || {}).params
  const meetingId = params && Number(params.meetingId)
  const [isSkConnected, setIsSkConnected] = useState(false);
  const [currentNoti, setNoti] = useState(null)

  useEffect(() => {
    let r = document.querySelector(':root');
    if (settingReducer.darkMode) {
      r.style.setProperty('--text-color', '#FFF')
      r.style.setProperty('--primary-bg', '#292929')
      r.style.setProperty('--primary-color', '#0a0a0a')
      r.style.setProperty('--icon-color', '#FFF')
      r.style.setProperty('--hover-bg-color', 'rgb(112, 112, 112)')
      r.style.setProperty('--box-shadow', '2px 2px 5px #111111')
      r.style.setProperty('--shadow-color', '#111111')
    } else {
      r.style.setProperty('--text-color', '#000')
      r.style.setProperty('--primary-bg', '#fafafa')
      r.style.setProperty('--primary-color', '#1962a7')
      r.style.setProperty('--icon-color', '#1962a7')
      r.style.setProperty('--hover-bg-color', 'rgb(240, 240, 240)')
      r.style.setProperty('--box-shadow', '2px 2px 5px #dadcdf')
      r.style.setProperty('--shadow-color', '#dadcdf')
    }
  }, [settingReducer.darkMode])

  useEffect(() => {
    dispatch(getNumberMessageUnread())
  }, [numberMessagesUnread])

  useEffect(() => {

    socketClient.auth = { userId: userReducer.user.id };
    socketClient.connect();

    setIsSkConnected(true);

    dispatch(getCurrentMeeting())

    //user
    socketClient.emit('user-connect', { userId: userReducer.user.id })

    socketClient.on('user-changed-status', ({ userId, status, time }) => {
      dispatch(setConversationStatus({ userId, status, time}))
      dispatch(setMyStatus({ userId, status }))
      console.log(userId, status, time)
    })



    socketClient.on('user-disconnect', ({ userId, status, time }) => {
      console.log(userId, status, time)
      dispatch(setConversationStatus({ userId, status, time }))
    })

    //conversation
    socketClient.on('conversation-receiveMessage', ({
      messageId, content, senderId, receiverId, conversationId,
      files, photos, createdAt, senderName, noti }) => {
      dispatch(sendMessageCv({
        messageId, content, senderId, receiverId,
        conversationId, files, photos, createdAt, senderName
      }));
      if (noti && noti.id) {
        dispatch(receivceNotification({ noti }))
      }
    })

    socketClient.on('conversation-removed-message', ({ conversationId, messageId, receiverId, senderId }) => {
      dispatch(removeMessageCv({ conversationId, messageId, receiverId, senderId }))
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

    socketClient.on('receive-message-team', ({ messageId, teamId, senderId, content, files, photos, createdAt, noti }) => {
      dispatch(sendMessage({
        messageId, content, senderId, teamId, photos, files, isMessage: true, createdAt
      }))
      if (noti && noti.id) {
        dispatch(receivceNotification({ noti }))
      }
    })

    socketClient.on('team-invite-user-success', ({ users, teamId }) => {
      dispatch(inviteUsers({ users, teamId }))
    })

    socketClient.on('team-confirm-user-success', ({ teamId, userId }) => {
      dispatch(confirmRequest({ teamId, userId }))
    })

    socketClient.on('request-join-team-success', ({ team }) => {
      dispatch(joinRequest({ team }))
    })

    socketClient.on('team-removed-message', ({ teamId, senderId, messageId }) => {
      dispatch(removeTeamMessge({ teamId, messageId, senderId }))
    })

    //meetings
    //receive event when new user join meeting => emit state audio for new user 
    socketClient.on('user-join-meeting', ({ teamId, meetingId, user, isAudioActive }) => {
      dispatch(userJoinMeeting({ teamId, meetingId, user, isAudioActive }))
    })

    socketClient.on('joined-meeting', ({ members, meetingId, teamId, usersAudio }) => {
      dispatch(getMeetingMembers({
        members,
        meetingId,
        teamId,
        usersAudio
      }))
    })

    socketClient.on('sent-message-meeting', ({ messageId, meetingId, senderId, content, photos, files, createdAt, teamId }) => {
      dispatch(sendMeetingMessage({
        messageId, content, senderId, meetingId, photos, files, createdAt
      }))
    })

    socketClient.on('receive-message-meeting', ({ messageId, meetingId, senderId, content, photos, files, teamId, createdAt }) => {
      dispatch(sendMeetingMessage({
        messageId, content, senderId, meetingId, photos, teamId, files, createdAt
      }))
    })

    socketClient.on('meeting-user-audio-changed', ({ userId, isAudioActive, meetingId }) => {
      dispatch(meetingUserAudioChange({
        meetingId, userId, isAudioActive
      }))
    })

    socketClient.on('user-out-meeting', ({ meetingId, userId }) => {
      dispatch(userOutMeeting({
        meetingId, userId
      }))
    })

    socketClient.on('own-out-meeting', ({ meetingId }) => {
      dispatch(clearMeetingJoined({ meetingId }))
    })

    socketClient.on('end-meeting', ({ meeting }) => {
      dispatch(endActiveMeeting({ meeting }))
    })


    //notifications
    socketClient.on('receive-team-invitation', ({ noti, teamId, teamName, hostId }) => {
      if (noti) {
        dispatch(receiveTeamInvitation({
          id: Number(teamId), hostId, name: teamName
        }))
        dispatch(receivceNotification({ noti }))
        setTimeout(() => {
          setNoti(noti)
        }, 500)
      }
    })

    socketClient.on('receive-team-confirm', ({ noti, teamId, teamName, hostId }) => {
      if (noti) {
        dispatch(receiveTeamConfirm({
          id: Number(teamId), hostId, name: teamName
        }))
        dispatch(receivceNotification({ noti }))
        setTimeout(() => {
          setNoti(noti)
        }, 500)
      }
    })

    socketClient.on('receive-team-request', ({ noti, teamId, userName, userId }) => {
      if (noti) {
        dispatch(receviceTeamRequest({
          teamId, userName, userId
        }))
        dispatch(receivceNotification({ noti }))
        setTimeout(() => {
          setNoti(noti)
        }, 500)
      }
    })

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
        <Navbar />
        <div className="layout">
          <div className="list-selection">
            <NavLink exact to='/home' activeClassName="btn-active">
              <button className="btn-default" >
                <Tooltip title='Home' placement='right'>
                  <HomeIcon />
                </Tooltip>
              </button>
            </NavLink>
            <NavLink to='/conversations' activeClassName="btn-active">
              <button className="btn-default" >
                <Badge
                  badgeContent={numberMessagesUnread}
                  max={99}
                  color='error'
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Tooltip title='Messages' placement='right'>
                    <MessageIcon />
                  </Tooltip>
                </Badge>
              </button>
            </NavLink>
            <NavLink to='/teams' activeClassName="btn-active">
              <button className="btn-default">
                <Tooltip title='Teams' placement='right'>
                  <PeopleAltIcon />
                </Tooltip>
              </button>
            </NavLink>
            <NavLink to='/profile' activeClassName="btn-active">
              <button className="btn-default">
                <Tooltip title='Profile' placement='right'>
                  <ManageAccountsIcon style={{ fontSize: '26px' }} />
                </Tooltip>
              </button>
            </NavLink>
            <NavLink to='/setting' activeClassName="btn-active">
              <button className="btn-default" >
                <Tooltip title='Setting' placement='right'>
                  <SettingsIcon />
                </Tooltip>
              </button>
            </NavLink>
          </div>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>

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
          {currentNoti && <Snackbar open={currentNoti !== null} autoHideDuration={3000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={e => setNoti(null)}>
            <Alert variant="filled" severity="info"
              onClick={(e) => {
                e.preventDefault()
                dispatch(readNotif(currentNoti.id))
              }}>
              <Link to={currentNoti.relativeLink} style={{ textDecoration: 'none', color: '#FFF' }}>
                {currentNoti.content}
              </Link>
            </Alert>
          </Snackbar>}
        </div>
      </> :
        <div>
          {children}
        </div>}
    </>
  )
}
