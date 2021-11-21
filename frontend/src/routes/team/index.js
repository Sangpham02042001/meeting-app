import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Grid, Button, Dialog, DialogActions,
  DialogContent, Snackbar, Tooltip,
  Alert, IconButton
} from '@mui/material';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ImageIcon from '@mui/icons-material/Image';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  getTeamInfo, requestJoinTeam, refuseInvitations,
  confirmInvitations, cleanTeamState, getTeamMeetMess, getInvitedTeams
} from '../../store/reducers/team.reducer'
import { baseURL, socketClient, messageTimeDiff, getTime } from '../../utils'
import Loading from '../../components/Loading'
import './team.css'
import TeamHeader from '../../components/TeamHeader'
import TeamList from '../../components/TeamList'
import Message from '../../components/Message'
import MeetingItem from '../../components/MeetingItem';
import { v4 } from 'uuid'
import TeamInfo from '../../components/TeamInfo';


export default function Team(props) {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  let meetmess = useSelector(state => state.teamReducer.team.meetmess)
  let currentNumOfMeetMess = (meetmess || {}).length || 0
  const user = useSelector(state => state.userReducer.user)
  const dispatch = useDispatch()
  const history = useHistory()
  const [input, setInput] = useState('')
  const [filesMessage, setFilesMessage] = useState([]);
  const [filesMessageUrl, setFilesMessageUrl] = useState([]);
  const [isOpenEmojiList, setIsOpenEmojiList] = useState(false);
  const [offsetMeetmess, setOffsetMeetmess] = useState(0)
  const [isInvitedModalShow, setInvitedModalShow] = useState(false)
  const [isRequestModalShow, setRequestModalShow] = useState(false)
  const [isNotMemberModalShow, setNotMemmberModalShow] = useState(false)
  const [isTeamInfoShow, setTeamInfoShow] = useState(false)
  const [forceRender, setForceRender] = useState(v4())
  const [message, setMessage] = useState('')
  const teamBody = useRef()
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const speechReplyRef = useRef('');
  const voiceDetectRef = useRef(false);


  const [rows, setRows] = useState(1);
  const minRows = 1;
  const maxRows = 5;

  useEffect(() => {
    dispatch(getTeamInfo({ teamId }))
    dispatch(getTeamMeetMess({
      teamId,
      offset: 0,
      num: 15
    }))
    setOffsetMeetmess(15)

    // window.addEventListener('paste', e => {
    //   if (document.activeElement == inputRef.current) {
    //     if (e.clipboardData.files.length > 0) {
    //       let file = e.clipboardData.files[0]
    //       let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
    //       if (regex.test(file.name)) {
    //         s 
    //         let reader = new FileReader()
    //         reader.readAsDataURL(file)
    //         reader.onloadend = e => {
    //           setImageUrl([...imageUrl, reader.result])
    //         }
    //       }
    //     }
    //   }
    // })

    return () => {
      // socketClient.leave(`team ${teamId}`)
      socketClient.emit('out-team', { teamId })
      // dispatch(cleanTeamState())
      window.removeEventListener('paste', () => {
        console.log('remove events')
      })
    }
  }, [teamId])

  useEffect(() => {
    if (teamReducer.teamLoaded) {
      if (scrollRef.current) {
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [teamReducer.team.fakeMessageId])

  useEffect(() => {
    if (!teamReducer.invitedTeamLoaded) {
      dispatch(getInvitedTeams())
    }
  }, [teamReducer.invitedTeamLoaded])

  useEffect(() => {
    if (teamReducer.joinedTeams.map(team => team.id).indexOf(Number(teamId)) >= 0 && isInvitedModalShow && teamReducer.invitedTeamLoaded) {
      setInvitedModalShow(false)
      location.reload()
    }
  }, [teamReducer.joinedTeams.length])

  useEffect(() => {
    if (filesMessage.length) {
      setMessage({
        type: 'success',
        content: 'Upload file successfully'
      })
    }
  }, [filesMessage.length])

  const runSpeechRecognition = () => {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();

    recognition.onstart = function () {
      console.log('voice start')
      voiceDetectRef.current = true;
      setForceRender(v4());
    }


    recognition.onspeechend = function () {
      console.log('voice end')
      voiceDetectRef.current = false;
      setForceRender(v4());
      recognition.stop();
    }

    recognition.onerror = function (event) {
      speechReplyRef.current = 'Error occurred in recognition: ' + event.error;
      voiceDetectRef.current = false;
      setForceRender(v4());
      recognition.stop();
    }

    recognition.onresult = function (event) {
      let transcript = event.results[0][0].transcript;
      let confidence = event.results[0][0].confidence;
      console.log(transcript, confidence * 100 + '%')
      if (confidence > 0.6) {
        if (transcript.length) {
          setInput(transcript)
        }
      } else {
        speechReplyRef.current = "Could not understand!"
        setMessage({
          type: 'warning',
          content: 'Could not understand!'
        })
      }

    };

    recognition.start();
  }


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
    dispatch(confirmInvitations({
      teams: [teamReducer.team.id]
    }))
  }

  const handleCancelRequest = () => {
    setRequestModalShow(false)
  }

  const handleSendMessage = e => {
    e.preventDefault()
    if (!input && !filesMessage.length) {
      return
    }
    setIsOpenEmojiList(false)

    socketClient.emit("send-message-team", { teamId, senderId: user.id, content: input, files: filesMessage, senderName: user.firstName + ' ' + user.lastName });
    setInput('')
    setFilesMessage([]);
    setFilesMessageUrl([]);
    setRows(1)
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

  const getUserName = userId => {
    let user = teamReducer.team.members.find(user => user.id == userId)
    return (user || {}).userName || '';
  }

  const handleEnterMessage = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage(event);
      setInput('');
    }
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

  const onWriteMessage = (event) => {
    event.preventDefault()
    const textareaLineHeight = 24;

    const previousRows = event.target.rows;
    event.target.rows = minRows; // reset number of rows in textarea 
    const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

    if (currentRows === previousRows) {
      event.target.rows = currentRows;
    }

    if (currentRows >= maxRows) {
      event.target.rows = maxRows;
      event.target.scrollTop = event.target.scrollHeight;
    }
    setRows(currentRows < maxRows ? currentRows : maxRows)
    setInput(event.target.value);
  }

  const onFileInputChange = e => {
    e.preventDefault()
    if (e.target.files.length) {
      let size = 0;
      let filesUpload = []
      for (const file of e.target.files) {
        size += Math.round(file.size / 1024)
        console.log(file)
        filesUpload.push({
          type: file.type,
          name: file.name,
          data: file,
          size: file.size
        })
      }
      for (const file of filesMessage) {
        size += Math.round(file.size / 1024)
      }

      if (size > 5120) {
        setMessage({
          type: 'error',
          message: 'Could not upload file > 5MB !'
        })
        return
      }
      setFilesMessage([...filesMessage, ...filesUpload]);
      let urls = []
      for (const file of e.target.files) {
        let url = URL.createObjectURL(file)
        urls.push({
          type: /image\/(?!svg)/.test(file.type) ? 'image' : 'file',
          url,
          name: file.name
        })
      }
      setFilesMessageUrl([...filesMessageUrl, ...urls])
    }
  }


  return (teamReducer.teamLoaded && <Grid container>
    <Grid item sm={2} style={{ padding: 0, zIndex: 3, boxShadow: '2px 2px 10px var(--gray-shadow)' }}>
      <TeamList />
    </Grid>
    <Grid item sm={10} style={{ padding: 0 }}>
      <TeamHeader showTeamInfo={showTeamInfo} />
      {teamReducer.teamLoaded && <div className="team-container">
        <div className="team-body" ref={teamBody}
          // onClick={e => { e.preventDefault(); setIsOpenEmojiList(false) }}
          style={{ width: isTeamInfoShow ? '70%' : '100%', position: 'relative' }}>
          {currentNumOfMeetMess !== 0 && <div className='team-message-list' onScroll={handleMessageScroll}
            ref={scrollRef} style={{
              height: teamBody.current && teamBody.current.offsetHeight ?
                teamBody.current.offsetHeight - (filesMessageUrl.length ? 170 : 50) - (rows - 1) * 24 : '560px'
            }}>
            {currentNumOfMeetMess && meetmess.slice(0, currentNumOfMeetMess - 1)
              .map((item, idx) => (item.isMessage ? <div key={'message' + item.id}>
                {idx === 0 && <div className='time-text'>
                  <span>
                    {getTime(meetmess[idx].createdAt)}
                  </span>
                </div>}
                {idx === 0 && meetmess[idx].isMessage && meetmess[idx].userId !== user.id
                  && <p style={{
                    margin: 0,
                    paddingLeft: '40px',
                    color: 'gray'
                  }}>{getUserName(meetmess[idx].userId)}</p>}
                <Message message={item}
                  logInUserId={user.id}
                  userName={(item.userId != meetmess[idx + 1].userId || idx === 0) ? getUserName(item.userId) : ''}
                  hasAvatar={item.userId != meetmess[idx + 1].userId} />
                {meetmess[idx + 1].isMessage && messageTimeDiff(meetmess[idx + 1].createdAt, meetmess[idx].createdAt) && idx !== 0
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
            {filesMessageUrl.length > 0 &&
              <div className='image-message-upload'>
                {
                  filesMessageUrl.map((fileUrl, idx) => {
                    return (
                      <div key={idx}
                        style={{
                          position: 'relative'
                        }}>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            right: '-8px',
                            top: '-8px',
                            zIndex: '10',
                            width: '24px',
                            height: '24px',
                            color: '#fff',
                            background: '#3e4042 !important'
                          }}
                          onClick={e => {
                            e.preventDefault()
                            setFilesMessage(files => {
                              let tmpArr = [...files];
                              tmpArr.splice(idx, 1);
                              return tmpArr;
                            })
                            setFilesMessageUrl(filesUrl => {
                              let tmpArr = [...filesUrl];
                              tmpArr.splice(idx, 1);
                              return tmpArr;
                            })
                          }}>
                          <CloseIcon fontSize='small' />
                        </IconButton>
                        {fileUrl.type === 'image' ?
                          <img src={`${fileUrl.url}`} style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '15px'
                          }} />
                          : <div
                            style={{
                              background: '#fff',
                              borderRadius: '10px',
                              padding: '16px',
                              width: '160px',
                              height: '60px',
                              display: 'flex'
                            }}>
                            <DescriptionIcon />
                            <span style={{
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              fontWeight: '600'
                            }}>
                              {fileUrl.name}
                            </span>
                          </div>}
                      </div>
                    )
                  })}
                <Button>
                  <label style={{
                    cursor: 'pointer',
                  }}
                    htmlFor="files">
                    < AddCircleIcon fontSize="large" />
                  </label>
                  <input type="file"
                    onChange={onFileInputChange}
                    multiple="multiple"
                    id="files"
                    style={{
                      display: 'none'
                    }} />
                </Button>
              </div>
            }

            {isOpenEmojiList &&
              <div style={{
                position: 'absolute',
                top: filesMessage.length ? '-220px' : '-330px',
                right: '100px',
              }}>
                <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_MEDIUM_DARK} />
              </div>}

            <div className="search-team-box">
              <div style={{
                marginLeft: isTeamInfoShow ? '3%' : '5%',
                width: '100%',
                marginRight: input.length ? '3%' : 0
              }}>
                <textarea
                  variant="outlined"
                  type="text" placeholder="Chat"
                  className='team-message-input' name='message'
                  autoComplete="off"
                  ref={inputRef}
                  rows={rows}
                  value={input}
                  onKeyDown={handleEnterMessage}
                  onClick={e => { e.preventDefault(); setIsOpenEmojiList(false) }}
                  onChange={onWriteMessage} />
                <Tooltip title="Choose an emoji">
                  <Button onClick={chooseEmoji} className='emoji-btn' >
                    <InsertEmoticonIcon />
                  </Button>
                </Tooltip>
              </div>
              <div className="input-list-btn" >
                <div style={{ display: input.length ? 'none' : 'flex' }}>
                  <Tooltip title="Attach photos">
                    <IconButton >
                      <label style={{
                        cursor: 'pointer',
                        display: 'flex'
                      }}
                        htmlFor="photos">
                        <ImageIcon color='success' />
                      </label>
                      <input type="file" accept='image/*'
                        onChange={onFileInputChange}
                        multiple="multiple"
                        id="photos"
                        style={{
                          display: 'none'
                        }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Attach a file">
                    <IconButton >
                      <label style={{
                        cursor: 'pointer',
                        display: 'flex'
                      }}
                        htmlFor="files">
                        <AttachFileIcon color="primary" />
                      </label>
                      <input type="file"
                        onChange={onFileInputChange}
                        multiple="multiple"
                        id="files"
                        style={{
                          display: 'none'
                        }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Speech to text">
                    <IconButton onClick={runSpeechRecognition}>
                      {voiceDetectRef.current ?
                        <MicNoneIcon style={{ color: "#1A73E8" }} />
                        :
                        <MicIcon style={{ color: "#1A73E8" }} />
                      }
                    </IconButton>
                  </Tooltip>
                </div>
                <Tooltip title="Send message">
                  <div>
                    <IconButton variant="text" onClick={handleSendMessage}
                      disabled={!input && !filesMessage.length}>
                      <SendIcon style={{ color: "#1A73E8" }} />
                    </IconButton>
                  </div>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
        {<div className="team-info-container" style={{
          width: isTeamInfoShow ? '30%' : '0px',
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
          <TeamInfo />
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

    <Snackbar open={message.content && message.content.length > 0} autoHideDuration={3000} onClose={e => setMessage({})}>
      <Alert severity={message.type}>
        {message.content}
      </Alert>
    </Snackbar>
  </Grid>
  )
}
