import React, { useState, useEffect } from 'react';
import './avatar.css';
import { baseURL } from '../../utils';
import Avatar from '@mui/material/Avatar';

export default function index(props) {
    const [imageSrc, setImageSrc] = useState('')
    useEffect(() => {
        setImageSrc(`${baseURL}/api/user/avatar/${props.userId}`)
    }, [])

    return (
        <Avatar
            style={props.style}
            alt={props.alt}
            src={imageSrc}
            sx={{ width: props.width, height: props.height }}
        >{props.children}</Avatar>
    )
}
