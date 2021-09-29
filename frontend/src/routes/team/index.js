import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import { Container, Modal, Button } from 'react-bootstrap'
import { getTeamInfo } from '../../store/reducers/team.reducer'
import Loading from '../../components/Loading'
import './team.css'
import TeamHeader from '../../components/TeamHeader'

export default function Team(props) {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  const user = useSelector(state => state.userReducer.user)
  const dispatch = useDispatch()
  const [isInvitedModalShow, setInvitedModalShow] = useState(false)

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

  return (
    teamReducer.loading ? <Loading />
      :
      <Container fluid style={{ padding: 0 }}>
        <TeamHeader />
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
