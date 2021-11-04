import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Loading from "../Loading";
import { Link, Button } from '@mui/material';
import { Redirect } from 'react-router-dom';
import { isAuthenticated } from "../../store/reducers/user.reducer";
import './welcome.css';

export default function Welcome() {
  const userReducer = useSelector(state => state.userReducer)
  const dispatch = useDispatch()

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
            <h3 className="brand">MEETING APP</h3>
            <div className="authLink">
              <Button variant="text" style={{ color: '#fff' }} href="/login">Login</Button>
              <Button variant="text" style={{ color: '#fff' }} href="/signup">Sign Up</Button>
            </div>
          </nav>
          <div id="home">
            <div className="landing-text">
              <h1>MEETING APP</h1>
              <Button variant="contained" href="/home">Get Started</Button>
            </div>
          </div>
        </div>
      ))
}
