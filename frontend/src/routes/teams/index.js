import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Row, Col, Container, Image } from 'react-bootstrap';
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
			<Container fluid style={{ padding: '0 20px', backgroundColor: '#f0f0f0' }}>
				<Row>
					<Col className="teams-header" sm={12}>
						<h3>Teams</h3>
						<Link to='/teams/discover'>
							<Button variant="light">
								<i className="fas fa-user-friends" style={{ marginRight: '10px' }}></i>
								Join or create team
							</Button>
						</Link>
					</Col>
				</Row>
				<Row>
					<div className="team-list">
						{teamReducer.joinedTeams.map(team => (
							<Link key={team.id} className="team-item" to={`/teams/${team.id}`}>
								<div className='team-item-image'
									style={{ backgroundImage: `url("${baseURL}/api/team/coverphoto/${team.id}")` }}>
								</div>
								<h5>{team.name}</h5>
							</Link>
						))}
					</div>
				</Row>
			</Container>
		</>
	)
}
