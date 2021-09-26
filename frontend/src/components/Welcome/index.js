import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div>
      <h1>Welcome</h1>
      <Link to='/login'>
        <Button variant="primary">Login</Button>
      </Link>
    </div>
  )
}
