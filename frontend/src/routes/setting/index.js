import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormControlLabel, Switch } from '@mui/material'
import { toggleDarkMode } from '../../store/reducers/setting.reducer'
import SwitchDarkMode from '../../components/SwitchDarkMode'
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
                onChange={e => { dispatch(toggleDarkMode()) }}
                control={<SwitchDarkMode sx={{ m: 1 }} checked={settingReducer.darkMode} />}
                label={settingReducer.darkMode ? 'Dark Mode' : 'Light Mode'}
            />
        </div >
    )
}
