import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid } from '@mui/material'
import './teams.css';
import { Link } from 'react-router-dom';
import { getJoinedTeams } from '../../store/reducers/team.reducer';
import { baseURL } from '../../utils';

export default function Teams(props) {
	const teamReducer = useSelector(state => state.teamReducer)
	const dispatch = useDispatch()

	useEffect(() => {
		if (!teamReducer.joinedTeamLoaded) {
			dispatch(getJoinedTeams())
		}
	}, [])

	return (
		<>
			<Grid container style={{ padding: '0 20px', backgroundColor: '#f0f0f0' }}>
				<Grid item sm={12}>
					<div className="teams-header">
						<h3>Teams</h3>
						<Link to='/teams/discover' style={{ textDecoration: 'none' }}>
							<Button variant="text">
								<i className="fas fa-user-friends" style={{ marginRight: '10px' }}></i>
								Join or create team
							</Button>
						</Link>
					</div>
					<div className="team-list">
						{teamReducer.joinedTeams.map(team => (
							<span key={team.id} className="team-item">
								<Link to={`/teams/${team.id}`}>
									<div className='team-item-image'
										style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${team.id}")` }}>
									</div>
									<h5>{team.name}</h5>
								</Link>
							</span>
						))}
					</div>
				</Grid>
			</Grid>
		</>
	)
}
