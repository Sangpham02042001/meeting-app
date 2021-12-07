import React, { useState } from 'react';
import './home.css';
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import StaticDatePicker from "@mui/lab/StaticDatePicker";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Dialog, DialogActions, DialogTitle, DialogContent, IconButton, Modal } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useDispatch, useSelector } from 'react-redux';
import { sendFeedback } from '../../store/reducers/user.reducer';

export default function Home() {

    const [value, setValue] = React.useState(new Date());
    const [event, setEvent] = React.useState({});
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [openSchedule, setSchedule] = React.useState(false);
    const [feedback, setFeedback] = React.useState("");

    const dispatch = useDispatch();
    const user = useSelector(state => state.userReducer.user);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'var(--primary-bg)',
        borderRadius: '10px',
        boxShadow: 24,
        pt: 2,
        px: 4,
        pb: 3,
    };

    const handleOpen = () => {
        setOpen(true);
    }
    function handleClose() {
        setOpen(false);
    }

    function addEvent(date) {
        setEvent(
            {
                id: 1,
                Title: title,
                Content: content,
                Date: date.toLocaleDateString()
            }
        );
        alert(title + " " + content + " " + date.toLocaleDateString());
    }

    function handleSendFeedback(e) {
        if (feedback) {
            console.log(feedback);
            dispatch(sendFeedback({ feedback, userId: user.id }))
            setOpen(false);
        }
    }

    return (
        <div className="home-component">
            <div className="home-items" id="start-item">
                <img src="world-map.png" id="world-img"></img>


            </div>
            <div className="home-items" id="center-item">
                <h1>Welcome to meeting app</h1>
                <img src="Remote-team-bro.png" id="home-image"></img>
                <div id="profile">
                    <a
                        href="#"
                        className="contact-links"
                    ><i className="fab fa-facebook-square" style={{ color: 'var(--icon-color)' }}></i></a>
                    <a
                        id="profile-link"
                        href="#"
                        className="contact-links"
                    ><i className="fab fa-github" style={{ color: 'var(--icon-color)' }}></i></a>
                    <a
                        href="#"
                        className="contact-links"
                    ><i className="fab fa-twitter" style={{ color: 'var(--icon-color)' }}></i></a>
                    <a
                        href="#"
                        className="contact-links"
                    ><i className="fas fa-at" style={{ color: 'var(--icon-color)' }}></i></a>
                </div>
            </div>
            <div className="home-items" id="end-item">
                <div id="calendar">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            openTo="day"
                            value={value}
                            onChange={(newValue) => {
                                setValue(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>

                    <div>
                        <p>You have no event on {value.toLocaleDateString()}</p>
                        <Button
                            variant="outlined"
                            style={{
                                marginTop: "20px",
                                color: 'var(--icon-color)',
                                borderColor: 'var(--icon-color)'
                            }}
                            onClick={() => {
                                setSchedule(true);
                            }}
                        >Add event
                        </Button>
                        <Dialog
                            open={openSchedule}
                            onClose={() => {
                                setSchedule(false);
                            }}
                            maxWidth="sm" fullWidth={true}
                        >
                            <DialogTitle style={{ backgroundColor: 'var(--primary-bg)' }}>Schedule</DialogTitle>
                            <DialogContent style={{ backgroundColor: 'var(--primary-bg)' }} className="schedule-container">
                                <p>Create your schedule</p>
                                <TextField
                                    label="Title"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                    style={{
                                        color: 'var(--text-color)',
                                        marginBottom: '15px'
                                    }}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                    }} />
                                <TextField
                                    label="Date"
                                    type="text"
                                    fullWidth
                                    style={{
                                        color: 'var(--text-color)',
                                        marginBottom: '15px'
                                    }}
                                    variant="standard"
                                    defaultValue={value.toLocaleDateString()} />
                                <TextField
                                    label="Content"
                                    type="text"
                                    multiline
                                    fullWidth
                                    style={{
                                        color: 'var(--text-color)',
                                        marginBottom: '15px'
                                    }}
                                    rows={5}
                                    variant="outlined"
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                    }} />
                            </DialogContent>
                            <DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        addEvent(value);
                                    }}
                                    style={{ color: 'var(--icon-color)' }}
                                >Save</Button>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setSchedule(false);
                                    }}
                                    style={{ color: 'var(--icon-color)' }}
                                >Close</Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </div>
                <div>
                    <IconButton
                        id="customize"
                        className="footer-button"
                        onClick={handleOpen}
                    ><BugReportIcon style={{ color: 'var(--icon-color)' }} /></IconButton>

                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="parent-modal-title"
                        aria-describedby="parent-modal-description"
                    >
                        <Box sx={{ ...style }}>
                            <h2>Feedback</h2>
                            <p>What can we do for you?</p>
                            <TextField
                                label="Let us know"
                                type="text"
                                multiline
                                rows={5}
                                fullWidth
                                onChange={(e) => {
                                    setFeedback(e.target.value);
                                }}
                            />
                            <Button variant="contained"
                                style={{
                                    marginTop: '20px'
                                }}
                                endIcon={<SendIcon className='send-icon' />}
                                onClick={handleSendFeedback}
                            >
                                Send
                            </Button>
                        </Box>
                    </Modal>
                </div>
            </div>
        </div>
    )
}
