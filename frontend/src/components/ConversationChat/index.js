import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cancelCall, getParticipant } from '../../store/reducers/conversation.reducer'
import MessageConversation from '../MessageConversation';
import Avatar from '../Avatar/index';
import {
  Button, IconButton, Tooltip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Typography
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
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import { socketClient, broadcastLocal, baseURL } from '../../utils';
import { getMessages, readConversation, startCall } from '../../store/reducers/conversation.reducer';
import { v4 } from 'uuid';
import './conversationChat.css';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
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

  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));




export default function Index({ conversation, user }) {
  const participant = useSelector(state => state.conversationReducer.conversation.participant);
  const dispatch = useDispatch();
  useEffect(async () => {
    dispatch(getParticipant({ participantId: conversation.participantId }));
  }, [conversation.participantId])

  return (
    <>
      {participant &&
        <ConversationChat conversationId={conversation.conversationId} user={user} participant={participant} />
      }
    </>
  )
}

const ConversationChat = ({ conversationId, user, participant }) => {
  const [content, setContent] = useState('');
  const [rows, setRows] = useState(1);
  const minRows = 1;
  const maxRows = 5;

  const [imageMessage, setImageMessage] = useState([]);
  const [imageMessageUrl, setImageMessageUrl] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [isOpenEmojiList, setIsOpenEmojiList] = useState(false);
  const [expanded, setExpanded] = useState('panel1');
  const [forceRender, setForceRender] = useState(v4());

  const conversationCall = useSelector(state => state.conversationReducer.conversationCall);
  const messages = useSelector(state => state.conversationReducer.conversation.messages);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const speechReplyRef = useRef('');
  const voiceDetectRef = useRef(false);


  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length])

  useEffect(() => {
    dispatch(getMessages({ conversationId }))
    dispatch(readConversation({ conversationId, userId: user.id }))
  }, [conversationId])

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
    if (content !== '' || imageMessage) {
      console.log(imageMessage);
      socketClient.emit('conversation-sendMessage', { content, senderId: user.id, receiverId: participant.id, conversationId, images: imageMessage });
      broadcastLocal.postMessage({ content, senderId: user.id, receiverId: participant.id, conversationId, image: imageMessage })
      setContent('');
      setImageMessage([]);
      setImageMessageUrl([]);
      setRows(minRows);
    }
  }

  const chooseEmoji = () => {
    setIsOpenEmojiList(!isOpenEmojiList);

  }

  const onEmojiClick = (event, emojiObject) => {
    console.log(emojiObject);
    setContent(content.concat(emojiObject.emoji));
  };

  const handleVoiceCall = () => {
    socketClient.emit('conversation-call', { conversationId, senderId: user.id, senderName: user.userName, receiverId: participant.id });
    dispatch(startCall({ conversationId, senderId: user.id, senderName: user.userName, receiverId: participant.id }))
  }

  const handleCancelCall = () => {
    socketClient.emit('conversation-cancel-call', { conversationId, senderId: user.id, receiverId: participant.id })
    dispatch(cancelCall({ conversationId }))
  }

  const onImageInputChange = e => {
    e.preventDefault()
    console.log(e.target.files);
    for (let imgFile of imageMessage) {
      if (imgFile === e.target.files[0]) {
        return;
      }
    }
    setImageMessage([...imageMessage, e.target.files[0]]);
    console.log(imageMessage);
    let reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onloadend = e => {
      setImageMessageUrl([...imageMessageUrl, reader.result])
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
      speechReplyRef.current = 'Error occurred in recognition: ' + event.error;
      voiceDetectRef.current = false;
      setForceRender(v4());
      recognition.stop();
    }

    recognition.onresult = function (event) {
      let transcript = event.results[0][0].transcript;
      let confidence = event.results[0][0].confidence;
      console.log(transcript, confidence * 100 + '%')
      if (confidence > 0.6 && transcript.length) {
        socketClient.emit('conversation-sendMessage', { content: transcript, senderId: user.id, receiverId: participant.id, conversationId, image: null });
        broadcastLocal.postMessage({ content: transcript, senderId: user.id, receiverId: participant.id, conversationId, image: null })
      } else {
        speechReplyRef.current = "Could not understand!"
      }

    };

    recognition.start();
  }

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <>
      <div className="conversation-message" style={{ width: !showInfo ? '100%' : '75%' }} >
        <div className="header-message">
          <div className="header-left">
            <Avatar width='40px' height='40px'
              userId={participant.id} />
            <span style={{ marginLeft: '15px', fontSize: '1.2em', fontWeight: '500' }}>{participant.userName}</span>
          </div>
          <div className="header-btn-list">
            <Tooltip title="Start a voice call">
              <IconButton onClick={handleVoiceCall}>
                <PhoneIcon color='primary' />
              </IconButton>
            </Tooltip>
            <Tooltip title="Start a video call">
              <IconButton >
                <VideocamIcon color='primary' />
              </IconButton>
            </Tooltip>
            <Tooltip title="Conversation info">
              <IconButton onClick={e => setShowInfo(!showInfo)}>
                <InfoIcon color='primary' />
              </IconButton>
            </Tooltip>

          </div>
        </div>
        <div className="content-message" ref={scrollRef} onClick={e => { e.preventDefault(); setIsOpenEmojiList(false); }}>
          <div className="info-beginner-content">
            <Avatar width='80px' height='80px'
              userId={participant.id} />
            <div >
              {participant.userName}
            </div>
            <div style={{ fontSize: "18px", opacity: "0.7" }}>
              Welcome to me!!!
            </div>
          </div>
          {messages.length > 0 && messages.slice(0, messages.length - 1)
            .map((message, idx) => {
              return (
                <MessageConversation message={message} key={message.id}
                  logInUserId={user.id}
                  hasAvatar={message.userId != messages[idx + 1].userId}
                  userName={user.firstName.concat(' ', user.lastName)}
                />
              )
            })}
          {messages.length > 0 && <MessageConversation message={messages[messages.length - 1]}
            logInUserId={user.id}
            hasAvatar={true} lastMessage={true} />}

        </div>
        <div className="bottom-message">
          {isOpenEmojiList &&
            <div style={{
              position: 'absolute',
              top: '-315px',
              right: '150px',
            }}>
              <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_MEDIUM_DARK} />
            </div>}

          <div className="input-message" >
            <div className="input-image">
              {imageMessage.map((imgMessage, idx) => {
                let imgIdx = imageMessage.findIndex(img => img === imgMessage)
                let imgUrl = imageMessageUrl[imgIdx];
                return (
                  <div key={idx} style={{
                    position: 'relative',
                    width: '150px',
                    height: '150px',
                  }}>
                    <IconButton
                      style={{
                        position: 'absolute',
                        right: '-25px',
                        top: '-8px',
                        zIndex: '10'
                      }}
                      onClick={e => {
                        e.preventDefault()
                        setImageMessage(imgMsgList => {
                          let tmpArr = [...imgMsgList];
                          tmpArr.splice(imgIdx, 1);
                          return tmpArr;
                        })
                        setImageMessageUrl(imgMsgUrlList => {
                          let tmpArr = [...imgMsgUrlList];
                          tmpArr.splice(imgIdx, 1);
                          return tmpArr;
                        })
                      }}>
                      <CloseIcon />
                    </IconButton>
                    <img width="100%" height="100%" src={`${imgUrl}`} />
                  </div>
                )
              })
              }
            </div>

            <textarea
              onClick={e => { e.preventDefault(); setIsOpenEmojiList(false); }}
              placeholder="Send message"
              rows={rows}
              onChange={onWriteMessage}
              onKeyDown={handleEnterMessage}
              value={content}
            />

          </div>

          <div className="input-btn">

            <Tooltip title="Attach a photo">
              <IconButton >
                <label style={{
                  cursor: 'pointer',
                  display: 'flex'
                }}
                  htmlFor="images">
                  <ImageIcon color='success' />
                </label>
                <input type="file" accept='image/*'
                  onChange={onImageInputChange}
                  id="images"
                  style={{
                    display: 'none'
                  }} />
              </IconButton>

            </Tooltip>


            <Tooltip title="Choose an emoji">
              <IconButton onClick={chooseEmoji} >
                <InsertEmoticonIcon color="secondary" />
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


            <Tooltip title="Send message" style={{ display: !content.length && 'none' }}>
              <Button onClick={handleSendMessage} >
                <SendIcon style={{ color: "#1A73E8" }} />
              </Button>
            </Tooltip>

          </div>
        </div>
      </div>
      <div className="conversation-info" style={{ display: !showInfo ? 'none' : 'flex' }}>
        <div className="custom-info">
          <Avatar width='80px' height='80px'
            userId={participant.id} />
          <div style={{ fontSize: "36px" }}>
            {participant.userName}
          </div>
        </div>
        <div className="-conversation-info-btn">
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
              <Typography>Customise chat</Typography>
            </AccordionSummary>
            <AccordionDetails>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Button startIcon={<DarkModeIcon color="primary" />}>Dark Mode</Button>
                <Button startIcon={<ColorLensIcon color="primary" />}>Change Themes</Button>
              </div>

            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
              <Typography>Shared media</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>


      <Dialog
        open={conversationCall.isCalling}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Avatar width='40px' height='40px'
            userId={participant.id} />
          {participant.userName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Wait for the other party to pick up the phone ...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCall}>Cancel</Button>
        </DialogActions>
      </Dialog>

    </>
  )
}



