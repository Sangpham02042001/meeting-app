import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import InviteUsersWrapper from '../../InviteUsersWrapper'
import {
  Avatar, Button, Dialog, DialogActions,
  DialogTitle, Snackbar, Alert
} from '@mui/material'
import { refuseJoinRequests } from '../../../store/reducers/team.reducer'
import { baseURL, socketClient } from '../../../utils'
import '../team-setting.css'


export default function TeamRequestUsers() {
  const [isConfirmShow, setConfirmShow] = useState(false)
  const [isRefuseShow, setRefuseShow] = useState(false)
  const [selectedUser, setUser] = useState(null)
  const [message, setMessage] = useState({})
  const dispatch = useDispatch()
  const team = useSelector(state => state.teamReducer.team)

  useEffect(() => {
    if (isConfirmShow) {
      setMessage({
        type: 'success',
        content: 'Confirm request successfully'
      })
      setConfirmShow(false)
    } else if (isRefuseShow) {
      setMessage({
        type: 'success',
        content: "Refuse request successfully"
      })
      setRefuseShow(false)
    }
  }, [team.requestUsers.length])

  const handleConfirm = () => {
    socketClient.emit('team-confirm-request', {
      userId: selectedUser,
      teamId: Number(team.id)
    })
    setUser(null)
  }

  const handleRefuse = () => {
    dispatch(refuseJoinRequests({
      userId: selectedUser,
      teamId: team.id
    }))

    setUser(null)
  }

  const handleCloseConfirm = () => setConfirmShow(false)

  const handleCloseRefuse = () => setRefuseShow(false)

  return (
    <div>
      <InviteUsersWrapper />
      <h1>Team Request Users</h1>
      <div className='setting-user-list'>
        {team.requestUsers.map(member => <div key={member.id} className='setting-user-item'>
          <div>
            <Avatar sx={{ width: '40px', height: '40px' }}
              src={`${baseURL}/api/user/avatar/${member.id}`} />
            <span>{member.userName}</span>
          </div>
          <div>
            <Button variant='contained'
              style={{ marginRight: '20px', backgroundColor: 'var(--primary-color)' }}
              onClick={e => {
                e.preventDefault()
                setConfirmShow(true)
                setUser(member.id)
              }}>Agree</Button>
            <Button variant='contained'
              style={{ backgroundColor: 'var(--primary-color)' }}
              onClick={e => {
                e.preventDefault()
                setRefuseShow(true)
                setUser(member.id)
              }}>Disagree</Button>
          </div>
        </div>)}
      </div>
      <Dialog open={isConfirmShow} onClose={handleCloseConfirm}>
        <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>Confirm this user to join team?</DialogTitle>
        <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
          <Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseConfirm}>Cancel</Button>
          <Button style={{ color: 'var(--icon-color)' }} onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isRefuseShow} onClose={handleCloseRefuse}>
        <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>Confirm remove this request?</DialogTitle>
        <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
          <Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseRefuse}>Cancel</Button>
          <Button style={{ color: 'var(--icon-color)' }} onClick={handleRefuse}>Confirm</Button>
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
