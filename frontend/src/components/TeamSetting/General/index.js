import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  TextField, MenuItem, Button, Avatar,
  Alert, Snackbar, Tooltip, IconButton
} from '@mui/material'
import { baseURL } from '../../../utils'
import { updateBasicTeamInfo } from '../../../store/reducers/team.reducer'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function TeamGeneralSetting() {
  const dispatch = useDispatch()
  const teamReducer = useSelector(state => state.teamReducer)
  const [teamName, setTeamName] = useState(() => teamReducer.team.name)
  const [teamType, setTeamType] = useState(() => teamReducer.team.teamType)
  const [teamCoverPhoto, setTeamCoverPhoto] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [message, setMessage] = useState({})
  const [editted, setEditted] = useState(false)

  const handleUpdateTeamInfo = (e) => {
    e.preventDefault()
    let formData = new FormData()
    formData.append('name', teamName === teamReducer.team.name ? '' : teamName)
    formData.append('teamType', teamType === teamReducer.team.teamType ? '' : teamType)
    formData.append('coverPhoto', teamCoverPhoto)
    dispatch(updateBasicTeamInfo({
      data: formData,
      teamId: teamReducer.team.id
    }))
    setEditted(true)
  }

  useEffect(() => {
    if (editted) {
      setImageUrl('')
      setMessage({
        type: 'success',
        content: 'Edit team successfully'
      })
      setTimeout(() => {
        setEditted(false)
      }, 3000)
    }
  }, [teamReducer.team.name, teamReducer.team.teamType, teamReducer.team.coverPhoto])

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      setTeamCoverPhoto(e.target.files[0])
      let reader = new FileReader()
      let url = reader.readAsDataURL(e.target.files[0])
      reader.onloadend = e => {
        setImageUrl(reader.result)
      }
    }
  }

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamReducer.team.teamCode)
    setMessage({
      type: 'success',
      content: 'Copied to clipboard'
    })
  }

  return (
    <div style={{ margin: 'auto', maxWidth: '450px' }} className='team-general-setting'>
      <div>
        <div className='profile-avatar-container'>
          <Avatar
            key={teamReducer.team.coverPhoto}
            alt="Remy Sharp"
            src={imageUrl || `${baseURL}/api/team/coverphoto/${teamReducer.team.id}?id=${teamReducer.team.coverPhoto}`}
            sx={{ width: 200, height: 200, margin: 'auto', border: '5px solid #f7f7f7' }} />
          <label className='new-avatar-btn' htmlFor='newAvatar'><i className="fas fa-camera"></i></label>
          <input id="newAvatar" type="file" accept='image/*' style={{ display: 'none' }}
            onChange={handleImageChange}></input>
        </div>
      </div>
      <div style={{ margin: '10px 0', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span>Team code:</span> <strong>{teamReducer.team.teamCode}</strong>
        </div>
        <Tooltip title="Copy to clipboard">
          <IconButton onClick={copyTeamCode}>
            <ContentCopyIcon style={{ color: 'var(--text-color)' }} />
          </IconButton>
        </Tooltip>
      </div>
      <TextField variant="standard"
        style={{ width: '100%', marginBottom: '20px' }}
        label="Team Name"
        name="name"
        value={teamName}
        onChange={e => setTeamName(e.target.value)}
      />
      <TextField variant="standard"
        select label="Change Team Visibility"
        style={{ width: '100%', marginBottom: '20px', color: 'var(--text-color)' }}
        value={teamType}
        onChange={e => setTeamType(e.target.value)}
        className="team-type-select">
        <MenuItem style={{ color: 'var(--text-color)', backgroundColor: 'var(--primary-bg)' }} value="public">
          Public - Anyone can request to join and find this team
        </MenuItem>
        <MenuItem style={{ color: 'var(--text-color)', backgroundColor: 'var(--primary-bg)' }} value="private">
          Private - Only team owners can add members
        </MenuItem>
      </TextField>
      <Button variant="contained"
        style={{ backgroundColor: 'var(--primary-color)', color: '#FFF' }}
        onClick={handleUpdateTeamInfo}
        disabled={(teamName && teamName.trim() === teamReducer.team.name)
          && !imageUrl && (teamType === teamReducer.team.teamType)}>
        Save the change
      </Button>
      <Snackbar open={message.content && message.content.length > 0} autoHideDuration={3000} onClose={e => setMessage({})}>
        <Alert severity={message.type}>
          {message.content}
        </Alert>
      </Snackbar>
    </div>
  )
}
