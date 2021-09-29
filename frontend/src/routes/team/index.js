import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import { Container, Modal, Button, Image } from 'react-bootstrap'
import { getTeamInfo } from '../../store/reducers/team.reducer'
import { baseURL } from '../../utils'
import Loading from '../../components/Loading'
import './team.css'
import TeamHeader from '../../components/TeamHeader'

export default function Team(props) {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  const user = useSelector(state => state.userReducer.user)
  const dispatch = useDispatch()
  const [isInvitedModalShow, setInvitedModalShow] = useState(false)
  const [isTeamInfoShow, setTeamInfoShow] = useState(false)

  useEffect(() => {
    dispatch(getTeamInfo({ teamId }))
  }, [teamId])

  useEffect(() => {
    if (teamReducer.team.invitedUsers) {
      teamReducer.team.invitedUsers.some(u => u.id == user.id)
        && setInvitedModalShow(true)
    }
  }, [teamReducer.team.invitedUsers])

  const handleCloseInvitedModal = () => {
    setInvitedModalShow(false)
    useHistory().push('/teams')
  }

  const showTeamInfo = () => {
    console.log('fadfa')
    setTeamInfoShow(!isTeamInfoShow)
  }

  return (
    teamReducer.loading ? <Loading />
      :
      <Container fluid style={{ padding: 0 }}>
        <TeamHeader showTeamInfo={showTeamInfo} />
        <div className="team-container">
          <div className="team-body" style={{ width: isTeamInfoShow ? '80%' : '100%' }}>Team</div>
          {isTeamInfoShow && <div className="team-info-container">
            <strong>About</strong>
            <p>{teamReducer.team.name}</p>

            <strong>Members ({teamReducer.team.members.length})</strong>
            {teamReducer.team.members.slice(0, 5).map(member => (
              <span key={`member ${member.id}`}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div className='team-info-user-avatar'
                  style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${member.id}")` }}>
                </div>
                <p style={{ marginBottom: 0 }}>{member.userName}</p>
              </span>
            ))}
            {teamReducer.team.members.length > 5 && <Link to="#">
              See all members
            </Link>}
          </div>}
        </div>
        <Modal show={isInvitedModalShow} onHide={handleCloseInvitedModal}>
          <Modal.Body>You are invited to join this team</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseInvitedModal}>
              Refuse
            </Button>
            <Button variant="primary">
              Agree
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  )
}
