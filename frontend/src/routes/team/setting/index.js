import React, { useEffect } from 'react'
import { Route, Switch, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { Grid } from '@mui/material';
import { Link } from 'react-router-dom'
import { useHistory, useParams } from 'react-router'
import {
  getTeamInfo
} from '../../../store/reducers/team.reducer'
import SettingList from '../../../components/TeamSetting/SettingList'
import TeamGeneralSetting from '../../../components/TeamSetting/General'
import TeamRequestUsers from '../../../components/TeamSetting/RequestUsers'
import TeamMembers from '../../../components/TeamSetting/Members'
import TeamInvitedUsers from '../../../components/TeamSetting/InvitedUsers'
import Loading from '../../../components/Loading'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TeamSetting(props) {
  const teamReducer = useSelector(state => state.teamReducer)
  const { teamId } = useParams()
  const user = useSelector(state => state.userReducer.user)
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getTeamInfo({ teamId }))
  }, [teamId])

  useEffect(() => {
    if (teamReducer.teamLoaded && teamReducer.team.hostId != user.id) {
      history.push(`/teams/${teamId}`)
    }
  }, [teamReducer.teamLoaded])

  return (teamReducer.teamLoaded ? <Grid container style={{ paddingTop: '15px' }}>
    <Grid item sm={12} style={{ paddingLeft: '30px' }}>
      <div>
        <Link to={`/teams/${teamId}`} style={{ color: '#000', textDecoration: 'none' }}>
          <strong><ArrowBackIcon style={{ position: 'relative', bottom: '1px' }} /> Back</strong>
        </Link>
      </div>
      <h3 style={{ margin: '15px 0 20px 0' }}> Team Setting</h3>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ marginRight: '40px' }}>
          <SettingList />
        </div>
        <div>
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
      </div>
    </Grid>
  </Grid> : <Loading />
  )
}
