import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router'
import {
  getTeamInfo
} from '../../../store/reducers/team.reducer'
import { Container, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Loading from '../../../components/Loading'

export default function TeamMeetings() {
  const teamReducer = useSelector(state => state.teamReducer)
  const { teamId } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!teamReducer.teamLoaded) {
      dispatch(getTeamInfo({ teamId }))
    }
  }, [teamId])

  useEffect(() => {
    if (teamReducer.teamLoaded) {
      console.log(teamReducer.team.meetings)
    }
  }, [teamReducer.teamLoaded])

  return (
    teamReducer.loading ? <Loading /> :
      <Container fluid style={{ paddingTop: '15px' }}>
        <Col sm={12}>
          <Link to={`/teams/${teamId}`} style={{ color: '#000', textDecoration: 'none' }}>
            <strong>&lt; Back</strong>
          </Link>
        </Col>
        <h3 style={{ margin: '15px 0 20px 0' }}>Meetings</h3>
        <Row style={{ display: 'flex', alignItems: 'flex-start' }}>
          <h1>Hello</h1>
        </Row>
      </Container>
  )
}
