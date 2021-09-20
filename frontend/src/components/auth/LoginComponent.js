import React, { Component } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import SignUp from "./SignUpComponent";
// import "frontend/src/App.css";

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            loginErrors: "",
            isModalOpen: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit(event) {
        
    }

    toggleModal() {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        });
    }

    render() {
        return (
            <div>
                <div className="container-fluid loginPage d-flex vh-100 vw-100 justify-content-center align-items-center">
                    <div className="row vw-100 mx-5 align-items-center">
                        <div className="text-light col-md-3 offset-md-2 align-items-center justify-content-center">
                            <h1>ĐĂNG NHẬP</h1>
                        </div>
                        <div className="row col-6 col-md-5 offset-md-2 login align-items-center d-flex justify-content-center">
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label><h3>Email</h3></Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="Email"
                                        value={this.state.email}
                                        onChange={this.handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label><h3>Mật khẩu</h3></Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="Mật khẩu"
                                        value={this.state.password}
                                        onChange={this.handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Remember me" />
                                </Form.Group>
                                <div className="d-grid gap-2 mb-3">
                                    <Button dark className="mb-3 submit" type="submit"><h4>Đăng nhập</h4></Button> 
                                </div>
                                <div className="d-flex otherLogin mb-1">
                                    <div>Hoặc đăng nhập bằng:</div>
                                    <a href="#" className="btn btn-secondary"><i className="bi bi-facebook"></i></a>
                                    <a href="#" className="btn btn-info"><i className="bi bi-twitter"></i></a>
			                        <a href="#" className="btn btn-danger"><i className="bi bi-google"></i></a>
                                </div>
                            </Form>
                            <Button dark onClick={this.toggleModal}>Chưa có tài khoản? Đăng ký</Button>
                        </div>
                    </div>
                </div>
                <Modal show={this.state.isModalOpen} onHide={this.toggleModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Đăng ký</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SignUp/>
                    </Modal.Body>
                </Modal>
            </div>

        )
    }
}