import React from 'react'
import { useSelector } from 'react-redux'
import './loading.css'

export default function Loading() {
  const settingReducer = useSelector(state => state.settingReducer)
  return (
    <div className='loading-container'>
      {settingReducer.darkMode ? <img src="public/loading-darkmode.svg" /> : <img src="public/loading.svg" />}
    </div>
  )
}
