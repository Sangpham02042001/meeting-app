import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Container, Modal, Button, Row, Col,
  Form, Tooltip, OverlayTrigger
} from 'react-bootstrap'
import {
  getTeamInfo, requestJoinTeam, refuseInvitations,
  confirmInvitations, getTeamMessages, cleanTeamState,
  sendMessage
} from '../../store/reducers/team.reducer'
import { baseURL, socketClient } from '../../utils'
import Loading from '../../components/Loading'
import './team.css'
import TeamHeader from '../../components/TeamHeader'
import TeamList from '../../components/TeamList'
import Message from '../../components/Message'

export default function Team(props) {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  const currentNumOfMessages = useSelector(state => state.teamReducer.team.messages.length)
  const user = useSelector(state => state.userReducer.user)
  const dispatch = useDispatch()
  const history = useHistory()
  const [input, setInput] = useState('')
  const [offsetMessages, setOffsetMessages] = useState(0)
  const [isInvitedModalShow, setInvitedModalShow] = useState(false)
  const [isRequestModalShow, setRequestModalShow] = useState(false)
  const [isNotMemberModalShow, setNotMemmberModalShow] = useState(false)
  const [isTeamInfoShow, setTeamInfoShow] = useState(true)
  const messageList = useRef()
  const teamBody = useRef()

  useEffect(() => {
    // socketClient.join(`team ${teamId}`)
    dispatch(getTeamInfo({ teamId }))
    dispatch(getTeamMessages({
      teamId,
      offset: offsetMessages,
      num: 10
    }))
    console.log(teamBody.current.offsetHeight)
    return () => {
      // socketClient.leave(`team ${teamId}`)
      dispatch(cleanTeamState())
    }
  }, [teamId])

  useEffect(() => {
    if (teamReducer.teamLoaded) {
      if (!teamReducer.team.name) {
        history.push('/notfound')
      }
      if (teamReducer.team.invitedUsers.some(u => u.id == user.id)) {
        setInvitedModalShow(true)
        return
      }
      if (teamReducer.team.requestUsers.some(u => u.id == user.id)) {
        history.push('/teams')
        return
      }
      if (teamReducer.team.members.every(u => u.id != user.id)) {
        // if (teamReducer.team.teamType === 'private') {
        history.push('/teams')
        // }
        // setNotMemmberModalShow(true)
      }
      messageList.current && messageList.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [teamReducer.teamLoaded])

  const handleCloseInvitedModal = () => {
    setInvitedModalShow(false)
    history.push('/teams')
  }

  const handleCloseNotMemberModal = () => {
    setNotMemmberModalShow(false)
    history.push('/teams')
  }

  const handleCloseRequestModal = () => {
    setRequestModalShow(false)
    history.push('/teams')
  }

  const showTeamInfo = () => {
    setTeamInfoShow(!isTeamInfoShow)
  }

  const handleRequestJoin = e => {
    e.preventDefault()
    dispatch(requestJoinTeam({
      team: {
        id: teamReducer.team.id,
        name: teamReducer.team.name,
        hostId: teamReducer.team.hostId
      }
    }))
  }

  const handleRefuseInvitation = () => {
    setInvitedModalShow(false)
    dispatch(refuseInvitations({
      teams: [teamReducer.team.id]
    }))
    history.push('/teams')
  }

  const handleConfirmInvitation = () => {
    setInvitedModalShow(false)
    dispatch(confirmInvitations({
      teams: [{
        id: teamReducer.team.id,
        name: teamReducer.team.name,
        hostId: teamReducer.team.hostId
      }]
    }))
  }

  const handleCancelRequest = () => {
    setRequestModalShow(false)
  }

  const handleSendMessage = e => {
    e.preventDefault()
    console.log(input)
    dispatch(sendMessage({
      content: input,
      teamId
    }))
    setInput('')
  }

  const handleMessageScroll = e => {
    // console.log(e)
  }

  return (
    teamReducer.loading ? <Loading />
      :
      <Container fluid>
        <Row>
          <Col sm={2} style={{ padding: 0 }}>
            <TeamList />
          </Col>
          <Col style={{ padding: 0 }}>
            <TeamHeader showTeamInfo={showTeamInfo} />
            <div className="team-container">
              <div className="team-body" ref={teamBody}
                style={{ width: isTeamInfoShow ? '80%' : '100%', position: 'relative' }}>
                {currentNumOfMessages && <div className='team-message-list' onScroll={handleMessageScroll}
                  ref={messageList} style={{
                    height: teamBody.current && teamBody.current.offsetHeight ? teamBody.current.offsetHeight : 'auto'
                  }}>
                  {currentNumOfMessages && teamReducer.team.messages.slice(0, currentNumOfMessages - 1)
                    .map((message, idx) => (
                      <Message message={message} key={message.id}
                        logInUserId={user.id}
                        hasAvatar={message.userId != teamReducer.team.messages[idx + 1].userId} />
                    ))}
                  {currentNumOfMessages && <Message message={teamReducer.team.messages[currentNumOfMessages - 1]}
                    logInUserId={user.id}
                    hasAvatar={true} lastMessage={true} />}
                </div>}
                <div className="team-body-inner">
                  <Form onSubmit={handleSendMessage}
                    style={{ position: "absolute", left: 0, bottom: 0, width: '100%' }}>
                    <Form.Group className="search-team-box" controlId="formUsers">
                      <Form.Control type="text" placeholder="Chat"
                        className='team-message-input' name='message'
                        autoComplete="off"
                        value={input} onChange={e => setInput(e.target.value)} />
                      <i className="fas fa-search" style={{ cursor: 'pointer' }}></i>
                    </Form.Group>
                  </Form>
                </div>
              </div>
              {isTeamInfoShow && <div className="team-info-container">
                <strong>About</strong>
                <p>{teamReducer.team.name}</p>

                <strong>Members ({teamReducer.team.members.length})</strong>
                {teamReducer.team.members.slice(0, 5).map(member => (
                  <span key={`member ${member.id}`}
                    style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div className='team-info-user-avatar'
                      style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${member.id}")` }}>
                    </div>
                    <p style={{ marginBottom: 0 }}>{member.userName}</p>
                  </span>
                ))}
                {teamReducer.team.members.length > 5 && <Link to="#">
                  See all members
                </Link>}
              </div>}
            </div>
          </Col>
        </Row>


        <Modal show={isInvitedModalShow} onHide={handleCloseInvitedModal}>
          <Modal.Body>You are invited to join this team</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleRefuseInvitation}>
              Refuse
            </Button>
            <Button variant="primary" onClick={handleConfirmInvitation}>
              Agree
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={isNotMemberModalShow}>
          <Modal.Body>You aren't member of this team. Request to join this team ?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseNotMemberModal}>
              No
            </Button>
            <Button variant="primary" onClick={handleRequestJoin}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={isRequestModalShow}>
          <Modal.Body>You are requesting to join this team. Wait for the admin approve you request ?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelRequest}>
              Cancel Request
            </Button>
            <Button variant="primary" onClick={handleCloseRequestModal}>
              Back to My teams
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  )
}
