import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import {
  Col, Container, Image, Row, Button,
  Modal, Form, Spinner
} from 'react-bootstrap'
import { inviteUsers } from '../../store/reducers/team.reducer'
import { axiosAuth, baseURL } from '../../utils'

export default function InviteUsersWrapper({ users }) {
  const dispatch = useDispatch()
  const teamMembers = useSelector(state => state.teamReducer.team.members.map(u => u.id))
  const teamInvitedUsers = useSelector(state => state.teamReducer.team.invitedUsers.map(u => u.id))
  const teamRequestUsers = useSelector(state => state.teamReducer.team.requestUsers.map(u => u.id))
  const [searchUsers, setSearchUsers] = useState([])
  const [invitedUsers, setInvitedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isShow, setShow] = useState(false)
  const [searchUserName, setSearchUserName] = useState('')
  const { teamId } = useParams()

  useEffect(() => {
    return () => {
      setInvitedUsers([])
      setSearchUsers([])
    }
  }, [])

  const handleInviteModalClose = () => {
    setShow(false)
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
    let users = response.data.users.filter(u => {
      return teamMembers.indexOf(u.id) < 0 && teamInvitedUsers.indexOf(u.id) < 0
        && teamRequestUsers.indexOf(u.id) < 0
    })
    setSearchUsers(users)
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
    dispatch(inviteUsers({
      users: invitedUsers,
      teamId: teamId
    }))
    setLoading(false)
    setShow(false)
  }

  const deleteUser = user => e => {
    setInvitedUsers(invitedUsers.filter(u => u.id !== user.id))
  }

  const cancelSearchUsers = e => {
    e.preventDefault()
    setSearchUsers([])
    setSearchUserName('')
  }

  return (
    <>
      <div style={{ textAlign: 'right' }}>
        <Button variant="success" onClick={e => {
          e.preventDefault()
          setShow(true)
        }}>Invite</Button>
      </div>
      <Modal show={isShow} onHide={handleInviteModalClose} size="lg" centered>
        <Modal.Header closeButton>
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
            Cancel
          </Button>
          <Button variant="primary" disabled={!invitedUsers.length}
            style={{ backgroundColor: '#364087' }} onClick={handleInviteAll}>
            Invite
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
