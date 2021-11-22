import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { baseURL, timeDiff } from '../../utils'
import './navbar.css'
import { getNotifs, readNotif, hideNoti, deleteNoti } from '../../store/reducers/notification.reducer'
import InfiniteScroll from 'react-infinite-scroll-component'
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar, Menu, MenuItem, Badge, Button } from '@mui/material'

export default function Navbar() {
  let user = useSelector(state => state.userReducer.user);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)
  let isOpenProfileMenu = Boolean(profileAnchorEl)
  const [notiListAnchorEl, setNotiListAnchorEl] = useState(null)
  let isOpenNofiListMenu = Boolean(notiListAnchorEl)
  const [notiAnchorEl, setNotiAnchorEl] = useState(null)
  let isOpenNotiMenu = Boolean(notiAnchorEl)
  const [currentNotiId, setNotiId] = useState(null)
  const dispatch = useDispatch()
  const history = useHistory()

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null)
  }

  const handleCloseNotiListMenu = () => {
    setNotiListAnchorEl(null)
  }

  const handleCloseNotiMenu = () => {
    setNotiAnchorEl(null)
  }

  let notifications = useSelector(state => state.notificationReducer.notifications)
  let numOf_UnReadNotifications = useSelector(state => state.notificationReducer.numOf_UnReadNotifications)
  let numOfNotifications = useSelector(state => state.notificationReducer.numOfNotifications)
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

  const handleHideNoti = () => {
    dispatch(hideNoti({
      notiId: currentNotiId
    }))
    setNotiAnchorEl(null)
  }

  const handleDeleteNoti = () => {
    dispatch(deleteNoti({
      notiId: currentNotiId
    }))
    setNotiAnchorEl(null)
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
            setNotiListAnchorEl(e.currentTarget)
          }}>
          <Badge badgeContent={numOf_UnReadNotifications} color="error">
            <i className="fas fa-bell"></i>
          </Badge>
        </button>
        <Menu
          className="notification-menu"
          anchorEl={notiListAnchorEl}
          open={isOpenNofiListMenu}
          onClose={handleCloseNotiListMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            style: {
              minWidth: 400,
              backgroundColor: 'var(--primary-bg)'
            }
          }}>
          {
            notifications.length === 0 ? <p style={{ textAlign: 'center', fontWeight: '600' }}>
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
                  return (
                    <MenuItem key={notification.id} className='notification-item'>
                      <Link className="notification" onClick={(e) => {
                        !notification.isRead && handleReadNotif(notification.id)
                        setNotiListAnchorEl(null)
                      }} to={notification.relativeLink} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex' }}>
                            {notification.isRead ?
                              <Avatar className="notificationImg" src={imgSrc} style={{ marginRight: '10px' }} />
                              : <Badge anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }} badgeContent=" " color="primary" overlap="circular">
                                <Avatar className="notificationImg" src={imgSrc} style={{ marginRight: '10px' }} />
                              </Badge>}
                            <span>{notification.content}</span>
                          </div>
                          <Button
                            id="basic-button"
                            aria-controls="basic-menu"
                            aria-haspopup="true"
                            style={{
                              minWidth: '40px',
                              zIndex: 5,
                              color: 'var(--text-color)'
                            }}
                            onClick={e => {
                              e.preventDefault()
                              e.stopPropagation()
                              setNotiAnchorEl(e.currentTarget)
                              setNotiId(notification.id)
                            }}
                          >
                            <i className="fas fa-ellipsis-h" style={{ cursor: 'pointer' }}></i>
                          </Button>
                        </div>
                        <p style={{ fontSize: '15px', color: 'gray' }}>
                          {timeDiff(notification.createdAt)}
                        </p>
                        <div />
                      </Link>
                    </MenuItem>
                  )
                })}
              </InfiniteScroll>
          }
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
          PaperProps={{
            style: {
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-color)'
            }
          }}
        >
          <MenuItem onClick={handleProfile}>
            <PersonIcon /> My profile</MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon /> Logout
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notiAnchorEl}
          open={isOpenNotiMenu}
          onClose={handleCloseNotiMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            style: {
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-color)'
            }
          }}
        >
          <MenuItem onClick={handleHideNoti}> <CloseIcon />Hide</MenuItem>
          <MenuItem onClick={handleDeleteNoti}> <DeleteIcon /> Delete
          </MenuItem>
        </Menu>

        <strong className="navbar-username">{user.firstName}</strong>
      </div>
    </nav >

  )
}
