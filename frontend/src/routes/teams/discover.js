import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import {
  Col, Container, Image, Row, Button,
  Modal, Form, Spinner
} from 'react-bootstrap'
import axios from 'axios'
import { baseURL } from '../../utils'
import { Link } from 'react-router-dom'

export default function TeamDiscover() {
  const user = useSelector(state => state.userReducer.user)
  const history = useHistory()
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPublicTeam, setPublicTeam] = useState(true)
  const [newTeamId, setNewTeamId] = useState(0)
  const [searchUsers, setSearchUsers] = useState([])
  const [invitedUsers, setInvitedUsers] = useState([])
  const [searchUserName, setSearchUserName] = useState('')
  const [teamCoverPhoto, setTeamCoverPhoto] = useState('')
  const [isCreateModalShow, setCreateModalShow] = useState(false)
  const [isInviteModalShow, setInviteModalShow] = useState(false)

  const handleCreateModalClose = () => {
    setCreateModalShow(false)
    setTeamName('')
    setPublicTeam(true)
    setTeamCoverPhoto('')
  }

  const handleCreateTeam = () => {
    setCreateModalShow(true)
  }

  const handleInviteUserModal = () => {
    setInviteModalShow(true)
  }

  const handleInviteModalClose = () => {
    setInviteModalShow(false)
    setSearchUserName('')
    setSearchUsers([])
    setInvitedUsers([])
  }

  const handleSearchUser = async () => {
    let token = JSON.parse(localStorage.getItem('user')).token
    setLoading(true)
    let response = await axios.post(`${baseURL}/api/users/search`, {
      text: searchUserName
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setSearchUsers(response.data.users)
    setLoading(false)
  }

  const handleAddInvitedUser = user => e => {
    setInvitedUsers([
      ...invitedUsers,
      user
    ])
    setSearchUsers(searchUsers.filter(u => u.id !== user.id))
  }

  const handleInviteAll = async () => {
    let token = JSON.parse(localStorage.getItem('user')).token
    setLoading(true)
    let response = await axios.post(`${baseURL}/api/teams/${newTeamId}/users`, {
      users: invitedUsers.map(user => user.id)
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setLoading(false)
    if (response.status == 200) {
      history.push('/teams')
    }
    setInviteModalShow(false)
  }

  const deleteUser = user => e => {
    setInvitedUsers(invitedUsers.filter(u => u.id !== user.id))
  }

  const createTeamAndInviteUsers = async () => {
    let token = JSON.parse(localStorage.getItem('user')).token
    let formData = new FormData()
    formData.append('name', teamName)
    formData.append('coverPhoto', teamCoverPhoto)
    formData.append('teamType', isPublicTeam ? 'public' : 'private')
    setLoading(true)
    let response = await axios.post(`${baseURL}/api/teams`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setLoading(false)
    if (response.status == 201) {
      handleCreateModalClose()
      setInviteModalShow(true)
      console.log(response.data)
      setNewTeamId(response.data.team.id)
    }
  }

  return (
    <Container fluid>
      <Row style={{ padding: '15px' }}>
        <Col sm={12}>
          <Link to='/teams' style={{ color: '#000', textDecoration: 'none' }}>
            &lt; &nbsp;Back
          </Link>
        </Col>
        <Col style={{ marginTop: '10px' }} sm={12}>
          <h3>Join or create a team</h3>
        </Col>
        <Col sm={12}>
          <div className='create-team-box'>
            <Image className="create-team-empty-img" src="/teamimage-empty.svg" alt="Team Image" />
            <h5>Create Team</h5>
            <div style={{ marginBottom: '15px' }}>
              <Image className='create-team-box-user' src="/create-team-user1.svg" alt="Team Image" />
              <Image className='create-team-box-user' src="/create-team-user2.svg" alt="Team Image" />
              <Image className='create-team-box-user' src="/create-team-user3.svg" alt="Team Image" />
            </div>
            <Button variant="primary" style={{ backgroundColor: '#364087' }} onClick={handleCreateTeam}>
              <i className="fas fa-user-friends" style={{ marginRight: '10px' }}></i>
              Create team
            </Button>
          </div>
        </Col>
      </Row>
      <Modal show={isCreateModalShow} onHide={handleCreateModalClose} size="lg" centered>
        <Modal.Body>
          <h4>Create your team</h4>
          <p>Collaborate closely with a group of people inside your
            organization based on project, initiative, or common interest.</p>
          <Form.Group className="mb-3" controlId="formTeamName">
            <Form.Label>Team name</Form.Label>
            <Form.Control type="text" placeholder="Enter you team's name"
              value={teamName} onChange={e => setTeamName(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTeamPrivacy">
            <Form.Label>Privacy</Form.Label>
            <Form.Select aria-label="Default select example"
              onChange={e => setPublicTeam(e.target.value === 'true' ? true : false)}>
              <option value={true}>Public - Anyone can request to join and find this team</option>
              <option value={false}>Private - Only team owners can add members</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTeamCoverPhoto">
            <Form.Label>Team Cover Photo</Form.Label> <br />
            <Form.Control
              type="file"
              accept='image/*'
              onChange={(e) => setTeamCoverPhoto(e.target.files[0])}
              required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCreateModalClose}>
            Close
          </Button>
          <Button variant="primary"
            disabled={!teamName || !teamCoverPhoto}
            style={{ backgroundColor: '#364087' }}
            onClick={createTeamAndInviteUsers}>
            Next
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={isInviteModalShow} onHide={handleInviteModalClose} size="lg" centered>
        <Modal.Body>
          <h4>Invite users to join your team</h4>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <Button style={{ backgroundColor: '#364087' }} disabled={!searchUserName}
              onClick={handleSearchUser}>
              Search
            </Button>
          </div>
          <Form.Control type="text" placeholder="Enter user name or email"
            value={searchUserName} onChange={e => setSearchUserName(e.target.value)} />
          {searchUserName && (
            (loading ? <div style={{ textAlign: 'center', padding: '10px' }}>
              <Spinner animation="border" role="status">
              </Spinner>
            </div> : <div className="invited-user-list">
              {searchUsers.filter(user => invitedUsers.map(u => u.id).indexOf(user.id) < 0)
                .map(user => (
                  <div key={user.id} className="invited-user-item">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <Image src={`${baseURL}/api/user/avatar/${user.id}`} alt="user avatar" />
                      <span>
                        <p>{user.userName}</p>
                        <p>{user.email}</p>
                      </span>
                    </span>
                    <Button variant="success" title="Add to the list of invited users"
                      onClick={handleAddInvitedUser(user)}>
                      Add
                    </Button>
                  </div>
                ))}
            </div>)
          )}
          {invitedUsers.length > 0 && <>
            <hr />
            <h4>User list</h4>
          </>}
          {<div className="invited-user-list">
            {invitedUsers.map(user => (
              <div key={user.id} className="invited-user-item">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Image src={`${baseURL}/api/user/avatar/${user.id}`} alt="user avatar" />
                  <span>
                    <p>{user.userName}</p>
                    <p>{user.email}</p>
                  </span>
                </span>
                <Button variant="danger" title="Remove"
                  onClick={deleteUser(user)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleInviteModalClose}>
            Skip
          </Button>
          <Button variant="primary" style={{ backgroundColor: '#364087' }} onClick={handleInviteAll}>
            Invite
          </Button>
        </Modal.Footer>
      </Modal>

      <Button variant="secondary" onClick={handleInviteUserModal}>
        Open Invite User Modal
      </Button>
    </Container >
  )
}
