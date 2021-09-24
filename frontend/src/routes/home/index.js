import React, { useState } from "react";
import { Button, Container, Navbar } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch, Redirect, Link, NavLink } from "react-router-dom";
import './home.css';
import Teams from "../teams";
import Friends from "../friends";
import Setting from "../setting";
import Profile from "../profile";

const Home = (props) => {

    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/">
                        MEETING APP
                    </Navbar.Brand>
                </Container>
            </Navbar>
            <div className="home-app">
                <Router>
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
                            <NavLink to='/teams'  activeClassName="btn-active">
                                <button className="btn-default"> Group</button>
                            </NavLink>
                        </div>
                        <div className="btn-list-selection">
                            <NavLink to='/setting'  activeClassName="btn-active">
                                <button className="btn-default" >Setting</button>
                            </NavLink>
                        </div>
                    </div>
                    <Switch>
                        <Route exact path="/">
                            <h1>
                                Hello
                            </h1>
                        </Route>
                        <Route path="/profile">
                            <Profile />
                        </Route>
                        <Route path="/friends" >
                            <Friends />
                        </Route>
                        <Route path="/teams" >
                            <Teams />
                        </Route>
                        <Route path="/setting" >
                            <Setting />
                        </Route>
                    </Switch>
                </Router>

            </div>
        </>
    );
};

export default Home;