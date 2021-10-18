import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import { Button, Modal } from 'react-bootstrap'
import { baseURL } from '../../utils'
import './teamheader.css'
import Dropdown from '../Dropdown'
import { deleteTeam, outTeam } from '../../store/reducers/team.reducer'
import { createTeamMeeting } from '../../store/reducers/meeting.reducer'

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
  const [isVideoActive, setVideoActive] = useState(true)
  const [isAudioActive, setAudioActive] = useState(true)
  const [isMeeting, setIsMeeting] = useState(false)
  const userVideo = useRef()

  useEffect(() => {
    if (isCreateMeetingShow) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        userVideo.current.srcObject = stream;
      })
    } else {
      userVideo.current && userVideo.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }, [isCreateMeetingShow])

  useEffect(() => {
    if (teamReducer.team.meetings.length) {

      let meetingActive = teamReducer.team.meetingActive
      if (meetingActive && meetingActive.teamId === teamId) {
        setIsMeeting(true)
      }
    }
    // if (meetingReducer.meetings.id) {
    //   window.open(`/teams/${teamId}/meeting/${meetingReducer.meeting.id}`, '_blank')
    // }
    // setIsMeeting(meetingReducer.meeting.active)
  }, [teamReducer.team.meetings.length])

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
        {
          isMeeting && teamReducer.team.meetingActive
          && <Button variant='success' className='join-meeting-btn'>
            <Link
              target="_blank"
              to={`/teams/${teamId}/meeting/${teamReducer.team.meetingActive.id}`} >
              Join Meeting
            </Link>
          </Button>
        }
        <i className="far fa-question-circle" onClick={showTeamInfo}></i>
        <Button variant="light" className="meeting-btn"
          disabled={isMeeting}
          onClick={e => {
            e.preventDefault()
            setShowCreateMeeting(true)
          }}>
          <i className="fas fa-video"></i> Meeting
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
          <Modal show={isDeleteModalShow} centered onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <h4>Confirm delete this team</h4>
            </Modal.Header>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button onClick={handleDeleteTeam}>Delete</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={isOutModalShow} centered onHide={handleCloseOutModal}>
            <Modal.Header closeButton>
              <h4>Confirm out this team</h4>
            </Modal.Header>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseOutModal}>
                Cancel
              </Button>
              <Button onClick={handleOutTeam}>Out</Button>
            </Modal.Footer>
          </Modal>

          {/* Meeting here */}
          <Modal show={isCreateMeetingShow} centered onHide={handleCloseCreateMeeting}>
            <Modal.Header closeButton>
              <h4>Create new meeting</h4>
            </Modal.Header>
            <Modal.Body>
              <video width="100%" height="320px" muted ref={userVideo} autoPlay />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outline-light" onClick={handleActiveVideo} style={{ borderRadius: "50%", margin: "10px", color: '#000' }}>
                  {!isVideoActive ? <i className="fas fa-video-slash"></i> : <i className="fas fa-video"></i>}
                </Button>
                <span>Join with camera</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outline-light" onClick={handleActiveAudio} style={{ borderRadius: "50%", margin: "10px", color: '#000' }}>
                  {!isAudioActive ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                </Button>
                <span>Join with audio</span>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseCreateMeeting}>
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting}>
                {/* <Link style={{ color: 'white', textDecoration: 'none' }}
                  to={`/teams/${teamId}/meeting/312312`} target="_blank"> */}
                Create
                {/* </Link> */}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  )
}
