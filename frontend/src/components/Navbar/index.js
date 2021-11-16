import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { baseURL, timeDiff } from '../../utils'
import './navbar.css'
import { getNotifs, readNotif } from '../../store/reducers/notification.reducer'
import InfiniteScroll from 'react-infinite-scroll-component'
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Menu, MenuItem, Badge } from '@mui/material'
import { border } from '@mui/system'

export default function Navbar() {
  let user = useSelector(state => state.userReducer.user);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)
  let isOpenProfileMenu = Boolean(profileAnchorEl)
  const [notiAnchorEl, setNotiAnchorEl] = useState(null)
  let isOpenNofiMenu = Boolean(notiAnchorEl)
  const dispatch = useDispatch()
  const history = useHistory()

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null)
  }

  const handleCloseNotiMenu = () => {
    setNotiAnchorEl(null)
  }

  let notifications = useSelector(state => state.notificationReducer.notifications)
  let numOf_UnReadNotifications = useSelector(state => state.notificationReducer.numOf_UnReadNotifications)
  let hasMore = useSelector(state => state.notificationReducer.hasMore)
  useEffect(() => {
    dispatch(getNotifs(0))
    // dispatch(cleanNotificationState)
  }, [])

  const handleProfile = e => {
    e.preventDefault()
    history.push('/profile')
    setProfileAnchorEl(null)
  }

  const handleLogout = e => {
    e.preventDefault()
    window.localStorage.removeItem('user')
    history.push('/')
    location.reload()
  }

  const handleNotif = e => {
    // e.preventDefault()
    setTimeout(() => {
      dispatch(getNotifs(notifications.length))
    }, 500)
  }

  const handleReadNotif = (notifId) => {
    dispatch(readNotif(notifId))
  }

  return (
    <nav className="navbar">
      <div style={{ display: 'flex' }}>
        <Link to='/home'>
          <Avatar src='meeting-logo.png' style={{
            width: '40px',
            height: '40px',
          }} />
        </Link>
        <Link to="/home" className="nav-brand">
          MEETING APP
        </Link>
      </div>

      <div className="navbar-btn">
        <button
          style={{
            marginRight: '15px',
            outline: "none",
            border: 'none',
            background: 'transparent',
            color: '#FFF'
          }}
          onClick={e => {
            e.preventDefault()
            setNotiAnchorEl(e.currentTarget)
          }}>
          <Badge badgeContent={numOf_UnReadNotifications} color="error">
            <i className="fas fa-bell"></i>
          </Badge>
        </button>
        <Menu
          className="notification-menu"
          anchorEl={notiAnchorEl}
          open={isOpenNofiMenu}
          onClose={handleCloseNotiMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {notifications.length === 0 ? <p style={{ textAlign: 'center', fontWeight: '600' }}>
            No new notifications</p>
            : <InfiniteScroll
              dataLength={notifications.length}
              next={handleNotif}
              hasMore={hasMore}
              loader={<div className="notification justify-content-center"
                style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar src="loading.gif" className="loadingNotification" />
              </div>}
              scrollableTarget="dropdown-notification"
              endMessage={<p style={{ textAlign: 'center' }}>
                <b>There is no more notification!</b>
              </p>}>
              {notifications.map((notification) => {
                let imgSrc = `${baseURL}/api/user/avatar/${notification.createdBy}`
                let style = {}
                if (notification.isRead == 1) {
                  style = {
                    'position': "relative",
                    'borderRadius': "5px",
                  }
                } else if (notification.isRead == 0) {
                  style = {
                    'position': "relative",
                    'borderRadius': "5px",
                  }
                }
                return (
                  <MenuItem key={notification.id}>
                    <Link className="notification" onClick={(e) => {
                      !notification.isRead && handleReadNotif(notification.id)
                      setNotiAnchorEl(null)
                    }} to={notification.relativeLink} style={style}>
                      <div style={{ display: 'flex' }}>
                        {notification.isRead ?
                          <Avatar className="notificationImg" src={imgSrc} style={{ marginRight: '10px' }} />
                          : <Badge anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }} badgeContent=" " color="primary" overlap="circular">
                            <Avatar className="notificationImg" src={imgSrc} style={{ marginRight: '10px' }} />
                          </Badge>}
                        {notification.content}
                      </div>
                      <p style={{ fontSize: '15px', color: 'gray' }}>{timeDiff(notification.timeDifferent)}</p>
                      <div />
                    </Link>
                  </MenuItem>
                )
              })}
            </InfiniteScroll>}
        </Menu>

        <Avatar sx={{ width: "40px", height: "40px", cursor: 'pointer', marginRight: '15px' }}
          onClick={e => {
            e.preventDefault()
            setProfileAnchorEl(e.currentTarget)
          }}
          src={`${baseURL}/api/user/avatar/${user.id}?id=${user.avatar}`} />
        <Menu
          anchorEl={profileAnchorEl}
          open={isOpenProfileMenu}
          onClose={handleCloseProfileMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleProfile}>
            <PersonIcon /> My profile</MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon /> Logout
          </MenuItem>
        </Menu>

        <strong className="navbar-username">{user.firstName}</strong>
      </div>
    </nav >

  )
}
