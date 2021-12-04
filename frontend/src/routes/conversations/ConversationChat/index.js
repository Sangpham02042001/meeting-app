import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import Message from '../../../components/Message';
import Avatar from '../../../components/Avatar';
import {
  Button, IconButton, Tooltip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Typography,
  Snackbar, Alert, ImageList, ImageListItem, Badge, FormControlLabel,
  LinearProgress
} from '@mui/material';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion from '@mui/material/Accordion';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import ImageIcon from '@mui/icons-material/Image';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CancelIcon from '@mui/icons-material/Cancel';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import 'emoji-mart/css/emoji-mart.css'
import { Picker, emojiIndex } from 'emoji-mart';
import {
  socketClient, baseURL, emotionRegex,
  timeDiff, messageTimeDiff, getFileSize, getConnectedDevices
} from '../../../utils';
import {
  getMessages, readConversation, startCall, cancelCall, getAllImages,
  getParticipant, getAllFiles, getNumberMessageUnread
} from '../../../store/reducers/conversation.reducer';
import { toggleDarkMode } from '../../../store/reducers/setting.reducer'
import { v4 } from 'uuid';
import './conversationChat.css';
import PreviewImage from '../../../components/PreviewImage';
import SwitchDarkMode from '../../../components/SwitchDarkMode';
import Peer from 'simple-peer';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
  width: '100%'
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.5rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',

  '& .MuiAccordionSummary-expandIconWrapper.Mui-expandedPanel': {
    transform: 'rotate(180deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0),
}));

const requestRecorder = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  return new MediaRecorder(stream);
}


