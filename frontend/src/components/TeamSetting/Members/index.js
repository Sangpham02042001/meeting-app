import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import InviteUsersWrapper from '../../InviteUsersWrapper'
import {
  Avatar, Button, Dialog, DialogActions,
  DialogTitle, Snackbar, Alert
} from '@mui/material'
import { removeMember } from '../../../store/reducers/team.reducer'
import { baseURL } from '../../../utils'
import '../team-setting.css'

export default function TeamMembers() {
  const [isShow, setShow] = useState(false)
  const [selectedUser, setUser] = useState(null)
  const [message, setMessage] = useState({})
  const dispatch = useDispatch()
  const team = useSelector(state => state.teamReducer.team)
  const user = useSelector(state => state.userReducer.user)

  const handleRemove = () => {
    dispatch(removeMember({
      userId: selectedUser,
      teamId: team.id
    }))
    setShow(false)
  }

  useEffect(() => {
    if (selectedUser) {
      setMessage({
        type: 'success',
        content: 'Remove member successfully'
      })
      setUser(null)
    }
  }, [team.members.length])

  const handleClose = () => setShow(false)

  return (
    <div>
      <InviteUsersWrapper />
      <h1>Team Members</h1>
      <div className='setting-user-list'>
        {team.members.map(member => <div key={member.id} className='setting-user-item'>
          <div>
            <Avatar sx={{ width: '40px', height: '40px' }}
              src={`${baseURL}/api/user/avatar/${member.id}`} />
            <span>{member.userName}</span>
          </div>
          {member.id !== user.id && <Button variant='contained'
            onClick={e => {
              e.preventDefault()
              setShow(true)
              setUser(member.id)
            }}>Remove</Button>}
        </div>)}
      </div>
      <Dialog open={isShow} onClose={handleClose}>
        <DialogTitle>Remove this user from team?</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleRemove}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={message.content && message.content.length > 0} autoHideDuration={3000} onClose={e => setMessage({})}>
        <Alert severity={message.type}>
          {message.content}
        </Alert>
      </Snackbar>
    </div>
  )
}
