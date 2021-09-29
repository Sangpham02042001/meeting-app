import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Modal } from "react-bootstrap";
import { useHistory } from "react-router";
import { Link, Redirect } from "react-router-dom";
import Loading from "../Loading";
import { isAuthenticated, signin } from "../../store/reducers/user.reducer";
import './auth.css'
// import "frontend/src/App.css";

export default function Login(...rest) {
    const userReducer = useSelector(state => state.userReducer)
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        } else {
            if (userReducer.authenticated) {
                console.log('redirect')
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
                : <div className="container-fluid loginPage d-flex vh-100 vw-100 justify-content-center align-items-center">
                    <div className="row vw-100 mx-5 align-items-center form-container">
                        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Meeting App</h1>
                        <div className="row col-6 col-md-5 auth-form align-items-center d-flex justify-content-center">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="off"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Remember me" />
                                </Form.Group>
                                {loginError && <p className='error-message'>{loginError}</p>}
                                <div className="d-grid gap-2 mb-3">
                                    <Button className="mb-3 submit" type="submit">
                                        <h4 style={{ margin: 0 }}>Log in</h4>
                                    </Button>
                                </div>
                                <div className="d-flex otherLogin mb-1">
                                    <div>Or log in with:</div>
                                    <a href="#" className="btn btn-secondary"><i className="bi bi-facebook"></i></a>
                                    <a href="#" className="btn btn-info"><i className="bi bi-twitter"></i></a>
                                    <a href="#" className="btn btn-danger"><i className="bi bi-google"></i></a>
                                </div>
                            </Form> <br /> <br />
                            <p style={{ textAlign: 'center', marginBottom: 0 }}>
                                Don't have account? <Link to="/signup">Sign up here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )
    )
}