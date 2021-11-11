import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Grid, Button, Dialog, DialogActions,
  DialogContent, IconButton, Tooltip,

} from '@mui/material';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ImageIcon from '@mui/icons-material/Image';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import {
  getTeamInfo, requestJoinTeam, refuseInvitations,
  confirmInvitations, getTeamMessages, cleanTeamState,
  sendMessage, getTeamMeetMess
} from '../../store/reducers/team.reducer'
import { baseURL, broadcastLocal, socketClient, messageTimeDiff } from '../../utils'
import Loading from '../../components/Loading'
import './team.css'
import TeamHeader from '../../components/TeamHeader'
import TeamList from '../../components/TeamList'
import Message from '../../components/Message'
import MeetingItem from './MeetingItem';


export default function Team(props) {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  let meetmess = useSelector(state => state.teamReducer.team.meetmess)
  let currentNumOfMeetMess = (meetmess || {}).length || 0
  const user = useSelector(state => state.userReducer.user)
  const dispatch = useDispatch()
  const history = useHistory()
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [isOpenEmojiList, setIsOpenEmojiList] = useState(false);
  const [imageUrl, setImageUrl] = useState('')
  const [offsetMeetmess, setOffsetMeetmess] = useState(0)
  const [isInvitedModalShow, setInvitedModalShow] = useState(false)
  const [isRequestModalShow, setRequestModalShow] = useState(false)
  const [isNotMemberModalShow, setNotMemmberModalShow] = useState(false)
  const [isTeamInfoShow, setTeamInfoShow] = useState(true)
  const teamBody = useRef()
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    dispatch(getTeamInfo({ teamId }))
    dispatch(getTeamMeetMess({
      teamId,
      offset: 0,
      num: 15
    }))
    setOffsetMeetmess(15)

    window.addEventListener('paste', e => {
      if (document.activeElement == inputRef.current) {
        if (e.clipboardData.files.length > 0) {
          let file = e.clipboardData.files[0]
          let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
          if (regex.test(file.name)) {
            setImage(file)
            let reader = new FileReader()
            reader.readAsDataURL(file)
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
      // dispatch(cleanTeamState())
      setOffsetMeetmess(0)
      setImageUrl('')
      setImage('')
      window.removeEventListener('paste', () => {
        console.log('remove events')
      })
    }
  }, [teamId])

  useEffect(() => {
    if (teamReducer.teamLoaded) {
      if (scrollRef.current) {
        console.log(scrollRef.current.scrollHeight)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
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
      if (teamReducer.team.members.length && teamReducer.team.members.every(u => u.id != user.id)) {
        // if (teamReducer.team.teamType === 'private') {
        history.push('/teams')
        // }
        // setNotMemmberModalShow(true)
      }
      teamBody.current && teamBody.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [teamReducer.teamLoaded])

  useEffect(() => {
    if (scrollRef.current) { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }
  }, [currentNumOfMeetMess])

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
      teams: [teamReducer.team.id]
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
    setIsOpenEmojiList(false)
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
    if (teamReducer.team.numOfMeetMess > currentNumOfMeetMess && e.target.scrollTop === 0) {
      dispatch(getTeamMeetMess({
        teamId,
        offset: offsetMeetmess,
        num: 15
      }))
      setOffsetMeetmess(offsetMeetmess + 15)
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

  const getUserName = userId => {
    let user = teamReducer.team.members.find(user => user.id == userId)
    return (user || {}).userName || '';
  }

  const chooseEmoji = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpenEmojiList(!isOpenEmojiList)
  }

  const onEmojiClick = (event, emojiObject) => {
    event.preventDefault()
    event.stopPropagation()
    setInput(input.concat(emojiObject.emoji))
  };

  return (teamReducer.teamLoaded && <Grid container>
    <Grid item sm={2} style={{ padding: 0, zIndex: 3, boxShadow: '2px 2px 10px var(--gray-shadow)' }}>
      <TeamList />
    </Grid>
    <Grid item sm={10} style={{ padding: 0 }}>
      <TeamHeader showTeamInfo={showTeamInfo} />
      {teamReducer.teamLoaded && <div className="team-container">
        <div className="team-body" ref={teamBody}
          // onClick={e => { e.preventDefault(); setIsOpenEmojiList(false) }}
          style={{ width: isTeamInfoShow ? '80%' : '100%', position: 'relative' }}>
          {currentNumOfMeetMess !== 0 && <div className='team-message-list' onScroll={handleMessageScroll}
            ref={scrollRef} style={{
              height: teamBody.current && teamBody.current.offsetHeight ?
                teamBody.current.offsetHeight - (imageUrl ? 170 : 50) : '560px'
            }}>
            {currentNumOfMeetMess && meetmess.slice(0, currentNumOfMeetMess - 1)
              .map((item, idx) => (item.isMessage ? <div key={'message' + item.id}>
                <Message message={item}
                  logInUserId={user.id}
                  userName={item.userId != meetmess[idx + 1].userId ? getUserName(item.userId) : ''}
                  hasAvatar={item.userId != meetmess[idx + 1].userId} />
                {messageTimeDiff(meetmess[idx + 1].createdAt, meetmess[idx].createdAt)
                  && <div className='time-text'>
                    <span>
                      {messageTimeDiff(meetmess[idx + 1].createdAt, meetmess[idx].createdAt)}
                    </span>
                  </div>}
                {meetmess[idx + 1].isMessage && meetmess[idx + 1].userId != item.userId
                  && meetmess[idx + 1].userId !== user.id
                  && <p style={{
                    margin: 0,
                    paddingLeft: '40px',
                    color: 'gray'
                  }}>{getUserName(meetmess[idx + 1].userId)}</p>}
              </div> :
                <MeetingItem key={'meeting' + item.id} meeting={item} />
              ))}
            {currentNumOfMeetMess && (meetmess[currentNumOfMeetMess - 1].isMessage ?
              <Message message={meetmess[currentNumOfMeetMess - 1]}
                logInUserId={user.id} userName={getUserName(meetmess[currentNumOfMeetMess - 1].userId)}
                hasAvatar={true} lastMessage={true} />
              : <MeetingItem key={'meeting' + meetmess[currentNumOfMeetMess - 1].id} meeting={meetmess[currentNumOfMeetMess - 1]} />)}
          </div>}

          <form onSubmit={handleSendMessage}
            style={{ position: "absolute", left: 0, bottom: '2px', width: '100%' }}>
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

            {isOpenEmojiList &&
              <div style={{
                position: 'absolute',
                top: '-330px',
                right: '100px',
              }}>
                <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_MEDIUM_DARK} />
              </div>}

            <div className="search-team-box">
              <input
                variant="outlined"
                type="text" placeholder="Chat"
                className='team-message-input' name='message'
                autoComplete="off"
                ref={inputRef}
                value={input}
                onClick={e => { e.preventDefault(); setIsOpenEmojiList(false) }}
                onChange={e => setInput(e.target.value)} />
              <div className="input-list-btn" >
                <Tooltip title="Attach a photo">
                  <Button>
                    <label htmlFor="images" className='send-image-label'>
                      <ImageIcon color='success' />
                      {/* <i style={{ color: "#69B00B" }} className="fas fa-image"></i> */}
                    </label>
                    <input type="file" accept='image/*'
                      onChange={handleImageInputChange}
                      id="images" style={{
                        display: 'none'
                      }} />
                  </Button>
                </Tooltip>
                <Tooltip title="Choose an emoji">
                  <Button onClick={chooseEmoji} >
                    <InsertEmoticonIcon color='secondary' />
                  </Button>
                </Tooltip>
                <Tooltip title="Send message">
                  <Button variant="text" onClick={handleSendMessage}
                    style={{ padding: 0 }}>
                    <SendIcon style={{ color: "#1A73E8" }} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
        {<div className="team-info-container" style={{
          width: isTeamInfoShow ? '24%' : '0px',
          paddingLeft: 0
        }}>
          <div className='arrow-expand-container' onClick={e => {
            e.preventDefault()
            setTeamInfoShow(!isTeamInfoShow)
          }}>
            <Tooltip title={isTeamInfoShow ? 'Hide team info' : "Show team info"}>
              <KeyboardArrowRightIcon className={isTeamInfoShow ? 'arrow-rotate' : 'arrow-rotate-reverse'} />
            </Tooltip>
          </div>
          <div style={{ padding: '10px 0' }}>
            <strong>About</strong>
            <p style={{ paddingLeft: '10px' }}>{teamReducer.team.name}</p>

            <strong>Members ({teamReducer.team.members.length})</strong>
            {teamReducer.team.members.slice(0, 5).map(member => (
              <span key={`member ${member.id}`}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', paddingLeft: '10px' }}>
                <div className='team-info-user-avatar'
                  style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${member.id}")` }}>
                </div>
                <p style={{ marginBottom: 0 }}>{member.userName}</p>
              </span>
            ))}
            {teamReducer.team.members.length > 5 && <Link to="#">
              See all members
            </Link>}
          </div>
        </div>}
      </div>}
    </Grid>


    <Dialog open={isInvitedModalShow} onClose={handleCloseInvitedModal}>
      <DialogContent>You are invited to join this team</DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleRefuseInvitation}>
          Refuse
        </Button>
        <Button variant="text" onClick={handleConfirmInvitation}>
          Agree
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={isNotMemberModalShow}>
      <DialogContent>You aren't member of this team. Request to join this team ?</DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleCloseNotMemberModal}>
          No
        </Button>
        <Button variant="text" onClick={handleRequestJoin}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={isRequestModalShow}>
      <DialogContent>You are requesting to join this team. Wait for the admin approve you request ?</DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleCancelRequest}>
          Cancel Request
        </Button>
        <Button variant="text" onClick={handleCloseRequestModal}>
          Back to My teams
        </Button>
      </DialogActions>
    </Dialog>
  </Grid>
  )
}
