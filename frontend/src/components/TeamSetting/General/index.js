import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TextField, MenuItem, Button } from '@mui/material'
import { baseURL } from '../../../utils'
import { updateBasicTeamInfo } from '../../../store/reducers/team.reducer'

export default function TeamGeneralSetting() {
  const dispatch = useDispatch()
  const teamReducer = useSelector(state => state.teamReducer)
  const [teamName, setTeamName] = useState(() => teamReducer.team.name)
  const [teamType, setTeamType] = useState(() => teamReducer.team.teamType)
  const [teamCoverPhoto, setTeamCoverPhoto] = useState('')

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
  }

  return (
    <div style={{ margin: 'auto' }}>
      <TextField variant="standard"
        style={{ width: '100%', marginBottom: '20px' }}
        label="Team Name"
        name="name"
        value={teamName}
        onChange={e => setTeamName(e.target.value)}
      />
      <TextField variant="standard"
        select label="Change Team Visibility"
        style={{ width: '100%', marginBottom: '20px' }}
        value={teamType}
        onChange={e => setTeamType(e.target.value)}>
        <MenuItem value="public">Public - Anyone can request to join and find this team</MenuItem>
        <MenuItem value="private">Private - Only team owners can add members</MenuItem>
      </TextField>
      <p style={{ marginBottom: '5px', color: 'gray', fontSize: '14px' }}>Change Team Cover Photo</p>
      <TextField
        variant="standard"
        style={{ width: '100%', marginBottom: '20px' }}
        type="file"
        name="coverPhoto"
        accept='image/*'
        onChange={(e) => setTeamCoverPhoto(e.target.files[0])}
      />
      <Button variant="text"
        onClick={handleUpdateTeamInfo}
        disabled={(teamName && teamName.trim() === teamReducer.team.name)
          && !teamCoverPhoto && (teamType === teamReducer.team.teamType)}>
        Save the change
      </Button>
    </div>
  )
}
