import React from 'react';
import './avatar.css';
import { baseURL } from '../../utils';

export default function Avatar({ width, height, userId }) {
    return (
        <div className='avatar'
            style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${userId}")`, width: `${width}`, height: `${height}`}}>
        </div>
    )
}
