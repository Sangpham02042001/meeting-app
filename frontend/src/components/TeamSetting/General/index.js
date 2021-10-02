import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Spinner } from 'react-bootstrap'
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
      <Form>
        <Form.Group className="mb-3" controlId="formTeamName">
          <Form.Label>Team Name</Form.Label>
          <Form.Control
            name="name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formTeamPrivacy">
          <Form.Label>Change Team Visibility</Form.Label>
          <Form.Select aria-label="Default select example"
            name="teamType"
            value={teamType}
            onChange={e => setTeamType(e.target.value)}>
            <option value="public">Public - Anyone can request to join and find this team</option>
            <option value="private">Private - Only team owners can add members</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formTeamCoverPhoto">
          <Form.Label>Change Team Cover Photo</Form.Label>
          {teamReducer.team.id && <div className='team-setting-coverphoto'
            style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${teamReducer.team.id}")` }}>
          </div>}
          <Form.Control
            type="file"
            name="coverPhoto"
            accept='image/*'
            onChange={(e) => setTeamCoverPhoto(e.target.files[0])}
            required />
        </Form.Group>
        <Button variant="secondary"
          onClick={handleUpdateTeamInfo}
          disabled={(teamName && teamName.trim() === teamReducer.team.name)
            && !teamCoverPhoto && (teamType === teamReducer.team.teamType)}>
          Save the change
        </Button>
        {teamReducer.loading && <Spinner animation="border" role="status">
        </Spinner>}
      </Form>
    </div>
  )
}
