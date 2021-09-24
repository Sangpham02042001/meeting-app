import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Navbar } from 'react-bootstrap';
import { Link, NavLink } from "react-router-dom";
import './home.css';
import Welcome from "../../components/Welcome";
import HomeComponent from "../../components/HomeComponent";
import { isAuthenticated } from '../../store/reducers/user';
import Loading from "../../components/Loading";

const Home = (props) => {
    const userReducer = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        }
    }, [])

    return (
        !userReducer.loaded ? <Loading /> : (
            userReducer.authenticated ? <>
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <Navbar.Brand href="/">
                            MEETING APP
                        </Navbar.Brand>
                    </Container>
                </Navbar>
                <div className="layout">
                    <div className="list-selection">
                        <div className="user-list-selection">
                            <Link to='/profile'>
                                <button className="btn-user" >
                                    <i className="fas fa-user"></i>
                                </button>
                            </Link>
                        </div>
                        <div className="btn-list-selection">
                            <NavLink exact to='/' activeClassName="btn-active">
                                <button className="btn-default" >Home</button>
                            </NavLink>
                        </div>
                        <div className="btn-list-selection">
                            <NavLink to='/friends' activeClassName="btn-active">
                                <button className="btn-default" >Friend</button>
                            </NavLink>
                        </div>
                        <div className="btn-list-selection">
                            <NavLink to='/teams' activeClassName="btn-active">
                                <button className="btn-default"> Group</button>
                            </NavLink>
                        </div>
                        <div className="btn-list-selection">
                            <NavLink to='/setting' activeClassName="btn-active">
                                <button className="btn-default" >Setting</button>
                            </NavLink>
                        </div>
                    </div>
                    <HomeComponent />
                </div>
            </> : <Welcome />
        )
    );
};

export default Home;