export default function ConversationChat({ conversation, user }) {
  const MAX_TIME_RECORD = 90;
  const minRows = 1;
  const maxRows = 8;

  const [content, setContent] = useState('');
  const [rows, setRows] = useState(1);
  const filePath = `${baseURL}/api/messages`;
  const [filesMessage, setFilesMessage] = useState([]);
  const [filesMessageUrl, setFilesMessageUrl] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [isOpenEmojiList, setIsOpenEmojiList] = useState(false);
  const [forceRender, setForceRender] = useState(v4());
  const [isPreview, setIsPreview] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedMessageId, setMessageId] = useState(null)
  const [selectedPhotoId, setPhotoId] = useState(null)
  const [messageAlert, setMessageAlert] = useState('')
  const [audioData, setAudioData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const [intervalTime, setIntervalTime] = useState(null);
  const [isEnableVideo, setIsEnableVideo] = useState(false);
  const [isEnableAudio, setIsEnableAudio] = useState(false);

  const conversationCall = useSelector(state => state.conversationReducer.conversationCall);
  const messages = useSelector(state => state.conversationReducer.conversation.messages);
  const images = useSelector(state => state.conversationReducer.conversation.images);
  const files = useSelector(state => state.conversationReducer.conversation.files);
  const settingReducer = useSelector(state => state.settingReducer)
  const scrollRef = useRef(null);
  const voiceDetectRef = useRef(false);

  const dispatch = useDispatch();
  const history = useHistory();


  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (recorder === null) {
      if (isRecording) {
        requestRecorder().then(setRecorder, (error) => {
          console.log(error);
        });
      }
      return;
    }

    // Manage recorder state.
    if (isRecording) {
      recorder.start();
    } else {
      recorder.stop();
      // setRecorder(null);
    }

    // Obtain the audio when ready.
    const handleData = e => {
      console.log(e.data)
      setAudioData(e.data);
    };

    recorder.addEventListener("dataavailable", handleData);
    return () => recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, isRecording]);

  useEffect(() => {
    if (showInfo) {
      dispatch(getAllImages({ conversationId }))
      dispatch(getAllFiles({ conversationId }))
    }

  }, [showInfo])

  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length])

  useEffect(() => {
    if (recordTime >= MAX_TIME_RECORD) {
      handleRecord()
    }
  }, [recordTime])

  useEffect(() => {
    let converId = conversation.conversationId;
    dispatch(getParticipant({ participantId: conversation.participantId }))
    dispatch(getMessages({ conversationId: converId }))
    dispatch(readConversation({ conversationId: converId }))
    setConversationId(converId)

    getConnectedDevices('videoinput', (cameras) => {
      if (cameras.length) setIsEnableVideo(true);
    })

    getConnectedDevices('audioinput', (audios) => {
      if (audios.length) setIsEnableAudio(true);
    })


  }, [conversation.conversationId])

  const onWriteMessage = (event) => {
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
    setContent(event.target.value);
  }

  const handleEnterMessage = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage(event);
      setContent('');
    }
  }

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (content !== '' || filesMessage.length) {
      let tContent = content;
      let emotions = [...tContent.matchAll(emotionRegex)];
      for (let emotion of emotions) {
        if (emotion) {
          let emojiList = emojiIndex.search(emotion[0]);
          if (emojiList.length) {
            console.log(emojiList)
            tContent = tContent.replace(emotion[0], emojiList[0].native)
          }
        }
      }

      console.log(user.userName)

      socketClient.emit('conversation-sendMessage', {
        content: tContent, senderId: user.id, receiverId: conversation.participantId, conversationId,
        files: filesMessage, senderName: user.userName
      });
      setContent('');
      setFilesMessage([]);
      setFilesMessageUrl([]);
      setRows(minRows);
    } else if (audioData) {
      setAudioData(null)
      setRecordTime(0);
      console.log(audioData)
      setRecordTime(0);
      socketClient.emit('conversation-sendMessage', {
        content: '', senderId: user.id, receiverId: conversation.participantId,
        conversationId, files: [], senderName: user.userName,
        audio: audioData
      });
    }
  }

  const onEmojiClick = (emojiObject) => {
    console.log(emojiObject);
    setContent(content.concat(emojiObject.native));
  };


  const handleVoiceCall = () => {
    let wWidth = document.body.clientWidth;
    let wHeight = document.body.clientHeight;
    let width = 900;
    let height = 700;

    window.open(`/public/#/room-call/conversation/${conversation.participantId}?type=audio&cvId=${conversationId}`,
      '_blank', `width=900,height=700,top=${wHeight / 2 - height / 2},left=${wWidth / 2 - width / 2}`);

    socketClient.emit('conversation-start-call', {
      conversationId, senderId: user.id, senderName: user.userName,
      receiverId: conversation.participantId, type: 'audio'
    });

    dispatch(startCall({ conversationId, senderId: user.id, senderName: user.userName, receiverId: conversation.participantId }))
  }

  const handleVideoCall = () => {
    let wWidth = document.body.clientWidth;
    let wHeight = document.body.clientHeight;
    let width = 900;
    let height = 700;

    window.open(`/public/#/room-call/conversation/${conversation.participantId}?type=video&cvId=${conversationId}`,
      '_blank', `width=900,height=700,top=${wHeight / 2 - height / 2},left=${wWidth / 2 - width / 2}`)
    socketClient.emit('conversation-start-call', {
      conversationId, senderId: user.id, senderName: user.userName,
      receiverId: conversation.participantId, type: 'video'
    });
    dispatch(startCall({ conversationId, senderId: user.id, senderName: user.userName, receiverId: conversation.participantId }))
  }

  const onFileInputChange = e => {
    e.preventDefault()
    if (e.target.files.length) {
      let size = 0;
      let filesUpload = []
      for (const file of e.target.files) {
        size += Math.round(file.size / 1024)
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

      console.log(size);
      if (size > 5120) {
        setMessageAlert('Could not upload file > 5MB !')
        return
      }
      setFilesMessage([...filesMessage, ...filesUpload]);
      let urls = []
      for (const file of e.target.files) {
        let url = URL.createObjectURL(file)
        urls.push({
          type: /image\/(?!svg)/.test(file.type) ? 'image' : 'file',
          url,
          name: file.name,
          size: getFileSize(file.size)
        })
      }
      setFilesMessageUrl([...filesMessageUrl, ...urls])
    }
  }

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
      voiceDetectRef.current = false;
      setForceRender(v4());
      setMessageAlert("Coundn't understand")
      recognition.stop();
    }

    recognition.onresult = function (event) {
      let transcript = event.results[0][0].transcript;
      let confidence = event.results[0][0].confidence;
      console.log(transcript, confidence * 100 + '%')
      if (confidence > 0.6 && transcript.length) {
        socketClient.emit('conversation-sendMessage', {
          content: transcript, senderId: user.id, receiverId: conversation.participantId,
          conversationId, files: [], senderName: user.userName
        });
      } else {
        setMessageAlert("Couldn't understand")
        setForceRender(v4());
      }

    };

    recognition.start();
  }

  const handlePreview = (event, messageId, photoId) => {
    event.preventDefault();
    setIsPreview(true);
    setMessageId(messageId)
    setPhotoId(photoId)
  }

  const handleRecord = () => {
    if (!isRecording) {
      let interval = setInterval(() => {
        setRecordTime(recordTime => {
          return recordTime += 1
        });

      }, 1000);
      setIntervalTime(interval);
    } else {
      setIntervalTime(clearInterval(intervalTime))
    }
    setIsRecording(!isRecording)
  }

  const handleCancelRecord = (e) => {
    e.preventDefault();
    setIsRecording(false);
    setRecorder(null);
    setAudioData(null);
    setIntervalTime(clearInterval(intervalTime))
    setRecordTime(0);
  }


  const getColorStatus = (status) => {
    if (status === 'active') {
      return 'success';
    } else if (status === 'sleep') {
      return 'warning';
    } else if (status === 'busy') {
      return 'error';
    } else if (status === 'inactive') {
      return 'info';
    }
  }

  const getStatusString = (status) => {
    if (status === 'active') {
      return 'Active now';
    } else if (status === 'sleep') {
      return 'Away';
    } else if (status === 'busy') {
      return 'Do not disturb';
    } else if (status === 'inactive') {
      return conversation.statusTime ? 'Last seen ' + timeDiff(conversation.statusTime).toLowerCase() : 'Offline';
    }
  }

  const getTimeRecord = (time) => {
    if (time < 10) {
      return `0:0${time}`
    } else if (time < 60) {
      return `0:${time}`
    } else {
      return `${Math.round(time / 60)}:${time - 60}`
    }
  }


  return (
    <>
      <div className="conversation-message" style={{ width: !showInfo ? '100%' : '75%' }} >
        <div className="header-message">
          <div className="header-left">
            <Badge
              badgeContent=" "
              variant="dot"
              color={getColorStatus(conversation.status)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              invisible={conversation.status === 'inactive'}
            >
              <Avatar width="40px" height="40px" userId={conversation.participantId} />
            </Badge>
            <div style={{ marginLeft: '15px' }}>
              <div className="header-name"><span>{conversation.participantName}</span></div>
              <div><span>{getStatusString(conversation.status)}</span></div>
            </div>

          </div>

          <div className="header-btn-list">
            {conversation.conversationId && <>
              <Tooltip title="Start a voice call">
                <IconButton onClick={handleVoiceCall}>
                  <Badge
                    badgeContent=" "
                    variant="dot"
                    color={getColorStatus(conversation.status)}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    overlap='circular'
                    invisible={conversation.status !== 'active'}
                  >
                    <PhoneIcon style={{ color: 'var(--icon-color)' }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              {isEnableVideo ?
                <Tooltip title="Start a video call">
                  <IconButton onClick={handleVideoCall}>
                    <VideocamIcon style={{ color: 'var(--icon-color)' }} />
                  </IconButton>
                </Tooltip>
                :
                <Tooltip title="You dont have camera">
                  <div>
                    <IconButton disabled>
                      <VideocamIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              }
            </>
            }
            <Tooltip title="Conversation info">
              <IconButton onClick={e => setShowInfo(!showInfo)}>
                <InfoIcon style={{ color: 'var(--icon-color)' }} />
              </IconButton>
            </Tooltip>

          </div>

        </div>
        <div className="content-message" ref={scrollRef}
          onClick={e => {
            // e.preventDefault();
            setIsOpenEmojiList(false);
          }}>
          <div className="info-beginner-content">
            <Avatar width="80px" height="80px" userId={conversation.participantId} />
            <div style={{ textAlign: 'center' }} >
              <span>{conversation.participantName}</span>
            </div>
            <div style={{ fontSize: "18px", opacity: "0.7" }}>
              <span>Welcome to me!!!</span>
            </div>
          </div>
          {messages.length > 0 && messages
            .map((message, idx) => {
              return (
                <Message message={message}
                  key={message.id}
                  logInUserId={user.id}
                  conversationId={conversationId}
                  participantId={conversation.participantId}
                  changeMessage={idx >= 1 ? message.userId != messages[idx - 1].userId : true}
                  hasAvatar={idx + 1 === messages.length ? true : message.userId != messages[idx + 1].userId}
                  lastMessage={idx + 1 === messages.length ? true : false}
                  userName={conversation.participantName}
                  messageDif={idx >= 1 ? messageTimeDiff(messages[idx].createdAt, messages[idx - 1].createdAt) : ''}
                />
              )
            })}

        </div>
        <div className="bottom-message">
          {isOpenEmojiList &&
            <Picker
              set='facebook'
              theme={settingReducer.darkMode ? 'dark' : 'light'}
              style={{
                position: 'absolute',
                top: '-350px',
                left: '100px',
              }}
              onSelect={onEmojiClick} />
          }
          {!audioData && !isRecording ?
            <div className="input-message" style={{ backgroundColor: settingReducer.darkMode ? 'rgb(84, 85, 87)' : '#f0f2f5' }}>
              {filesMessageUrl.length > 0 &&
                <div className="input-file" style={{
                  backgroundColor: settingReducer.darkMode ? 'rgb(84, 85, 87)' : '#f0f2f5'
                }}>
                  {filesMessageUrl.map((fileUrl, idx) => {
                    return (
                      <div key={idx}
                        style={{
                          position: 'relative',
                          margin: '5px',
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
                          <img width='120' height='120' src={`${fileUrl.url}`} />
                          :
                          <div
                            style={{
                              background: '#fff',
                              borderRadius: '5px',
                              padding: '16px',
                              width: '120px',
                              height: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                            <DescriptionIcon />
                            <span style={{
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              fontWeight: '600',
                              color: '#000'
                            }}>
                              {fileUrl.name}
                            </span>
                            <span style={{
                              fontSize: '0.8em',
                              opacity: '0.7',
                              color: '#000'
                            }}>
                              {fileUrl.size}
                            </span>
                          </div>
                        }
                      </div>
                    )
                  })
                  }
                  <Button style={{ margin: '5px' }}>
                    <label style={{
                      cursor: 'pointer',
                    }}
                      htmlFor="files">
                      < AddCircleIcon fontSize="large" style={{ color: 'var(--icon-color)' }} />
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

              <div style={{
                display: 'flex', position: 'relative',
                backgroundColor: settingReducer.darkMode ? 'rgb(84, 85, 87)' : '#f0f2f5'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Tooltip title="Choose an emoji"  >
                    <IconButton onClick={e => { setIsOpenEmojiList(!isOpenEmojiList); }} >
                      <InsertEmoticonIcon style={{ color: 'var(--icon-color)' }} />
                    </IconButton>
                  </Tooltip>

                </div>
                <textarea
                  onClick={e => { e.preventDefault(); setIsOpenEmojiList(false); }}
                  placeholder="Send message"
                  rows={rows}
                  onChange={onWriteMessage}
                  onKeyDown={handleEnterMessage}
                  value={content}
                  style={{
                    color: 'var(--text-color)',
                    backgroundColor: settingReducer.darkMode ? 'rgb(84, 85, 87)' : '#f0f2f5'
                  }}
                />

              </div>
            </div>
            :
            <div className="record-message" style={{
              backgroundColor: '#f0f2f5'
            }}>
              {!audioData ?
                <div className="is-recording">
                  <div className="btn-in-div">

                    <IconButton onClick={handleRecord}>
                      <StopCircleIcon />
                    </IconButton>

                  </div>
                  <span style={{ color: '#000', width: '100%' }}>
                    Recording...
                    <LinearProgress variant="determinate" value={Math.round(recordTime / MAX_TIME_RECORD * 100)} />
                    {getTimeRecord(recordTime)}
                  </span>
                </div>
                :
                <div className="audio-message">
                  <audio src={URL.createObjectURL(audioData)} controls />
                </div>
              }
              <div className="btn-in-div">
                <IconButton onClick={handleCancelRecord}>
                  <CancelIcon />
                </IconButton>
              </div>
            </div>
          }


          <div className="input-btn">
            {!audioData && !isRecording &&
              <div style={{
                display: 'flex'
              }}>
                <Tooltip title="Attach photos">
                  <IconButton>
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
                      <AttachFileIcon style={{ color: '#1962a7' }} />
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
                {!content &&
                  <>
                    {isEnableAudio ?
                      <>
                        <Tooltip title="Record">
                          <IconButton onClick={handleRecord}>
                            <RadioButtonCheckedIcon style={{ color: 'red' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Speech to text">
                          <IconButton onClick={runSpeechRecognition}>
                            {voiceDetectRef.current ?
                              <MicNoneIcon style={{ color: 'var(--icon-color)' }} />
                              :
                              <MicIcon style={{ color: 'var(--icon-color)' }} />
                            }
                          </IconButton>
                        </Tooltip>
                      </>
                      :
                      <>
                        <Tooltip title="You dont have mic">
                          <div>
                            <IconButton disabled >
                              <RadioButtonCheckedIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                        <Tooltip title="You dont have mic">
                          <div>
                            <IconButton disabled>
                              <MicIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </>
                    }
                  </>
                }
              </div>
            }
            {(content || filesMessage.length || audioData) &&
              <Tooltip title="Send message" >
                <IconButton onClick={handleSendMessage} >
                  <SendIcon style={{ color: 'var(--icon-color)' }} />
                </IconButton>
              </Tooltip>
            }
          </div>

        </div>
      </div>
      <div className="conversation-info" style={{ width: !showInfo ? '0%' : '25%' }}>
        <div className="custom-info">
          <Avatar width='80px' height='80px'
            userId={conversation.participantId} />
          <div style={{
            fontSize: "36px",
            textAlign: 'center', overflow: 'hidden',
          }}>
            <span>{conversation.participantName}</span>
          </div>
        </div>
        <div className="conversation-info-detail">
          <Accordion className='cv-info-expand-container'>
            <AccordionSummary aria-controls="custom-chat-content" id="custom-chat-header">
              <Typography>Customize Chat</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="accordion-detail">
                <Button style={{ color: 'var(--icon-color)' }}
                  startIcon={<ColorLensIcon style={{ color: 'var(--icon-color)' }} />}>
                  Change Themes
                </Button>
                <FormControlLabel
                  onChange={e => { dispatch(toggleDarkMode()) }}
                  control={<SwitchDarkMode sx={{ m: 1 }} checked={settingReducer.darkMode} />}
                  label={settingReducer.darkMode ? 'Dark Mode' : 'Light Mode'}
                />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion className='cv-info-expand-container'>
            <AccordionSummary aria-controls="shared-media-content" id="shared-media-header">
              <Typography>Shared Media</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ImageList sx={{ width: '100%', maxHeight: 450, margin: '7px' }}
                cols={2}
                rowHeight={120}
              >
                {images.map((img) => (
                  <ImageListItem key={img.id}>
                    <img
                      style={{
                        cursor: 'pointer',
                        borderRadius: '5px',
                      }}
                      onClick={event => handlePreview(event, img.messageId, img.id)}
                      src={filePath.concat(`/${img.messageId}/image/${img.id}`)}
                      alt={'image'}
                      loading="lazy"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </AccordionDetails>
          </Accordion>
          <Accordion className='cv-info-expand-container'>
            <AccordionSummary aria-controls="shared-file-content" id="shared-file-header">
              <Typography>Shared Files</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="accordion-detail">
                {files.map(file => {
                  return (
                    <div key={file.id} style={{
                      fontWeight: '600',
                      margin: '8px'
                    }}>
                      <a href={filePath.concat(`/${file.messageId}/files/${file.id}`)}>{file.name}</a>
                    </div>
                  )
                })}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>


      <PreviewImage isPreview={isPreview}
        onClose={(e) => { setIsPreview(false) }}
        messageId={selectedMessageId} photoId={selectedPhotoId}
      />

      {/* <Dialog
        open={conversationCall.isCalling}
      >
        <DialogTitle id="alert-dialog-title" style={{ backgroundColor: 'var(--primary-bg)' }}>
          <Avatar width='40px' height='40px'
            userId={conversation.participantId} />
          <span>{conversation.participantName}</span>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: 'var(--primary-bg)' }}>
          <DialogContentText id="alert-dialog-description" style={{ color: 'var(--text-color)' }}>
            Wait for the other party to pick up the phone ...
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
          <Button onClick={handleCancelCall} style={{ color: 'var(--icon-color)' }}>Cancel</Button>
        </DialogActions>
      </Dialog> */}

      <Snackbar open={messageAlert.length > 0}
        autoHideDuration={3000}
        onClose={e => { setMessageAlert('') }}>
        <Alert severity='error'>
          {messageAlert}
        </Alert>
      </Snackbar>
    </>
  )
}