import React from 'react'
import {
    IconButton, Tooltip, Dialog,
    DialogContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
export default function PreviewImage({ isPreview, image, onClose }) {

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
                <img width="100%" height="100%" src={image} />
            </DialogContent>
        </Dialog >

    )
}
