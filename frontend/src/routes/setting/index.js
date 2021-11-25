import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormControlLabel, Switch } from '@mui/material'
import { toggleDarkMode } from '../../store/reducers/setting.reducer'
import './setting.css'

export default function Setting(props) {
    const settingReducer = useSelector(state => state.settingReducer)
    const dispatch = useDispatch()

    const handleDarkMode = () => {
        dispatch(toggleDarkMode())
    }

    return (
        <div className='setting-page'>
            <h1>Setting</h1>
            <FormControlLabel
                control={
                    <Switch label="Dark Mode" checked={settingReducer.darkMode}
                        onChange={e => { dispatch(toggleDarkMode()) }}
                        color="default" />
                }
                label="Dark Mode"
            />
        </div >
    )
}
