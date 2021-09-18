import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";

export default class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            password_confirmation: "",
            signupErrors: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit(event) {
        
    }

    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={this.state.email}
                        onChange={this.handleChange}
                        required
                    />
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={this.state.password}
                        onChange={this.handleChange}
                        required
                    />
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Nhập lại mật khẩu"
                        value={this.state.password_confirmation}
                        onChange={this.handleChange}
                        required
                    />
                    <Button type="submit">Đăng ký</Button>
                </Form>
            </div>
        )
    }
}