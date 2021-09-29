import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { Button, Modal } from 'react-bootstrap'
import { baseURL } from '../../utils'
import './teamheader.css'

export default function TeamHeader() {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  const user = useSelector(state => state.userReducer.user)
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
        <Button variant="light" className="meeting-btn">
          <i className="fas fa-video"></i> Meeting
        </Button>
        <div className="navbar-btn">
          <div className="dropdown" style={{ marginRight: 0 }}>
            <button className="dropdown-btn" style={{ color: "white" }}>
              <i className="fas fa-ellipsis-h" style={{ cursor: 'pointer' }}></i>
            </button>
            <div className="dropdown-content">
              {teamReducer.team.hostId === user.id && <Link to={`/teams/${teamId}/setting`}>
                <i className="fas fa-cog"></i> Manage Team
              </Link>}
              {teamReducer.team.hostId === user.id && <span>
                <i className="fas fa-trash-alt"></i> Delete Team
              </span>}
              {teamReducer.team.hostId !== user.id && <span>
                <i className="fas fa-sign-out-alt"></i> Leave Team
              </span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
