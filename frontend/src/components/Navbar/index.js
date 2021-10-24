import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Container, Navbar as Nav, Col, Row } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { baseURL, timeDiff } from '../../utils'
import Dropdown from '../Dropdown'
import './navbar.css'
import { cleanUser } from '../../store/reducers/user.reducer'
import { getNotifs, readNotif } from '../../store/reducers/notification.reducer'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loading from '../Loading'

export default function Navbar() {
  let user = useSelector(state => state.userReducer.user);
  const dispatch = useDispatch()
  const history = useHistory()
  const [isDropdown, setIsDropdown] = useState(false);

  let notifications = useSelector(state => state.notificationReducer.notifications)
  let numOf_UnReadNotifications = useSelector(state => state.notificationReducer.numOf_UnReadNotifications)
  let hasMore = useSelector(state => state.notificationReducer.hasMore)
  useEffect(() => {
    dispatch(getNotifs(0))
    // dispatch(cleanNotificationState)
  }, [])

  const handleLogout = e => {
    e.preventDefault()
    window.localStorage.removeItem('user')
    history.push('/login')
    // dispatch(cleanUser())
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
        {/* <Dropdown
          style={{ marginRight: '30px' }}
          icon={
            <i style={{ color: '#fff', cursor: 'pointer', fontSize: '20px' }} className="fas fa-bell"></i>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {noti}
          </div>
        </Dropdown>

        <Dropdown
          style={{ marginRight: '20px' }}
          icon={
            <div className='nav-user-avatar'
              style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${user.id}")` }}>
            </div>
          }
        >

          <Link to="/profile">Profile</Link>
          <a href="#">Link 2</a>
          <a href="#">Link 3</a>

        </Dropdown> */}
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
          <button className="dropdown-btn" style={{ color: "white", padding: 0 }}>
            <div className='nav-user-avatar'
              style={{ backgroundImage: `url("${baseURL}/api/user/avatar/${user.id}")` }} >
            </div>
          </button>
          <div className="dropdown-content">
            <Link to="/profile">Profile</Link>
            <a href="#">Link 2</a>
            <span onClick={handleLogout}>Logout</span>
          </div>
        </div>

        <strong className="navbar-username">{user.firstName}</strong>
      </div>
    </Nav >

  )
}
