import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Tooltip,
  Menu, MenuItem, Avatar
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import InfoIcon from '@mui/icons-material/Info';
import { baseURL } from '../../utils'
import './teamheader.css'
import { deleteTeam, outTeam, createTeamMeeting, setMeetingJoined } from '../../store/reducers/team.reducer'
import { width } from '@mui/system'

export default function TeamHeader({ showTeamInfo }) {
  // const { teamId } = useParams()
  const params = useParams()
  const teamId = Number(params.teamId)
  const dispatch = useDispatch()
  const history = useHistory()
  const teamReducer = useSelector(state => state.teamReducer)
  const user = useSelector(state => state.userReducer.user)
  const [isDeleteModalShow, setDeleteModalShow] = useState(false)
  const [isOutModalShow, setOutModalShow] = useState(false)
  const [isCreateMeetingShow, setShowCreateMeeting] = useState(false)
  const [isJoinMeetingShow, setShowJoinMeeting] = useState(false)
  const [isVideoActive, setVideoActive] = useState(true)
  const [isAudioActive, setAudioActive] = useState(true)
  const [isEnableVideo, setIsEnableVideo] = useState(false)
  const [isEnableAudio, setIsEnableAudio] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null);
  let isOpenMenu = Boolean(anchorEl)
  const [createMeetingPending, setCreateMeetingPending] = useState(false)
  const userVideo = useRef()

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

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
    // setVideoActive(!checkVideoActive)


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
      <div style={{ display: 'flex', marginLeft: '15px' }}>
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
        {createMeetingPending && <LoadingButton loading={createMeetingPending}
          variant="text" style={{ color: 'var(--icon-color)' }}>
        </LoadingButton>}
        {
          teamReducer.team.meetingActive
          && <Button variant="contained"
            disabled={teamReducer.meetingJoined}
            style={{ backgroundColor: 'var(--primary-color)', color: '#FFF' }}
            className='join-meeting-btn' onClick={handleJoinMeeting}>
            Join Meeting
          </Button>
        }
        <Tooltip title="Team info" style={{ marginRight: '10px' }}>
          <IconButton onClick={e => {
            e.preventDefault()
            showTeamInfo()
          }}>
            <InfoIcon style={{ color: 'var(--icon-color)' }} />
          </IconButton>
        </Tooltip>
        <Button variant="outlined" className="meeting-btn"
          style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--icon-color)' }}
          disabled={teamReducer.team.meetingActive || teamReducer.meetingJoined}
          startIcon={<VideoCameraFrontIcon style={{ color: 'var(--icon-color)' }} />}
          onClick={e => {
            e.preventDefault()
            setShowCreateMeeting(true)
          }}> Meeting
        </Button>

        <Tooltip title="Menu" placement='bottom'>
          <Button
            id="basic-button"
            className="team-header-menu-btn"
            aria-controls="basic-menu"
            aria-haspopup="true"
            aria-expanded={isOpenMenu ? 'true' : undefined}
            onClick={e => {
              e.preventDefault()
              setAnchorEl(e.currentTarget)
            }}
          >
            <i className="fas fa-ellipsis-h" style={{ cursor: 'pointer', }}></i>
          </Button>
        </Tooltip>
        <Menu
          className="teamheader-menu"
          anchorEl={anchorEl}
          open={isOpenMenu}
          onClose={handleCloseMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {teamReducer.team.hostId === user.id &&
            <MenuItem className='teamheaer-menu-item'>
              <Link to={`/teams/${teamId}/setting`} style={{ color: 'var(--text-color)' }}>
                <i className="fas fa-cog"></i> Manage Team
              </Link></MenuItem>}
          {teamReducer.team.hostId === user.id &&
            <MenuItem className='teamheaer-menu-item' onClick={e => {
              e.preventDefault()
              setDeleteModalShow(true)
              setAnchorEl(null)
            }} style={{ color: 'var(--text-color)' }}>
              <i className="fas fa-trash-alt"></i> &nbsp; Delete Team
            </MenuItem>}
          {teamReducer.team.hostId !== user.id &&
            <MenuItem className='teamheaer-menu-item' onClick={e => {
              e.preventDefault()
              setOutModalShow(true)
              setAnchorEl(null)
            }} style={{ color: 'var(--text-color)' }}>
              <i className="fas fa-sign-out-alt"></i> Leave Team
            </MenuItem>}
        </Menu>

        <Dialog open={isDeleteModalShow} onClose={handleCloseDeleteModal}>
          <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>
            Confirm delete this team
          </DialogTitle>
          <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
            <Button variant="text" onClick={handleCloseDeleteModal}
              style={{ color: 'var(--icon-color)' }}>
              Cancel
            </Button>
            <Button variant="text" onClick={handleDeleteTeam}
              style={{ color: 'var(--icon-color)' }}>
              Delete</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isOutModalShow} onClose={handleCloseOutModal}>
          <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>
            <h4>Confirm out this team</h4>
          </DialogTitle>
          <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
            <Button variant="text" onClick={handleCloseOutModal}
              style={{ color: 'var(--icon-color)' }}>
              Cancel
            </Button>
            <Button variant="text" onClick={handleOutTeam}
              style={{ color: 'var(--icon-color)' }}>Out</Button>
          </DialogActions>
        </Dialog>

        {/* Meeting here */}
        <Dialog open={isCreateMeetingShow} onClose={handleCloseCreateMeeting}>
          <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>
            Create new meeting
          </DialogTitle>
          <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
            <Button variant="text" onClick={handleCloseCreateMeeting}
              style={{ color: 'var(--icon-color)' }}>
              Cancel
            </Button>
            <Button variant="text" onClick={handleCreateMeeting}
              style={{ color: 'var(--icon-color)' }}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isJoinMeetingShow} centered="true" onClose={handleCloseJoinMeeting} minWidth="sm" fullWidth={true}>
          <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>
            Join meeting
          </DialogTitle>
          <DialogContent style={{ backgroundColor: 'var(--primary-bg)' }}>
            <div style={{ position: 'relative', width: '100%', }}>
              {isEnableVideo && <video width="100%" height="320px" muted ref={userVideo} autoPlay />}
              {!isEnableVideo && <div style={{
                width: '78%', height: '320px', display: 'flex',
                position: 'absolute', top: 0, left: '11%', background: '#FFF',
                justifyContent: 'center', alignItems: 'center'
              }}>
                <Avatar sx={{ width: '120px', height: '120px' }} src={`${baseURL}/api/user/avatar/${user.id}`} />
              </div>}
            </div>
            {/* <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
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
            </div> */}

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              {/* {
                !isEnableAudio ?
                  <Button variant="outlined" disabled={!isEnableAudio} onClick={handleActiveAudio} style={{ border: 'none', color: '#000' }}>
                    <i className="fas fa-microphone-slash"></i>
                  </Button>
                  :
                  <Button variant="outlined" onClick={handleActiveAudio} style={{ border: 'none', color: '#000' }}>
                    {!isAudioActive ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                  </Button>
              } */}
              {
                !isEnableAudio ?
                  <Tooltip placement="top" title="No micro found">
                    <div>
                      <IconButton disabled >
                        <MicOffIcon style={{ color: 'var(--text-color)' }} />
                      </IconButton>
                    </div>
                  </Tooltip>
                  :
                  <IconButton onClick={handleActiveAudio} >
                    {!isAudioActive ?
                      <Tooltip placement="top" title="Turn on mic">
                        <MicOffIcon style={{ color: 'var(--text-color)' }} />
                      </Tooltip>
                      :
                      <Tooltip placement="top" title="Turn off mic">
                        <MicIcon style={{ color: 'var(--text-color)' }} />
                      </Tooltip>}
                  </IconButton>
              }

              <span>Join with audio</span>
            </div>
          </DialogContent>
          <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
            <Button variant="text" onClick={handleCloseJoinMeeting}
              style={{ color: ('var(--icon-color)') }}>
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
                  style={{ textDecoration: 'none', color: ('var(--icon-color)') }}
                  to={`/teams/${teamId}/meeting/${teamReducer.team.meetingActive.id}?audio=${isAudioActive}`}>
                  Join
                </Link>}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div >
  )
}
