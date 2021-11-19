import React from 'react'
import {
    IconButton, Tooltip, Dialog,
    DialogContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { baseURL } from '../../utils';

export default function PreviewImage({ isPreview, onClose, messageId, photoId }) {

    const imgPath = `${baseURL}/api/messages`
    const handleImageDownload = (event) => {
        event.preventDefault()
        window.open(`${baseURL}/api/messages/photos/${messageId}/${photoId}`)
    }

    return (

        <Dialog
            open={isPreview}
            onClose={onClose}
            maxWidth='xl'
            style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)' }}
        >
            <DialogContent style={{ padding: 0 }}>
                <Tooltip title="Close" placement="bottom">
                    <IconButton
                        sx={{
                            position: 'fixed',
                            right: '20px',
                            top: '20px',
                            padding: '5px',
                            background: '#fff !important'
                        }}
                        onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download" placement="bottom">
                    <IconButton
                        sx={{
                            position: 'fixed',
                            right: '70px',
                            top: '20px',
                            padding: '5px',
                            background: '#fff !important'
                        }}
                        onClick={handleImageDownload}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
                <img width="100%" height="100%" src={imgPath.concat(`/${messageId}/${photoId}`)} />
            </DialogContent>
        </Dialog >

    )
}
