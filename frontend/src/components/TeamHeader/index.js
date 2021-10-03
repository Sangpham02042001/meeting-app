import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import { Button, Modal } from 'react-bootstrap'
import { baseURL } from '../../utils'
import './teamheader.css'
import Dropdown from '../Dropdown'
import { deleteTeam } from '../../store/reducers/team.reducer'

export default function TeamHeader({ showTeamInfo }) {
  const { teamId } = useParams()
  const dispatch = useDispatch()
  const history = useHistory()
  const teamReducer = useSelector(state => state.teamReducer)
  const user = useSelector(state => state.userReducer.user)
  const [isDeleteModalShow, setDeleteModalShow] = useState(false)

  const handleDeleteTeam = async () => {
    console.log('delete team')
    dispatch(deleteTeam({
      teamId
    }))
    setDeleteModalShow(false)
    history.push('/teams')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalShow(false)
  }

  return (
    <div className='team-header'>
      <div style={{ display: 'flex' }}>
        <div className='team-header-coverphoto'
          style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${teamId}")` }}>
        </div>
        <span style={{ marginLeft: '15px' }}>
          <h5 style={{ marginBottom: '5px' }}>{teamReducer.team.name}</h5>
          {teamReducer.team.numOfMembers && teamReducer.team.numOfMembers.length === 1
            ? `${teamReducer.team.numOfMembers} member` : `${teamReducer.team.numOfMembers} members`}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
        <i className="far fa-question-circle" onClick={showTeamInfo}></i>
        <Button variant="light" className="meeting-btn">
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
              {teamReducer.team.hostId !== user.id && <span style={{ padding: '12px 16px' }}>
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
        </div>
      </div>
    </div>
  )
}
