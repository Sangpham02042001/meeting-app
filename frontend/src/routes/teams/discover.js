import React, { useState, useEffect } from 'react'
import {
  Col, Container, Image, Row, Button,
  Modal, Form
} from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function TeamDiscover() {
  const [teamName, setTeamName] = useState('')
  const [isPublicTeam, setPublicTeam] = useState(true)
  const [teamCoverPhoto, setTeamCoverPhoto] = useState('');
  const [isCreateModalShow, setCreateModalShow] = useState(false)

  const handleCreateModalClose = () => {
    setCreateModalShow(false)
    setTeamName('')
    setPublicTeam(true)
    setTeamCoverPhoto('')
  }

  const handleCreateTeam = () => {
    setCreateModalShow(true)
  }

  const handleTeamCoverPhoto = (e) => {
    setTeamCoverPhoto(e.target.files[0])
    console.log(e.target.files[0])
  }

  return (
    <Container fluid>
      <Row style={{ padding: '15px' }}>
        <Col sm={12}>
          <Link to='/teams' style={{ color: '#000', textDecoration: 'none' }}>
            &lt; &nbsp;Back
          </Link>
        </Col>
        <Col style={{ marginTop: '10px' }} sm={12}>
          <h3>Join or create a team</h3>
        </Col>
        <Col sm={12}>
          <div className='create-team-box'>
            <Image className="create-team-empty-img" src="/teamimage-empty.svg" alt="Team Image" />
            <h5>Create Team</h5>
            <div style={{ marginBottom: '15px' }}>
              <Image className='create-team-box-user' src="/create-team-user1.svg" alt="Team Image" />
              <Image className='create-team-box-user' src="/create-team-user2.svg" alt="Team Image" />
              <Image className='create-team-box-user' src="/create-team-user3.svg" alt="Team Image" />
            </div>
            <Button variant="primary" style={{ backgroundColor: '#364087' }} onClick={handleCreateTeam}>
              <i className="fas fa-user-friends" style={{ marginRight: '10px' }}></i>
              Create team
            </Button>
          </div>
        </Col>
      </Row>
      <Modal show={isCreateModalShow} onHide={handleCreateModalClose} size="lg" centered>
        <Modal.Body>
          <h4>Create your team</h4>
          <p>Collaborate closely with a group of people inside your
            organization based on project, initiative, or common interest.</p>
          <Form.Group className="mb-3" controlId="formTeamName">
            <Form.Label>Team name</Form.Label>
            <Form.Control type="text" placeholder="Enter you team's name"
              value={teamName} onChange={e => setTeamName(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTeamPrivacy">
            <Form.Label>Privacy</Form.Label>
            <Form.Select aria-label="Default select example"
              onChange={e => setPublicTeam(e.target.value)}>
              <option value={true}>Public - Anyone can request to join and find this team</option>
              <option value={false}>Private - Only team owners can add members</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTeamCoverPhoto">
            <Form.Label>Team Cover Photo</Form.Label> <br />
            {/* <input
              type="file" accept="image/*"
              value={teamCoverPhoto}
              onChange={(e) => setTeamCoverPhoto(e.target.files[0])}
            /> */}
            <Form.Control
              type="file"
              accept='image/*'
              onChange={(e) => setTeamCoverPhoto(e.target.files[0])}
              required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCreateModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateModalClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
