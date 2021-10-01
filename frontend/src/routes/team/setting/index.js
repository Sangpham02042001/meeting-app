import React, { useEffect } from 'react'
import { Route, Switch, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { Container, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useHistory, useParams } from 'react-router'
import SettingList from '../../../components/TeamSetting/SettingList'
import TeamGeneralSetting from '../../../components/TeamSetting/General'
import TeamRequestUsers from '../../../components/TeamSetting/RequestUsers'
import TeamMembers from '../../../components/TeamSetting/Members'
import TeamInvitedUsers from '../../../components/TeamSetting/InvitedUsers'
import NotFound from '../../../components/NotFound';

export default function TeamSetting(props) {
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
      <h3 style={{ margin: '15px 0 20px 0' }}>Setting</h3>
      <Col sm={12} style={{ display: 'flex', paddingLeft: '30px' }}>
        <SettingList />
        <div style={{ marginLeft: '20px' }}>
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
        </div>
      </Col>
    </Container>
  )
}
