import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import {
  Button, Dialog, DialogContent, DialogTitle,
  DialogActions, FormControl, InputLabel,
  Input, InputAdornment, Avatar, Snackbar, Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { axiosAuth, baseURL, socketClient } from '../../utils'
import _ from 'lodash'

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
  const [message, setMessage] = useState({})
  const { teamId } = useParams()

  useEffect(() => {
    return () => {
      setInvitedUsers([])
      setSearchUsers([])
    }
  }, [])

  useEffect(() => {
    if (invitedUsers.length) {
      setMessage({
        type: 'success',
        content: 'Invite users successfully'
      })
      handleInviteModalClose()
    }
  }, [teamInvitedUsers.length])

  const handleInviteModalClose = () => {
    setShow(false)
    setSearchUserName('')
    setSearchUsers([])
    setInvitedUsers([])
  }

  const searchDebounce = useCallback(_.debounce(async (searchUserName) => {
    if (searchUserName !== '') {
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
  }, 500), [])

  const onSearch = (event) => {
    let searchUserName = event.target.value.trim();
    setSearchUserName(event.target.value)
    searchDebounce(searchUserName)
    setLoading(true)
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
    // setSearchUsers(searchUsers.filter(u => u.id !== user.id))
  }

  const handleInviteAll = async () => {
    setLoading(true)
    socketClient.emit('team-invite-users', {
      teamId,
      users: invitedUsers
    })
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
        <Button variant="contained" onClick={e => {
          e.preventDefault()
          setShow(true)
        }}>Invite</Button>
      </div>
      <Dialog open={isShow} onClose={handleInviteModalClose} minWidth="sm" fullWidth={true}>
        <DialogTitle>
          Invite users to join your team
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSearchUser}>
            <FormControl variant="outlined" style={{ margin: '15px 0', width: '100%' }}>
              <InputLabel htmlFor="search-teams">
                Enter user name or email
              </InputLabel>
              <Input
                id="search-teams"
                value={searchUserName}
                onChange={onSearch}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon onClick={handleSearchUser} />
                  </InputAdornment>
                }
              />
            </FormControl>
          </form>
          <div style={{ minHeight: '300px' }}>
            {searchUserName && (
              (loading ? <div style={{ textAlign: 'center', padding: '10px' }}>
                <CircularProgress />
              </div> : <div className="invited-user-list">
                {searchUsers.filter(user => invitedUsers.map(u => u.id).indexOf(user.id) < 0)
                  .map(user => (
                    <div key={user.id} className="invited-user-item">
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={`${baseURL}/api/user/avatar/${user.id}`} alt="user avatar" />
                        <span style={{ marginLeft: '10px' }}>
                          <p>{user.userName}</p>
                          <p>{user.email}</p>
                        </span>
                      </span>
                      <Button variant="text" title="Add to the list of invited users"
                        onClick={handleAddInvitedUser(user)}>
                        Add
                      </Button>
                    </div>
                  ))}
              </div>)
            )}
            {!loading && !searchUsers.length && searchUserName &&
              <h4 style={{ textAlign: 'center' }}>No user founded</h4>}
            {invitedUsers.length > 0 && <h4>User list</h4>}
            {<div className="invited-user-list">
              {invitedUsers.map(user => (
                <div key={user.id} className="invited-user-item">
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={`${baseURL}/api/user/avatar/${user.id}`} alt="user avatar" />
                    <span style={{ marginLeft: '10px' }}>
                      <p>{user.userName}</p>
                      <p>{user.email}</p>
                    </span>
                  </span>
                  <Button variant="text" title="Remove"
                    onClick={deleteUser(user)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleInviteModalClose}>
            Cancel
          </Button>
          <Button variant="text" disabled={!invitedUsers.length}
            onClick={handleInviteAll}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={message.content && message.content.length > 0} autoHideDuration={3000} onClose={e => setMessage({})}>
        <Alert severity={message.type}>
          {message.content}
        </Alert>
      </Snackbar>
    </>
  )
}
