import React from 'react';
import { Button, Row, Col, Container } from 'react-bootstrap';
import './teams.css';
import { v1 as uuid } from 'uuid';
import { Link } from 'react-router-dom';

export default function Teams(props) {
	const id = uuid();
	return (
		<>
			{/* <div className="layout-leftside-list">
                <div className="group-chat">
                    <div>Avatar</div>
                    <div style={{ marginLeft: "15px" }}>
                        <div>
                            Group
                        </div>
                        <div>content </div>
                    </div>
                </div>
                <div className="group-chat">
                    <div>Avatar</div>
                    <div style={{ marginLeft: "15px" }}>
                        <div>
                            Group
                        </div>
                        <div>
                            content

                        </div>
                    </div>
                </div>
            </div>
            <div className="group-chat-content">
                <h2>Content</h2>
                <div className="btn-list-selection">
                    <Button href={`/meeting/${id}`} style={{ color: "black" }}>
                        Start
                    </Button>
                </div>
            </div>
            <div className="member-group">
                <div>
                    member 1
                </div>
                <div>
                    memeber 2
                </div>
                <div>
                    member 3
                </div>
                <div>
                    memeber 4
                </div>
                <div>
                    memeber 5
                </div>
            </div> */}
			<Container fluid>
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
			</Container>
		</>
	)
}
