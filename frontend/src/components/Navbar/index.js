import React from 'react'
import { Container, Navbar as Nav, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './navbar.css'

export default function Navbar() {
  return (
    <Nav bg="dark" variant="dark" className="navbar">
      <Nav.Brand href="/" className="nav-brand">
        MEETING APP
      </Nav.Brand>

      <div className="navbar-btn">
        <div className="dropdown" >
          <button className="dropdown-btn" style={{ color: "white" }}>
            <i className="fas fa-bell"></i>
          </button>
          <div className="dropdown-content">
            <Link to="/profile">Profile</Link>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
          </div>
        </div>

        <div className="dropdown" >
          <button className="dropdown-btn" style={{ color: "white" }}>
            <i className="fas fa-user"></i>
          </button>
          <div className="dropdown-content">
            <Link to="/profile">Profile</Link>
            <a href="#">Link 2</a>
            <a href="#">Logout</a>
          </div>
        </div>

      </div>
    </Nav >

  )
}
