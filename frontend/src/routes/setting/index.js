import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
            <div>
                <span>Dark mode:</span>
                <label className="switch">
                    <input type="checkbox" checked={settingReducer.darkMode} onChange={handleDarkMode} />
                    <span className="slider round"></span>
                </label >
            </div>
        </div >
    )
}
