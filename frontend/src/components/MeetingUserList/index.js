import React, { useState, useEffect } from 'react';
import {Button} from 'react-bootstrap';
import './meetingUserList.css';

import { socketClient } from '../../utils';

export default function MeetingUserList({usersVisible, users}) {
    console.log(users);
    return (
        <div className="user-list">
            <div className="user-list-header">
                <div className="user-list-title">
                    User
                </div>
                <div>
                    <Button variant="outline-light" onClick={usersVisible}>
                        <i style={{ color: "black" }} className="fas fa-times"></i>
                    </Button>
                </div>
            </div>
            <div className="user-name">
                {socketClient.id}
                {users.map(user => {
                    return <div>{user.id}</div>
                })}
            </div>

        </div>
    )
}


