import React from 'react'
import { Container, Navbar as Nav } from 'react-bootstrap'

export default function Navbar() {
  return (
    <Nav bg="dark" variant="dark">
      <Container>
        <Nav.Brand href="/">
          MEETING APP
        </Nav.Brand>
      </Container>
    </Nav>
  )
}
