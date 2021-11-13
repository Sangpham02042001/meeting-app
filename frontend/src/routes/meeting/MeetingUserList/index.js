import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '../../../components/Avatar';
import './meetingUserList.css';

export default function MeetingUserList({ usersVisible, members }) {
    let user = useSelector(state => state.userReducer.user)
    return (
        <div className="user-list">
            <div className="user-list-header">
                <div>
                    Participants
                </div>
                <div>
                    <IconButton onClick={usersVisible}>
                        <CloseIcon />
                    </IconButton>
                </div>

            </div>
            <div className="user-list-container">
                {[...members].sort((a, b) => {
                    if (a.userId === user.id) {
                        return -1;
                    }
                }).map(member => {
                    return (
                        <div key={member.userId} className=''>
                            <Avatar width='40px' height='40px' userId={member.userId} />
                            <p>{member.userName} {member.userId === user.id && '(You)'}</p>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}


