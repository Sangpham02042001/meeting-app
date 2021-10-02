import React, {useState} from 'react'
import { useSelector } from 'react-redux'
import { Container, Navbar as Nav, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { baseURL } from '../../utils'
import Dropdown from '../Dropdown'
import './navbar.css'

export default function Navbar() {
  let user = useSelector(state => state.userReducer.user);
  const [isDropdown, setIsDropdown] = useState(false);
 
  let notifications = useSelector(state => state.notificationReducer.notifications)

  const noti = notifications.map((notification) => {
    return (
      <a href="#" key={notification.id}>
        {notification.content}
      </a>
    )
  })

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
          <button className="dropdown-btn" style={{ color: "white", marginRight: '20px' }} >
            <i className="fas fa-bell"></i>
          </button>
          <div className="dropdown-content">
            {noti}
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
            <a href="#">Logout</a>
          </div>
        </div>

        <strong className="navbar-username">{user.firstName}</strong>
      </div>
    </Nav >

  )
}
