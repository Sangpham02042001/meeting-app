import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { baseURL, socketClient, timeDiff } from '../../utils'
import './navbar.css'
import { getNotifs, readNotif, hideNoti, deleteNoti } from '../../store/reducers/notification.reducer'
import InfiniteScroll from 'react-infinite-scroll-component'
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Check from '@mui/icons-material/Check';
import {
  Avatar, Menu, MenuItem, Badge, IconButton,
  ListItemIcon, ListItemText
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications';
import { setMyStatus } from '../../store/reducers/user.reducer'

const statusOptions = {
  'Active': 'active',
  'Sleep': 'sleep',
  'Do not disturb': 'busy',
  'Invisible': 'inactive',
};

export default function Navbar() {
  let user = useSelector(state => state.userReducer.user);
  const myStatus = useSelector(state => state.userReducer.status);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)
  let isOpenProfileMenu = Boolean(profileAnchorEl)
  const [notiListAnchorEl, setNotiListAnchorEl] = useState(null)
  let isOpenNofiListMenu = Boolean(notiListAnchorEl)
  const [notiAnchorEl, setNotiAnchorEl] = useState(null)
  let isOpenNotiMenu = Boolean(notiAnchorEl)
  const [statusAnchorEl, setStatusAnchorEl] = useState(null)
  const [statusSelectedIdx, setStatusSelectedIdx] = useState(0);
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

  }, [])

  useEffect(() => {
    setStatusSelectedIdx(Object.values(statusOptions).findIndex(s => s === myStatus))
  }, [myStatus])

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

  const handleOpenStatus = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setStatusAnchorEl(event.currentTarget)
  }

  const handleSetStatus = (event, index) => {
    let status = Object.values(statusOptions)[index];
    dispatch(setMyStatus({ userId: user.id, status }));
    socketClient.emit('user-change-status', { userId: user.id, status })
    setStatusAnchorEl(null);
    setStatusSelectedIdx(index);
  }

  const getColorStatus = (idx) => {
    let status = Object.values(statusOptions)[idx];
    if (status === 'active') {
      return 'success';
    } else if (status === 'sleep') {
      return 'warning';
    } else if (status === 'busy') {
      return 'error';
    } else if (status === 'inactive') {
      return 'info';
    }
  }

  return (
    <nav className="navbar">
      <div style={{ display: 'flex' }}>
        <Link to='/home'>
          <Avatar src='public/meeting-logo.png' style={{
            width: '40px',
            height: '40px',
          }} />
        </Link>
        <Link to="/home" className="nav-brand">
          MEETING APP
        </Link>
      </div>

      <div className="navbar-btn">
        <IconButton
          style={{
            marginRight: '15px',
          }}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setNotiListAnchorEl(e.currentTarget)
          }}>
          <Badge badgeContent={numOf_UnReadNotifications} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
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
                              }} badgeContent=" "
                                variant="dot"
                                color="primary"
                                overlap="circular">

                                <Avatar className="notificationImg" src={imgSrc} style={{ marginRight: '10px' }} />
                              </Badge>}
                            <span>{notification.content}</span>
                          </div>
                          <IconButton
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
                            <MoreHorizIcon />
                          </IconButton>
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

        <Badge
          badgeContent=" "
          variant="dot"
          color={getColorStatus(statusSelectedIdx)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          onClick={handleOpenStatus}
          overlap='circular'
          sx={{
            cursor: 'pointer'
          }}
        >
          <Avatar sx={{ width: "40px", height: "40px", cursor: 'pointer', marginRight: '15px' }}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              setProfileAnchorEl(e.currentTarget)
            }}
            src={`${baseURL}/api/user/avatar/${user.id}?id=${user.avatar}`} />
        </Badge>

        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={e => {
            setStatusAnchorEl(null)
          }}
        >
          {Object.keys(statusOptions).map((status, index) => {
            return (
              <MenuItem
                key={status}
                onClick={e => handleSetStatus(e, index)}
                selected={index === statusSelectedIdx}>
                <ListItemIcon>
                  {statusSelectedIdx === index &&
                    <Check fontSize="small" style={{ color: 'var(--text-color)' }} />
                  }
                </ListItemIcon>
                <ListItemText>{status}</ListItemText>
              </MenuItem>
            )
          })}
        </Menu>

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
            <ListItemIcon>
              <PersonIcon fontSize="small" style={{ color: 'var(--text-color)' }} />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" style={{ color: 'var(--text-color)' }} />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
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
          <MenuItem onClick={handleHideNoti}>
            <ListItemIcon>
              <CloseIcon fontSize="small" style={{ color: 'var(--text-color)' }} />
            </ListItemIcon>
            <ListItemText>Hide</ListItemText></MenuItem>
          <MenuItem onClick={handleDeleteNoti}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" style={{ color: 'var(--text-color)' }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        <strong className="navbar-username">{user.firstName}</strong>
      </div >
    </nav >

  )
}
