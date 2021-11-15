import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Tooltip,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import InfoIcon from '@mui/icons-material/Info';
import { baseURL } from '../../utils'
import './teamheader.css'
import Dropdown from '../Dropdown'
import { deleteTeam, outTeam, createTeamMeeting, setMeetingJoined } from '../../store/reducers/team.reducer'
// import { createTeamMeeting } from '../../store/reducers/meeting.reducer'

export default function TeamHeader({ showTeamInfo }) {
  // const { teamId } = useParams()
  const params = useParams()
  const teamId = Number(params.teamId)
  const dispatch = useDispatch()
  const history = useHistory()
  const teamReducer = useSelector(state => state.teamReducer)
  const meetingReducer = useSelector(state => state.meetingReducer)
  const user = useSelector(state => state.userReducer.user)
  const [isDeleteModalShow, setDeleteModalShow] = useState(false)
  const [isOutModalShow, setOutModalShow] = useState(false)
  const [isCreateMeetingShow, setShowCreateMeeting] = useState(false)
  const [isJoinMeetingShow, setShowJoinMeeting] = useState(false)
  const [isVideoActive, setVideoActive] = useState(true)
  const [isAudioActive, setAudioActive] = useState(true)
  const [isEnableVideo, setIsEnableVideo] = useState(false)
  const [isEnableAudio, setIsEnableAudio] = useState(false)
  const [createMeetingPending, setCreateMeetingPending] = useState(false)
  const userVideo = useRef()

  function getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const filtered = devices.filter(device => device.kind === type);
        callback(filtered);
      });
  }

  useEffect(() => {
    getConnectedDevices('videoinput', (cameras) => {
      if (cameras.length) setIsEnableVideo(true);
    })

    getConnectedDevices('audioinput', (audios) => {
      if (audios.length) setIsEnableAudio(true);

    })

  }, [])


  useEffect(() => {
    if (isJoinMeetingShow) {
      (isEnableVideo || isEnableAudio) && navigator.mediaDevices.getUserMedia({ video: isEnableVideo, audio: isEnableAudio }).then(stream => {
        userVideo.current.srcObject = stream;
      })
    } else {
      userVideo.current && userVideo.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }, [isJoinMeetingShow])

  useEffect(() => {
    if (teamReducer.team.meetingActive) {
      setCreateMeetingPending(false)
    }
  }, [teamReducer.team.meetingActive])

  const handleDeleteTeam = async () => {
    console.log('delete team')
    dispatch(deleteTeam({
      teamId
    }))
    setDeleteModalShow(false)
    history.push('/teams')
  }

  const handleOutTeam = async () => {
    dispatch(outTeam({
      userId: user.id,
      teamId: Number(teamId)
    }))
    setOutModalShow(false)
    history.push('/teams')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalShow(false)
  }

  const handleCloseOutModal = () => {
    setOutModalShow(false)
  }

  const handleCloseCreateMeeting = () => {
    setShowCreateMeeting(false)
  }

  const handleActiveVideo = () => {
    let checkVideoActive = userVideo.current.srcObject.getVideoTracks()[0].enabled;
    userVideo.current.srcObject.getVideoTracks()[0].enabled = !checkVideoActive;
    setVideoActive(!checkVideoActive)


  }

  const handleActiveAudio = () => {
    let checkAudioActive = userVideo.current.srcObject.getAudioTracks()[0].enabled;
    userVideo.current.srcObject.getAudioTracks()[0].enabled = !checkAudioActive;
    setAudioActive(!isAudioActive)
  }

  const handleCreateMeeting = () => {
    setShowCreateMeeting(false)
    dispatch(createTeamMeeting({
      teamId
    }))
    setCreateMeetingPending(true)
  }

  const handleJoinMeeting = () => {
    setShowJoinMeeting(true)
  }

  const handleCloseJoinMeeting = () => {
    setShowJoinMeeting(false)
  }

  return (
    <div className='team-header'>
      <div style={{ display: 'flex' }}>
        <div className='team-header-coverphoto'
          style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${teamId}")` }}>
        </div>
        <span style={{ marginLeft: '15px', padding: 0 }}>
          <h5 style={{ marginBottom: '5px' }}>{teamReducer.team.name}</h5>
          {teamReducer.team.numOfMembers && teamReducer.team.numOfMembers.length === 1
            ? `${teamReducer.team.numOfMembers} member` : `${teamReducer.team.numOfMembers} members`}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
        <LoadingButton loading={createMeetingPending} variant="text">
        </LoadingButton>
        {
          teamReducer.team.meetingActive
          && <Button variant="contained"
            disabled={teamReducer.meetingJoined}
            className='join-meeting-btn' onClick={handleJoinMeeting}>
            Join Meeting
          </Button>
        }
        <Tooltip title="Team info" style={{ marginRight: '10px' }}>
          <IconButton onClick={showTeamInfo}>
            <InfoIcon color='primary' />
          </IconButton>
        </Tooltip>
        <Button variant="outlined" className="meeting-btn"
          style={{ backgroundColor: '#fff' }}
          disabled={teamReducer.team.meetingActive || teamReducer.meetingJoined}
          startIcon={<VideoCameraFrontIcon style={{ color: 'rgb(25, 118, 210)' }} />}
          onClick={e => {
            e.preventDefault()
            setShowCreateMeeting(true)
          }}> Meeting
        </Button>
        <div className="navbar-btn">
          <Dropdown
            dropdownStyle={{ transform: 'translateX(-60px)' }}
            icon={<button className="dropdown-btn" style={{ color: "white" }}>
              <i className="fas fa-ellipsis-h" style={{ cursor: 'pointer' }}></i>
            </button>
            }>
            <div style={{ display: 'flex', flexDirection: 'column', width: '160px' }}>
              {teamReducer.team.hostId === user.id && <Link to={`/teams/${teamId}/setting`}>
                <i className="fas fa-cog"></i> Manage Team
              </Link>}
              {teamReducer.team.hostId === user.id &&
                <span style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={e => {
                  e.preventDefault()
                  setDeleteModalShow(true)
                }}>
                  <i className="fas fa-trash-alt"></i> Delete Team
                </span>}
              {teamReducer.team.hostId !== user.id &&
                <span style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={e => {
                  e.preventDefault()
                  setOutModalShow(true)
                }}>
                  <i className="fas fa-sign-out-alt"></i> Leave Team
                </span>}
            </div>
          </Dropdown>
          {/* <div className="dropdown" style={{ marginRight: '5px' }}>
            <button className="dropdown-btn" style={{ color: "white" }}>
              <i className="fas fa-ellipsis-h" style={{ cursor: 'pointer' }}></i>
            </button>
            <div className="dropdown-content" style={{ width: '170px' }}>
              {teamReducer.team.hostId === user.id && <Link to={`/teams/${teamId}/setting`}>
                <i className="fas fa-cog"></i> Manage Team
              </Link>}
              {teamReducer.team.hostId === user.id && <span style={{ padding: '12px 16px' }}>
                <i className="fas fa-trash-alt"></i> Delete Team
              </span>}
              {teamReducer.team.hostId !== user.id && <span style={{ padding: '12px 16px' }}>
                <i className="fas fa-sign-out-alt"></i> Leave Team
              </span>}
            </div>
          </div> */}
          <Dialog open={isDeleteModalShow} onClose={handleCloseDeleteModal}>
            <DialogTitle>
              Confirm delete this team
            </DialogTitle>
            <DialogActions>
              <Button variant="text" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button variant="text" onClick={handleDeleteTeam}>Delete</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={isOutModalShow} onClose={handleCloseOutModal}>
            <DialogTitle>
              <h4>Confirm out this team</h4>
            </DialogTitle>
            <DialogActions>
              <Button variant="text" onClick={handleCloseOutModal}>
                Cancel
              </Button>
              <Button variant="text" onClick={handleOutTeam}>Out</Button>
            </DialogActions>
          </Dialog>

          {/* Meeting here */}
          <Dialog open={isCreateMeetingShow} onClose={handleCloseCreateMeeting}>
            <DialogTitle>
              Create new meeting
            </DialogTitle>
            <DialogActions>
              <Button variant="text" onClick={handleCloseCreateMeeting}>
                Cancel
              </Button>
              <Button variant="text" onClick={handleCreateMeeting}>
                Create
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={isJoinMeetingShow} centered="true" onClose={handleCloseJoinMeeting}>
            <DialogTitle>Join meeting
            </DialogTitle>
            <DialogContent>
              <video width="100%" height="320px" muted ref={userVideo} autoPlay />
              <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                {
                  !isEnableVideo ?
                    <Button variant="outlined" disabled={!isEnableVideo} onClick={handleActiveVideo} style={{ border: 'none', color: '#000' }}>
                      <i className="fas fa-video-slash"></i>
                    </Button>
                    :
                    <Button variant="outlined" onClick={handleActiveVideo} style={{ border: 'none', color: '#000' }}>
                      {!isVideoActive ? <i className="fas fa-video-slash"></i> : <i className="fas fa-video"></i>}
                    </Button>
                }
                <span>Join with camera</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                {
                  !isEnableAudio ?
                    <Button variant="outlined" disabled={!isEnableAudio} onClick={handleActiveAudio} style={{ border: 'none', color: '#000' }}>
                      <i className="fas fa-microphone-slash"></i>
                    </Button>
                    :
                    <Button variant="outlined" onClick={handleActiveAudio} style={{ border: 'none', color: '#000' }}>
                      {!isAudioActive ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                    </Button>
                }

                <span>Join with audio</span>
              </div>
            </DialogContent>
            <DialogActions>
              <Button variant="text" onClick={handleCloseJoinMeeting}>
                Cancel
              </Button>
              <Button variant="text">
                {teamReducer.team.meetingActive
                  && <Link target="_blank" style={{ zIndex: 10 }}
                    onClick={e => {
                      setShowJoinMeeting(false)
                      dispatch(setMeetingJoined({
                        teamId,
                        id: teamReducer.team.meetingActive.id
                      }))
                    }}
                    style={{ textDecoration: 'none' }}
                    to={`/teams/${teamId}/meeting/${teamReducer.team.meetingActive.id}?video=${isVideoActive}&audio=${isAudioActive}`}>
                    Join
                  </Link>}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
