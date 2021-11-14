import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
    TextField, Button, Dialog,
    DialogTitle, DialogContent, DialogActions,
    Alert, Snackbar
} from '@mui/material';
import { Link, Redirect } from 'react-router-dom';
import Loading from "../Loading";
import { isAuthenticated } from "../../store/reducers/user.reducer";
import { axiosInstance } from "../../utils";
import './auth.css'

export default function SignUp() {
    const userReducer = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        }
    }, [])

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [isDialogShow, setModalShow] = useState(false)
    const [signupError, setSignupError] = useState('')

    const handleChange = type => event => {
        let val = event.target.value;
        switch (type) {
            case "firstName":
                setFirstName(val)
                break;
            case "lastName":
                setLastName(val)
                break;
            case "email":
                setEmail(val)
                break;
            case "password":
                setPassword(val)
                if (val.length >= 6) {
                    setSignupError('')
                }
                break;
            case "passwordConfirmation":
                setPasswordConfirmation(val)
                if (val === password) {
                    setSignupError('')
                }
                break;
        }
    }

    const handleCloseDialog = () => {
        setModalShow(false)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (password.length < 6) {
            setSignupError('Password must has at least 6 characters')
            return
        }
        if (password !== passwordConfirmation) {
            setSignupError("Confirm password doesn't match")
            return
        }
        let data = {
            email,
            password,
            firstName,
            lastName
        }

        axiosInstance.post('/api/signup', data)
            .then((response) => {
                if (response.status === 201) {
                    setEmail('')
                    setFirstName('')
                    setLastName('')
                    setPassword('')
                    setPasswordConfirmation('')
                    setModalShow(true)
                }
                setSignupError('');
            })
            .catch(error => {
                setSignupError(email + " is already being used.");
            })
    }
    return (
        !userReducer.loaded ? <Loading />
            : (userReducer.authenticated ? <Redirect to="/" />
                : <div className="auth-page">
                    <div className="form-container">
                        <h1 style={{ marginBottom: '30px' }}>Meeting App</h1>
                        <form onSubmit={handleSubmit} className="auth-form">
                            <TextField
                                name="firstName"
                                label="First Name"
                                required
                                value={firstName}
                                onChange={handleChange("firstName")}
                                variant="standard"
                            />
                            <TextField
                                name="lastName"
                                label="Last Name"
                                required
                                value={lastName}
                                onChange={handleChange("lastName")}
                                variant="standard"
                            />
                            <TextField
                                type="email"
                                name="email"
                                label="Email"
                                required
                                value={email}
                                onChange={handleChange("email")}
                                variant="standard"
                            />
                            <TextField
                                type="password"
                                name="password"
                                label="Password"
                                required
                                value={password}
                                onChange={handleChange("password")}
                                autoComplete="off"
                                variant="standard"
                            />
                            <TextField
                                type="password"
                                name="password"
                                label="Confirm Password"
                                required
                                value={passwordConfirmation}
                                onChange={handleChange("passwordConfirmation")}
                                variant="standard"
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ marginBottom: 0 }}>
                                    Have account ? <Link to="/login">Sign in here</Link>
                                </p>
                                <Button variant="contained" type="submit"
                                    disabled={!email || !password || !email || !passwordConfirmation || !firstName || !lastName}>
                                    Sign up
                                </Button>
                            </div>
                        </form>
                    </div>
                    <Dialog open={isDialogShow} onClose={handleCloseDialog}>
                        <DialogTitle>Welcome to Meeting App</DialogTitle>
                        <DialogContent>
                            Sign up successfully.
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>
                                Close
                            </Button>
                            <Button>
                                <Link style={{ textDecoration: 'none' }} to='/login'>
                                    Log in now
                                </Link>
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Snackbar open={signupError.length > 0} autoHideDuration={3000} onClose={e => setSignupError('')}>
                        <Alert severity="error">
                            {signupError}
                        </Alert>
                    </Snackbar>
                </div>)
    )
}