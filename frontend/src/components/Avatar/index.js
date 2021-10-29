import React, {useState, useEffect} from 'react';
import './avatar.css';
import { baseURL } from '../../utils';
import Avatar from '@mui/material/Avatar';

export default function index({ width, height, userId }) {
    const [imageSrc, setImageSrc] = useState('')
    useEffect(() => {
        setImageSrc(`${baseURL}/api/user/avatar/${userId}`)
    }, [])

    return (
        <Avatar
            alt="avatar image"
            src={imageSrc}
            sx={{ width, height }}
        />
    )
}
