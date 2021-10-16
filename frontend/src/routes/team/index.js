import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Container, Modal, Button, Row, Col,
  Form, Tooltip, OverlayTrigger, Image
} from 'react-bootstrap'
import {
  getTeamInfo, requestJoinTeam, refuseInvitations,
  confirmInvitations, getTeamMessages, cleanTeamState,
  sendMessage
} from '../../store/reducers/team.reducer'
import { baseURL, broadcastLocal, socketClient } from '../../utils'
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
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [scrollThreshold, setScrollThreshold] = useState(0)
  const [offsetMessages, setOffsetMessages] = useState(0)
  const [isInvitedModalShow, setInvitedModalShow] = useState(false)
  const [isRequestModalShow, setRequestModalShow] = useState(false)
  const [isNotMemberModalShow, setNotMemmberModalShow] = useState(false)
  const [isTeamInfoShow, setTeamInfoShow] = useState(true)
  const teamBody = useRef()
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    dispatch(getTeamInfo({ teamId }))
    dispatch(getTeamMessages({
      teamId,
      offset: offsetMessages,
      num: 15
    }))


    window.addEventListener('paste', e => {
      if (document.activeElement == inputRef.current) {
        if (e.clipboardData.files.length > 0) {
          let file = e.clipboardData.files[0]
          let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
          if (regex.test(file.name)) {
            setImage(file)
            let reader = new FileReader()
            let url = reader.readAsDataURL(file)
            reader.onloadend = e => {
              setImageUrl(reader.result)
            }
          }
        }
      }
    })
    return () => {
      // socketClient.leave(`team ${teamId}`)
      socketClient.emit('out-team', { teamId })
      dispatch(cleanTeamState())
      setOffsetMessages(0)
      setImageUrl('')
      setImage('')
      window.removeEventListener('paste', () => {
        console.log('remove events')
      })
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
      teamBody.current && teamBody.current.scrollIntoView({ behavior: "smooth" })
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
    if (!input && !image) {
      return
    }
    let formData = new FormData()
    input && formData.append('content', input)
    image && formData.append('photo', image)
    // dispatch(sendMessage({
    //   data: formData,
    //   teamId
    // }))

    socketClient.emit("send-message-team", { teamId, senderId: user.id, content: input, image });
    broadcastLocal.postMessage({ teamId, senderId: user.id, content: input, image })
    setInput('')
    setImageUrl('')
    setImage('')
  }

  const handleMessageScroll = e => {
    if (teamReducer.team.numOfMessages > currentNumOfMessages && e.target.scrollTop === 0) {
      dispatch(getTeamMessages({
        teamId,
        offset: offsetMessages + 15,
        num: 15
      }))
      setOffsetMessages(offsetMessages + 15)
    }
  }

  const handleImageInputChange = e => {
    // e.preventDefault()
    console.log(e.target.files[0])
    setImage(e.target.files[0])
    let reader = new FileReader()
    let url = reader.readAsDataURL(e.target.files[0])
    reader.onloadend = e => {
      setImageUrl(reader.result)
    }
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
                {currentNumOfMessages !== 0 && <div className='team-message-list' onScroll={handleMessageScroll}
                  ref={scrollRef} style={{
                    maxHeight: teamBody.current && teamBody.current.offsetHeight ?
                      teamBody.current.offsetHeight - (imageUrl ? 160 : 40) : '560px'
                  }}>
                  {currentNumOfMessages && teamReducer.team.messages.slice(0, currentNumOfMessages - 1)
                    .map((message, idx) => (
                      <Message message={message} key={'message' + message.id}
                        logInUserId={user.id}
                        hasAvatar={message.userId != teamReducer.team.messages[idx + 1].userId} />
                    ))}
                  {currentNumOfMessages && <Message message={teamReducer.team.messages[currentNumOfMessages - 1]}
                    logInUserId={user.id}
                    hasAvatar={true} lastMessage={true} />}
                </div>}
                <Form onSubmit={handleSendMessage}
                  style={{ position: "absolute", left: 0, bottom: 0, width: '100%' }}>
                  {imageUrl && <div className='image-message-upload'>
                    <div style={{
                      backgroundImage: `url("${imageUrl}")`
                    }}>
                    </div>
                    <i className="far fa-times-circle remove-image-btn"
                      onClick={e => {
                        e.preventDefault()
                        setImageUrl('')
                        setImage(null);
                      }}></i>
                  </div>}
                  <Form.Group className="search-team-box" controlId="formUsers">
                    <Form.Control type="text" placeholder="Chat"
                      className='team-message-input' name='message'
                      autoComplete="off"
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)} />
                  </Form.Group>
                  <div className="input-list-btn" style={{
                    top: imageUrl ? '120px' : 0
                  }}>
                    <label htmlFor="images" className='send-image-label'>
                      <i style={{ color: "#69B00B" }} className="fas fa-image"></i>
                    </label>
                    <input type="file" accept='image/*'
                      onChange={handleImageInputChange}
                      id="images" style={{
                        display: 'none'
                      }} />
                    <Button variant="outline-light" onClick={handleSendMessage}>
                      <i style={{ color: "#1A73E8" }} className="fas fa-thumbs-up"></i>
                    </Button>
                  </div>
                </Form>
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
