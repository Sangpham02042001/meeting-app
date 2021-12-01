import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import Loading from "../Loading";
import { Button, Avatar, Container } from '@mui/material';
import { Redirect } from 'react-router-dom';
import { isAuthenticated } from "../../store/reducers/user.reducer";
import './welcome.css';
import Carousel from 't-a-e-3d-carousel-reactjs';

export default function Welcome() {
  var state = {
    goToSlide: 0
  };
  const userReducer = useSelector(state => state.userReducer)
  const dispatch = useDispatch();
  useEffect(() => {
    if (!userReducer.loaded) {
      console.log('hello')
      dispatch(isAuthenticated())
    }
  }, [])

  const slides = [
    {
      url: "welcome/teams.png"
    },
    {
      url: "welcome/meetings.png"
    },
    {
      url: "welcome/messages.png"
    },
    {
      url: "welcome/team_messages.png"
    },
    {
      url: "welcome/home.png"
    }
  ];

  return (
    !userReducer.loaded ? <Loading />
      : (userReducer.authenticated ? <Redirect to="/home" />
        : <div className="welcome-page" style={{ "height": "100%" }}><div className="landing-page">
          <nav className="top-nav">
            <div style={{ display: 'flex', padding: '10px', alignItems: 'center' }}>
              <Link to='/'>
                <Avatar src='meeting-logo.png' style={{
                  width: '40px',
                  height: '40px',
                }} />
              </Link>
              <h4 className="brand">MEETING APP</h4>
            </div>

            <div className="authLink">
              <Link to="/login">
                <Button variant="contained" size="medium">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="contained" size="medium">
                  Sign up
                </Button>
              </Link>
            </div>
          </nav>
          <div className="welcome-content">
            <div className="description">
              <h1>MEETING APP</h1>
              <div>Feel free to connect and stay close to your favourite people!</div>
            </div>
            <div className="carousel-content">
              <Carousel
                className="carousel"
                imageList={slides}
                autoplay={true}
                showArrows={false}
                interval={"2500"} />
            </div>
          </div>
        </div>
        </div>
      ))
}
