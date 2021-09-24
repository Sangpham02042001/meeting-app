import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import './auth.css'

export default function SignUp() {
    // constructor(props) {
    //     super(props);

    //     this.state = {
    //         email: "",
    //         password: "",
    //         password_confirmation: "",
    //         signupErrors: ""
    //     }

    //     this.handleChange = this.handleChange.bind(this);
    //     this.handleSubmit = this.handleSubmit.bind(this);
    // }
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordCfError, setPasswordCfError] = useState('')

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
                    setPasswordError('')
                }
                break;
            case "passwordConfirmation":
                setPasswordConfirmation(val)
                break;
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (password.length < 6) {
            setPasswordError('Password must has at least 6 characters')
            return
        }
        if (password !== passwordConfirmation) {
            setPasswordCfError("Confirm password doesn't match")
            return
        }
    }
    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className="form-container">
                <h1 style={{ marginBottom: '30px' }}>Meeting App</h1>
                <Form onSubmit={handleSubmit} className="auth-form">
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            name="firstName"
                            placeholder="First Name"
                            value={firstName}
                            onChange={handleChange("firstName")}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            name="lastName"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={handleChange("lastName")}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={email}
                            onChange={handleChange("email")}
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
                            onChange={handleChange("password")}
                            required
                            autoComplete="off"
                        />
                    </Form.Group>
                    {passwordError && <p className="error-message">
                        {passwordError}
                    </p>}
                    <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Confirm Password"
                            value={passwordConfirmation}
                            onChange={handleChange("passwordConfirmation")}
                            required
                            autoComplete="off"
                        />
                    </Form.Group>
                    {passwordCfError && <p className="error-message">
                        {passwordCfError}
                    </p>}
                    <div>
                        <Button className="mb-3 submit-btn" type="submit">Sign up</Button> <br />
                        <p style={{ textAlign: 'center', marginBottom: 0 }}>
                            Have account ? <Link to="/login">Sign in here</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    )
}