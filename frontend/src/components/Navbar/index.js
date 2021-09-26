import React from 'react'
import { Link } from "react-router-dom"
import { Container, Navbar as Nav, Dropdown } from 'react-bootstrap'


export default function Navbar() {
  return (
    <Nav bg="dark" variant="dark">
      <Container fluid>
        <Nav.Brand href="/">
          MEETING APP
        </Nav.Brand>

        <Dropdown>
          <Dropdown.Toggle>
            <i className="fas fa-user"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item>
              <Link to='/profile'>
                <i className="fas fa-user"></i>
              </Link>
            </Dropdown.Item>
            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            <Dropdown.Item href="/logout">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Nav>
  )
}
