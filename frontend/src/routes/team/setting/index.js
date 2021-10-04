import React, { useEffect } from 'react'
import { Route, Switch, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { Container, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useHistory, useParams } from 'react-router'
import {
  getTeamInfo, requestJoinTeam, refuseInvitations,
  confirmInvitations
} from '../../../store/reducers/team.reducer'
import SettingList from '../../../components/TeamSetting/SettingList'
import TeamGeneralSetting from '../../../components/TeamSetting/General'
import TeamRequestUsers from '../../../components/TeamSetting/RequestUsers'
import TeamMembers from '../../../components/TeamSetting/Members'
import TeamInvitedUsers from '../../../components/TeamSetting/InvitedUsers'
import Loading from '../../../components/Loading'

export default function TeamSetting(props) {
  const teamReducer = useSelector(state => state.teamReducer)
  const { teamId } = useParams()
  const user = useSelector(state => state.userReducer.user)
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!teamReducer.teamLoaded) {
      console.log('call in setting')
      dispatch(getTeamInfo({ teamId }))
    }
  }, [teamId])

  useEffect(() => {
    if (teamReducer.teamLoaded && teamReducer.team.hostId != user.id) {
      history.push(`/teams/${teamId}`)
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
        <h3 style={{ margin: '15px 0 20px 0' }}>Setting</h3>
        <Row style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Col sm={2} style={{ paddingLeft: '30px' }}>
            <SettingList />
          </Col>
          <Col sm={6}>
            <Switch>
              <Route path="/teams/:teamId/setting/members">
                <TeamMembers />
              </Route>
              <Route path="/teams/:teamId/setting/requestusers">
                <TeamRequestUsers />
              </Route>
              <Route path="/teams/:teamId/setting/invitedusers">
                <TeamInvitedUsers />
              </Route>
              <Route exact path="/teams/:teamId/setting">
                <TeamGeneralSetting />
              </Route>
              <Route render={() => <Redirect to="/notfound" />}>
              </Route>
            </Switch>
          </Col>
        </Row>
      </Container>
  )
}
