import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button } from '@mui/material';
import { useHistory } from "react-router";
import { Link, Redirect } from "react-router-dom";
import Loading from "../Loading";
import { isAuthenticated, signin } from "../../store/reducers/user.reducer";
import './auth.css'
// import "frontend/src/App.css";

export default function Login() {
    const userReducer = useSelector(state => state.userReducer)
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        } else {
            if (userReducer.authenticated) {
                history.push('/')
            } else if (userReducer.error) {
                setLoginError(userReducer.error)
            } else {
                if (!userReducer.authenticated) {
                    dispatch(isAuthenticated())
                }
            }
        }
    }, [userReducer.authenticated, userReducer.error, userReducer.loaded])

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(signin({ email, password }))
    }

    return (
        !userReducer.loaded ? <Loading />
            : (userReducer.authenticated ? <Redirect to="/" />
                : <div className="loginPage">
                    <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Meeting App</h1>
                    <form onSubmit={handleSubmit} className="auth-form">
                        <TextField
                            type="email"
                            name="email"
                            value={email}
                            variant="standard"
                            label="Email"
                            onChange={(e) => setEmail(e.target.value)} />
                        <TextField
                            type="password"
                            name="password"
                            label="Password"
                            value={password}
                            variant="standard"
                            onChange={(e) => setPassword(e.target.value)} />
                        {loginError && <p className='error-message'>{loginError}</p>}
                        <div style={{ textAlign: 'right' }}>
                            <Button type="submit" variant="contained">Log in</Button>
                        </div>
                        {/* <div className="d-flex otherLogin mb-1">
                                    <div>Or log in with:</div>
                                    <a href="#" className="btn btn-secondary"><i className="bi bi-facebook"></i></a>
                                    <a href="#" className="btn btn-info"><i className="bi bi-twitter"></i></a>
                                    <a href="#" className="btn btn-danger"><i className="bi bi-google"></i></a>
                                </div> */}
                        <p style={{ textAlign: 'center', marginBottom: 0 }}>
                            Don't have account?{"\t"}
                            <Link to="/signup" style={{ display: 'inline-block' }}>Sign up here</Link>
                        </p>
                    </form> <br /> <br />
                </div>
            )
    )
}