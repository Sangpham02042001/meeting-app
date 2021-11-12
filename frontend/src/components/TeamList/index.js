import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { getJoinedTeams } from '../../store/reducers/team.reducer'
import { baseURL } from '../../utils'
import './style.css'

export default function TeamList() {
  const teamReducer = useSelector(state => state.teamReducer)
  const dispatch = useDispatch()
  const { teamId } = useParams()

  useEffect(() => {
    if (!teamReducer.joinedTeamLoaded) {
      dispatch(getJoinedTeams())
    }
  }, [teamReducer.joinedTeamLoaded])

  return (
    <div className="teamlist-container">
      <Link to={`/teams`} className="back-to-teams-link">
        <strong>&lt; &nbsp; &nbsp; All teams</strong>
      </Link>
      {teamReducer.joinedTeams.map(team => (
        <Link to={`/teams/${team.id}`} key={team.id}
          className={`teamlist-link ${team.id == teamId ? 'current-team' : ''}`}>
          <div className='team-list-coverphoto'
            style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${team.id}")` }}>
          </div>
          {team.name}
        </Link>
      ))}
    </div>
  )
}
