import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import {
  Col, Container, Image, Row, Button,
  Modal, Form, Spinner
} from 'react-bootstrap'
import { axiosAuth, baseURL } from '../../utils'
import { Link } from 'react-router-dom'
import { createNewTeam, requestJoinTeam } from '../../store/reducers/team.reducer'

export default function TeamDiscover() {
  const user = useSelector(state => state.userReducer.user)
  const dispatch = useDispatch()
  const history = useHistory()
  const [teamName, setTeamName] = useState('')
  const [searchTeamName, setSearchTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPublicTeam, setPublicTeam] = useState(true)
  const [newTeamId, setNewTeamId] = useState(0)
  const [searchUsers, setSearchUsers] = useState([])
  const [invitedUsers, setInvitedUsers] = useState([])
  const [searchTeams, setSearchTeams] = useState([])
  const [searchUserName, setSearchUserName] = useState('')
  const [teamCoverPhoto, setTeamCoverPhoto] = useState('')
  const [isCreateModalShow, setCreateModalShow] = useState(false)
  const [isInviteModalShow, setInviteModalShow] = useState(false)

  useEffect(() => {
    return () => {
      setInvitedUsers([])
      setSearchUsers([])
      setTeamCoverPhoto('')
    }
  }, [])

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

  const handleSearchUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    let response = await axiosAuth.post('/api/users/search', {
      text: searchUserName
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
    setLoading(true)
    let response = await axiosAuth.post(`/api/teams/${newTeamId}/users`, {
      users: invitedUsers.map(user => user.id)
    })
    setLoading(false)
    setInviteModalShow(false)
    if (response.status == 200) {
      history.push('/teams')
    }
  }

  const deleteUser = user => e => {
    setInvitedUsers(invitedUsers.filter(u => u.id !== user.id))
  }

  const createTeamAndInviteUsers = async () => {
    let formData = new FormData()
    formData.append('name', teamName)
    formData.append('coverPhoto', teamCoverPhoto)
    formData.append('teamType', isPublicTeam ? 'public' : 'private')
    setLoading(true)
    let response = await axiosAuth.post('/api/teams', formData);
    setLoading(false)
    if (response.status == 201) {
      handleCreateModalClose()
      setInviteModalShow(true)
      console.log(response.data)
      let { team } = response.data
      dispatch(createNewTeam({
        id: team.id,
        name: team.name,
        hostId: team.hostId
      }))
      setNewTeamId(response.data.team.id)
    }
  }

  const handleSearchTeams = async (e) => {
    e.preventDefault()
    setLoading(true)
    let response = await axiosAuth.post('/api/teams/search', {
      name: searchTeamName
    })
    setSearchTeams(response.data.teams)
    setLoading(false)
  }

  const cancelSearchTeams = e => {
    e.preventDefault()
    setSearchTeams([])
    setSearchTeamName('')
  }

  const cancelSearchUsers = e => {
    e.preventDefault()
    setSearchUsers([])
    setSearchUserName('')
  }

  const handleRequestJoin = team => e => {
    e.preventDefault()
    dispatch(requestJoinTeam({ team }))
    setSearchTeams(searchTeams.filter(t => t.id != team.id))
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
        <Col sm={12} style={{ marginTop: '15px', display: "flex", justifyContent: 'space-between' }}>
          <h3>Search teams you want to join</h3>
          <Form onSubmit={handleSearchTeams}>
            <Form.Group className="mb-3 search-team-box" controlId="formTeams">
              {loading && <div style={{ textAlign: 'center', marginRight: '10px' }}>
                <Spinner animation="border" role="status">
                </Spinner>
              </div>}
              <Form.Control
                name="teamName"
                placeholder="Search teams"
                value={searchTeamName}
                onChange={e => setSearchTeamName(e.target.value)}
                required
              />
              {searchTeams.length <= 0 ? <i className="fas fa-search"></i>
                : <i className="fas fa-times" style={{ cursor: 'pointer' }}
                  onClick={cancelSearchTeams}>
                </i>}
            </Form.Group>
          </Form>
        </Col>
        <Col sm={12}>
          <div className="team-list" style={{ overflowY: 'auto', padding: '10px 0' }}>
            {searchTeams.map(team => (
              <div key={team.id} className="team-item">
                <div className='team-item-image'
                  style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${team.id}")` }}>
                </div>
                <h5>{team.name}</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
                  <Button onClick={handleRequestJoin(team)}>Request to join</Button>
                  <Button variant="secondary"
                    onClick={e => {
                      e.preventDefault()
                      setSearchTeams(searchTeams.filter(t => t.id !== team.id))
                    }}
                  >Hide</Button>
                </div>
              </div>
            ))}
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
        <Modal.Header>
          <Modal.Title>Invite users to join your team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSearchUser}>
            <Form.Group className="mb-3 search-team-box" controlId="formUsers">
              <Form.Control type="text" placeholder="Enter user name or email"
                value={searchUserName} onChange={e => setSearchUserName(e.target.value)} />
              {searchUsers.length <= 0 ?
                <i className="fas fa-search" style={{ cursor: 'pointer' }}
                  onClick={handleSearchUser}></i>
                : <i className="fas fa-times" style={{ cursor: 'pointer' }}
                  onClick={cancelSearchUsers}>
                </i>}
            </Form.Group>
          </Form>
          <div style={{ minHeight: '300px' }}>
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
          </div>
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
    </Container >
  )
}
