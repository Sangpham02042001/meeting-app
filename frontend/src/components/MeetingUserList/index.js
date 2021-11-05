import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { Button } from '@mui/material';
import Avatar from '../Avatar';
import './meetingUserList.css';

export default function MeetingUserList({ usersVisible, members }) {
    let user = useSelector(state => state.userReducer.user)
    return (
        <div className="user-list">
            <div className="user-list-header">
                <div className="user-list-title">
                    Participants
                </div>
                <div>
                    <Button variant="outline-light" onClick={usersVisible}>
                        <i style={{ color: "black" }} className="fas fa-times"></i>
                    </Button>
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


