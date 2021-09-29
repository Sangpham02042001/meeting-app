import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useHistory, useParams } from 'react-router'

export default function TeamSetting() {
  const teamReducer = useSelector(state => state.teamReducer)
  const user = useSelector(state => state.userReducer.user)
  const history = useHistory()
  const { teamId } = useParams()

  useEffect(() => {
    if (teamReducer.teamLoaded && teamReducer.team.hostId != user.id) {
      history.push(`/teams/${teamId}`)
    }
  }, [teamReducer.teamLoaded])

  return (
    <Container fluid style={{ padding: '10px' }}>
      <Col sm={12}>
        <Link to={`/teams/${teamId}`} style={{ color: '#000', textDecoration: 'none' }}>
          &lt; &nbsp;Back
        </Link>
      </Col>
      <h3>Setting</h3>
    </Container>
  )
}
