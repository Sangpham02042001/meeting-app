import React, { useState, useEffect, useRef } from 'react'
import { Button, IconButton, TextField } from '@mui/material';
import './meetingChatBox.css';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { socketClient } from '../../../utils';
import Message from '../../../components/Message';

export default function ChatBox({ chatVisible }) {
    const { teamId } = useParams()
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const userReducer = useSelector(state => state.userReducer)
    const meetingReducer = useSelector(state => state.meetingReducer)
    const [file, setFile] = useState(null)
    const [fileUrl, setFileUrl] = useState('')

    const [rows, setRows] = useState(1);
    const minRows = 1;
    const maxRows = 5;


    const currentNumOfMessages = meetingReducer.meeting.messages.length
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    const getMemberName = userId => {
        let user = meetingReducer.meeting.members.find(user => user.id == userId)
        return (user || {}).userName || '';
    }

    const onWriteMessage = (event) => {
        event.preventDefault()
        const textareaLineHeight = 36;

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
        setMessage(event.target.value);
    }

    useEffect(() => {
        window.addEventListener('paste', e => {
            if (document.activeElement == inputRef.current) {
                if (e.clipboardData.files.length > 0) {
                    let file = e.clipboardData.files[0]
                    let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
                    if (regex.test(file.name)) {
                        setFile(file)
                        let reader = new FileReader()
                        let url = reader.readAsDataURL(file)
                        reader.onloadend = e => {
                            setFileUrl(reader.result)
                        }
                    }
                }
            }
        })

        return () => {
            window.removeEventListener('paste', () => {
                console.log('remove events')
            })
        }
    }, [])

    useEffect(() => {
        if (currentNumOfMessages) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentNumOfMessages])

    const onChangeMessage = (event) => {
        setMessage(event.target.value)
    }
    const handleEnterSendMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setMessage('');
        }
    }

    const handleSendMessage = () => {
        let userId = userReducer.user.id;
        if (message !== '' || file) {
            console.log(`content ${message}`)
            socketClient.emit('send-message-meeting', {
                senderId: userId,
                meetingId: meetingReducer.meeting.id,
                content: message,
                file: file,
                teamId
            })
            setMessage('');
            setFileUrl('');
            setFile('');
            setRows(1)
        }

    }

    const onFileInputChange = e => {
        e.preventDefault()
        if (e.target.files.length) {
            let file = e.target.files[0]
            setFile({
                type: file.type,
                name: file.name,
                data: file,
                size: file.size
            })
            let url = URL.createObjectURL(file)
            setFileUrl({
                type: /image\/(?!svg)/.test(file.type) ? 'image' : 'file',
                url,
                name: file.name
            })
        }
    }

    return (
        <>
            <div className="chatbox-header">
                <div>
                    Messages
                </div>
                <div>
                    <IconButton onClick={chatVisible}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>
            <div className="chatbox-content">
                {currentNumOfMessages !== 0 && <div className='message-list'
                    ref={scrollRef} style={{
                        height: `calc(60vh - ${(fileUrl ? 120 : 0) + (rows - 1) * 24}px)`
                    }}>
                    {currentNumOfMessages && meetingReducer.meeting.messages.slice(0, currentNumOfMessages - 1)
                        .map((message, idx) => (
                            <Message message={message} key={'message' + message.id}
                                logInUserId={null} userName={getMemberName(message.userId)}
                                hasAvatar={message.userId != meetingReducer.meeting.messages[idx + 1].userId} />
                        ))}
                    {currentNumOfMessages && <Message message={meetingReducer.meeting.messages[currentNumOfMessages - 1]}
                        logInUserId={null} userName={getMemberName(message.userId)}
                        hasAvatar={true} lastMessage={true} />}
                </div>}
                {fileUrl && <div className='image-message-upload'>
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
                    <IconButton
                        sx={{
                            position: 'absolute',
                            left: '90px',
                            top: '5px',
                            zIndex: '10',
                            width: '24px',
                            height: '24px',
                            color: '#fff',
                            background: '#3e4042 !important'
                        }}
                        onClick={e => {
                            setFile(null)
                            setFileUrl('')
                        }}>
                        <CloseIcon />
                    </IconButton>
                </div>}
            </div>
            <div className="chatbox-sender">
                <textarea
                    style={{ fontSize: '16px', }}
                    variant="outlined"
                    type="text" placeholder="Chat" name='message'
                    autoComplete="off"
                    ref={inputRef}
                    rows={rows}
                    value={message}
                    onKeyDown={handleEnterSendMessage}
                    onChange={onWriteMessage} />
                <div style={{ display: 'flex' }}>
                    <IconButton >
                        <label htmlFor="images" style={{ cursor: 'pointer' }}>
                            < AttachFileIcon color="primary" />
                        </label>
                        <input type="file"
                            onChange={onFileInputChange}
                            id="images" style={{
                                display: 'none'
                            }} />
                    </IconButton>
                    <IconButton onClick={handleSendMessage}>
                        <SendIcon style={{ color: "#1A73E8" }} />
                    </IconButton>
                </div>
            </div>
        </>
    )
}


