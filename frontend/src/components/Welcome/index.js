import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import Loading from "../Loading";
import { Button, Avatar } from '@mui/material';
import { Redirect } from 'react-router-dom';
import { isAuthenticated } from "../../store/reducers/user.reducer";
import './welcome.css';

export default function Welcome() {
  const userReducer = useSelector(state => state.userReducer)
  const dispatch = useDispatch();
  useEffect(() => {
    if (!userReducer.loaded) {
      dispatch(isAuthenticated())
    }
  }, [])

  return (
    !userReducer.loaded ? <Loading />
      : (userReducer.authenticated ? <Redirect to="/home" />
        : <div style={{ "height": "100%" }}>
          <nav className="top-nav">
            <div style={{ display: 'flex', padding: '10px', alignItems: 'center' }}>
              <Link to='/'>
                <Avatar src='meeting-logo.png' style={{
                  width: '40px',
                  height: '40px',
                }} />
              </Link>
              <h3 className="brand">MEETING APP</h3>
            </div>

            <div className="authLink">
              <Link to="/login">
                Login
              </Link>
              <Link to="/signup">
                Sign up
              </Link>
            </div>
          </nav>
          <div id="home-welcome" style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('./welcome-bg.webp')"
          }}>
            <div className="landing-text">
              <h1>MEETING APP</h1>
              <Button variant="contained">
                <Link to="/login">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))
}
