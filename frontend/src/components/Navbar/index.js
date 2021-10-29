import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navbar as Nav } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { baseURL, timeDiff } from '../../utils'
import './navbar.css'
import { getNotifs, readNotif } from '../../store/reducers/notification.reducer'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loading from '../Loading'
import Avatar from '../Avatar/index'

export default function Navbar() {
  let user = useSelector(state => state.userReducer.user);
  const dispatch = useDispatch()
  const history = useHistory()

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
  }

  const handleLogout = e => {
    e.preventDefault()
    window.localStorage.removeItem('user')
    history.push('/login')
    location.reload()
  }

  const handleNotif = e => {
    // e.preventDefault()
    setTimeout(() => {
      dispatch(getNotifs(notifications.length))
    }, 500)
  }

  const handleReadNotif = (e, notifId) => {
    e.preventDefault()
    dispatch(readNotif(notifId))
  }

  return (
    <Nav bg="dark" variant="dark" className="navbar">
      <Nav.Brand href="/" className="nav-brand">
        MEETING APP
      </Nav.Brand>
      <div className="navbar-btn">
        <div className="dropdown" >
          <button className="dropdown-btn" style={{ color: "white" }} >
            <i className="fas fa-bell"></i>
            {numOf_UnReadNotifications > 0 && <span className="position-absolute top-3 start-100 translate-middle badge rounded-pill bg-danger">{numOf_UnReadNotifications}</span>}
          </button>
          <div className="dropdown-notification dropdown-content" id="dropdown-notification">
            <InfiniteScroll
              dataLength={notifications.length}
              next={handleNotif}
              hasMore={hasMore}
              loader={<div className="notification justify-content-center"><img src="/loading.gif" className="loadingNotification" /></div>}
              scrollableTarget="dropdown-notification"
              endMessage={<p style={{ textAlign: 'center' }}>
                <b>There is no more notification!</b>
              </p>}>
              {notifications.map((notification) => {
                let imgSrc = `${baseURL}/api/user/avatar/${notification.createdBy}`
                let style = {}
                if (notification.isRead == 1) {
                  style = {
                    // 'borderLeft': "4px solid var(--white)",
                    'position': "relative",
                    'borderRadius': "5px",
                    // 'fontWeight': "normal"
                  }
                } else if (notification.isRead == 0) {
                  style = {
                    // 'borderLeft': "4px solid #85C1E9",
                    'position': "relative",
                    'borderRadius': "5px",
                    // 'fontWeight': "bold"
                  }
                }
                return (
                  <Link className="notification" onClick={() => handleReadNotif(event, notification.id)} to={notification.relativeLink} key={notification.id} style={style}>
                    {notification.isRead ? null : (<i className="bi bi-circle-fill" style={{ color: "rbg(0,312,255,1)", position: "absolute", top: "3px" }}></i>)}
                    <img className="notificationImg" src={imgSrc}></img>
                    {notification.content}
                    <br />
                    <span style={{ fontSize: '15px' }}>{timeDiff(notification.timeDifferent)}</span>
                    <div />
                  </Link>
                )
              })}
            </InfiniteScroll>
          </div>
        </div>

        <div className="dropdown" >
          <button className="dropdown-btn" style={{ color: "white", padding: 0, textAlign: 'center' }}>
            <Avatar width="36px" height="36px" userId={user.id} />
          </button>
          <div className="dropdown-content logout-container">
            <div onClick={handleProfile}>Profile</div>
            <div onClick={handleLogout}>Logout</div>
          </div>
        </div>

        <strong className="navbar-username">{user.firstName}</strong>
      </div>
    </Nav >

  )
}
