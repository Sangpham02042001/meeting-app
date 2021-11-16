import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import {
  Grid, Button, Dialog, DialogContent,
  DialogTitle, DialogActions, Avatar, Input,
  TextField, InputLabel, InputAdornment, FormControl,
  MenuItem, Alert, Snackbar
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { axiosAuth, baseURL, getTime } from '../../utils'
import { Link } from 'react-router-dom'
import { createNewTeam, requestJoinTeam, getJoinedTeams, getRequestTeams, getInvitedTeams } from '../../store/reducers/team.reducer'

export default function TeamDiscover() {
  const user = useSelector(state => state.userReducer.user)
  const teamReducer = useSelector(state => state.teamReducer)
  const dispatch = useDispatch()
  const history = useHistory()
  const [teamName, setTeamName] = useState('')
  const [searchTeamName, setSearchTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPublicTeam, setPublicTeam] = useState(true)
  const [newTeamId, setNewTeamId] = useState(0)
  const [teamCode, setTeamCode] = useState('')
  const [team, setTeam] = useState({})
  const [searchUsers, setSearchUsers] = useState([])
  const [invitedUsers, setInvitedUsers] = useState([])
  const [searchTeams, setSearchTeams] = useState([])
  const [searchUserName, setSearchUserName] = useState('')
  const [teamCoverPhoto, setTeamCoverPhoto] = useState('')
  const [isCreateModalShow, setCreateModalShow] = useState(false)
  const [isInviteModalShow, setInviteModalShow] = useState(false)
  const [message, setMessage] = useState({})

  useEffect(() => {
    if (teamReducer.error) {
      setLoading(false)
      setMessage({
        type: 'error',
        content: teamReducer.error
      })
    }
  }, [teamReducer.error])

  useEffect(() => {
    if (loading) {
      setLoading(false)
      handleCreateModalClose()
      setInviteModalShow(true)
      let length = teamReducer.joinedTeams.length
      let team = teamReducer.joinedTeams[length - 1]
      setNewTeamId(team.id)
      setMessage({
        type: 'success',
        content: 'Create new team successfully'
      })
    }
  }, [teamReducer.joinedTeams.length])

  useEffect(() => {
    if (!teamReducer.joinedTeamLoaded) {
      dispatch(getJoinedTeams())
    }
    if (!teamReducer.requestTeamLoaded) {
      dispatch(getRequestTeams())
    }
    if (!teamReducer.invitedTeamLoaded) {
      dispatch(getInvitedTeams())
    }
  }, [])

  const handleCreateModalClose = () => {
    setCreateModalShow(false)
    setTeamName('')
    setPublicTeam(true)
    setTeamCoverPhoto('')
    setMessage({})
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
    dispatch(createNewTeam({
      formData
    }))
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
    setTeam({})
  }

  const findTeamWithCode = async () => {
    try {
      let response = await axiosAuth.get(`/api/teams/search-with-code?code=${teamCode}`)
      let { team } = response.data
      if (team) {
        setTeam(team)
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage({
          type: 'error',
          content: error.response.data.error
        })
      } else {
        setMessage({
          type: 'error',
          content: 'Something wrong, try again!'
        })
      }
    }
  }

  const closeTeam = () => {
    setTeam({})
  }

  const isMemberOfTeam = (teamId) => {
    if (teamReducer.joinedTeams.find(t => t.id === teamId)) {
      return `You are a member of this team`
    }
    return ''
  }

  const isInvitedOfTeam = (teamId) => {
    if (teamReducer.invitedTeams.find(t => t.id === teamId)) {
      return `You are invited to join this team`
    }
    return ''
  }

  const isRequestOfTeam = (teamId) => {
    if (teamReducer.requestingTeams.find(t => t.id === teamId)) {
      return `You are requesting to join this team`
    }
    return ''
  }

  return (
    <Grid container>
      <Grid item sm={12} style={{ padding: '15px' }}>
        <Link to='/teams' style={{ color: '#000', textDecoration: 'none', fontWeight: '700' }}>
          &lt; &nbsp; &nbsp; All teams
        </Link>
        <h3 style={{ margin: '15px 0' }}>Join or create a team</h3>
        <div style={{ display: 'flex', width: '100%' }}>
          <span className='create-team-box'>
            <img className="create-team-empty-img" src="teamimage-empty.svg" alt="Team Image" />
            <h5>Create Team</h5>
            <div style={{ marginBottom: '15px', display: 'flex' }}>
              <Avatar className='create-team-box-user' src="create-team-user1.svg" alt="Team Image" />
              <Avatar className='create-team-box-user' src="create-team-user2.svg" alt="Team Image" />
              <Avatar className='create-team-box-user' src="create-team-user3.svg" alt="Team Image" />
            </div>
            <Button variant="text" onClick={handleCreateTeam}
              startIcon={<GroupIcon style={{ color: 'rgb(25, 118, 210)' }} />}>
              Create team
            </Button>
          </span>

          <span className='create-team-box'>
            <img className="create-team-empty-img" src="join-team-code.svg" alt="Team Image" />
            <h5>Join a team with code</h5>
            <div className='team-code-container'>
              <input value={teamCode} id="team-code"
                onChange={e => setTeamCode(e.target.value)}
                placeholder='Enter code' />
            </div>
            <Button variant="text" onClick={findTeamWithCode} disabled={!teamCode}>
              Join team
            </Button>
          </span>

        </div>

        <div style={{ marginTop: '20px', display: "flex", justifyContent: 'space-between' }}>
          <h3>Search teams you want to join</h3>
          <form onSubmit={handleSearchTeams} style={{ display: 'flex' }}>
            {loading && <div style={{ textAlign: 'center', marginRight: '10px' }}>
              <CircularProgress />
            </div>}
            <FormControl variant="outlined">
              <InputLabel htmlFor="search-teams">
                Find teams
              </InputLabel>
              <Input
                id="search-teams"
                value={searchTeamName}
                onChange={e => setSearchTeamName(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
              />
            </FormControl>
          </form>
        </div>
        <div className="team-list" style={{ overflowY: 'auto', padding: '10px 0' }}>
          {searchTeams.map(team => (
            <div key={team.id} className="team-item">
              <Avatar src={`${baseURL}/api/team/coverphoto/${team.id}`} sx={{ width: '80px', height: '80px' }} />
              <h5>{team.name}</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
                <Button variant='text' onClick={handleRequestJoin(team)}>Request</Button>
                <Button variant='text'
                  onClick={e => {
                    e.preventDefault()
                    setSearchTeams(searchTeams.filter(t => t.id !== team.id))
                  }}
                >Hide</Button>
              </div>
            </div>
          ))}
        </div>
      </Grid>
      <Dialog open={isCreateModalShow} onClose={handleCreateModalClose}>
        <DialogContent>
          <h4>Create your team</h4>
          <p>Collaborate closely with a group of people inside your
            organization based on project, initiative, or common interest.</p>
          <TextField label="Team name" variant="standard"
            style={{ width: '100%', marginBottom: '20px' }}
            value={teamName} onChange={e => setTeamName(e.target.value)} />

          <TextField
            select
            label="Privacy"
            style={{ width: '100%', marginBottom: '20px' }}
            value={isPublicTeam}
            onChange={e => setPublicTeam(e.target.value === 'true' ? true : false)}
            variant="standard"
          >
            <MenuItem value='true'>Public - Anyone can request to join and find this team</MenuItem>
            <MenuItem value='false'>Private - Only team owners can add members</MenuItem>
          </TextField>
          <p>Team CoverPhoto</p>
          <FormControl variant="outlined" label="outlined" style={{ width: '100%', marginBottom: '20px' }}>
            <Input
              id="team-coverphoto"
              type="file"
              accept='image/*'
              onChange={e => setTeamCoverPhoto(e.target.files[0])}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={handleCreateModalClose}>
            Close
          </Button>
          <Button variant='text'
            disabled={!teamName || !teamCoverPhoto}
            onClick={createTeamAndInviteUsers}>
            Next
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={isInviteModalShow} onClose={handleInviteModalClose} maxWidth='sm' fullWidth={true}>
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
                onChange={e => setSearchUserName(e.target.value)}
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
                        <span style={{ marginLeft: '15px' }}>
                          <p>{user.userName}</p>
                          <p>{user.email}</p>
                        </span>
                      </span>
                      <Button variant='text' title="Add to the list of invited users"
                        onClick={handleAddInvitedUser(user)}>
                        Add
                      </Button>
                    </div>
                  ))}
              </div>)
            )}
            {invitedUsers.length > 0 && <>
              <h4>User list</h4>
            </>}
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
                  <Button variant='text' title="Remove"
                    onClick={deleteUser(user)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={handleInviteModalClose}>
            Skip
          </Button>
          <Button variant='text' onClick={handleInviteAll}>
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={team && team.name} onClose={closeTeam}>
        {team.name && <>
          <DialogTitle>Team Info</DialogTitle>
          <DialogContent>
            <h4>Team name: {team.name}</h4>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <Avatar sx={{ width: '100px', height: '100px' }} src={`${baseURL}/api/team/coverphoto/${team.id}`} />
            </div>
            <div>This team is created at <strong>{getTime(team.createdAt)}</strong></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <strong style={{ marginRight: '15px' }}>Admin: </strong>
              <Avatar style={{ marginRight: '5px' }} src={`${baseURL}/api/user/avatar/${team.host.id}`} />
              <strong>{team.host.name}</strong>
            </div>
            <div style={{ color: 'red' }}>
              {isMemberOfTeam(team.id)}
              {isInvitedOfTeam(team.id)}
              {isRequestOfTeam(team.id)}
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant='text' onClick={closeTeam}>
              Close
            </Button>
            <Button variant='text' onClick={handleRequestJoin(team)}
              disabled={isMemberOfTeam(team.id).length > 0 || isInvitedOfTeam(team.id).length > 0 || isRequestOfTeam(team.id).length > 0}>
              Join
            </Button>
          </DialogActions>
        </>}
      </Dialog>

      <Snackbar open={message.content && message.content.length > 0} autoHideDuration={3000} onClose={e => setMessage({})}>
        <Alert severity={message.type}>
          {message.content}
        </Alert>
      </Snackbar>
    </Grid >
  )
}
