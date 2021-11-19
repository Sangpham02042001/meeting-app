import React, {useState} from 'react'
import { Button } from '@mui/material'
export default function Setting(props) {
    const [isChange, setIsChange] = useState(false);
    const handleClick = () => {
        setIsChange(!isChange);
    }
    return (
        <div>
            <h1>Setting</h1>
            <Button variant="contained" onClick={handleClick} >
                {isChange ? 'On' : 'Off'}
            </Button>
        </div>
    )
}
