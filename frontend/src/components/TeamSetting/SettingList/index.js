import React, { useState, useEffect } from 'react'
import { useHistory, useParams, useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import './style.css'

export default function SettingList() {
  let location = useLocation()
  const { teamId } = useParams()

  return (
    <div className="team-setting-list">
      <Link to={`/teams/${teamId}/setting`}
        className={location.pathname.endsWith('/setting')
          || location.pathname.endsWith('/setting/') ? 'active' : ''}>
        General
      </Link>
      <Link to={`/teams/${teamId}/setting/members`}
        className={location.pathname.endsWith('/setting/members')
          || location.pathname.endsWith('/setting/members/') ? 'active' : ''}>
        Members</Link>
      <Link to={`/teams/${teamId}/setting/requestusers`}
        className={location.pathname.endsWith('/setting/requestusers')
          || location.pathname.endsWith('/setting/requestusers/') ? 'active' : ''}>
        Request Users</Link>
      <Link to={`/teams/${teamId}/setting/invitedusers`}
        className={location.pathname.endsWith('/setting/invitedusers')
          || location.pathname.endsWith('/setting/invitedusers/') ? 'active' : ''}>
        Invited Users</Link>
    </div>
  )
}
