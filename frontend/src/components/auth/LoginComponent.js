import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from 'axios';
import Loading from "../Loading";
import { isAuthenticated } from "../../store/reducers/user.reducer";
import { baseURL } from "../../utils/config";
import './auth.css'
// import "frontend/src/App.css";

export default function Login() {
    const userReducer = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        }
    }, [])

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        const data = {
            email,
            password
        }
        // window.localStorage.setItem('user', JSON.stringify({trung: "hello"}))

        axios
            .post(
                `${baseURL}/api/signin`,
                data
            )
            .then((response) => {
                console.log(response);
                setLoginError('');
            })
            .catch(error => {
                console.log(error);
                setLoginError("Invalid email or password.");
            })
    }
    
    return (
        !userReducer.loaded ? <Loading />
            : (userReducer.authenticated ? <Redirect to="/" />
            :
            <div className="container-fluid loginPage d-flex vh-100 vw-100 justify-content-center align-items-center">
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