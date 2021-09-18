import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            loginErrors: ""
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
            <div className="container login w-100 h-100 mw-100 mh-100">
                <div className="row justify-content-md-center align-items-center">
                    <div className="col-12 col-md-4">
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
                            <Button type="submit">Đăng nhập</Button>
                        </Form>
                        <Link to="/signup">Chưa có tài khoản? Đăng ký</Link>
                    </div>
                </div>
            </div>
        )
    }
}