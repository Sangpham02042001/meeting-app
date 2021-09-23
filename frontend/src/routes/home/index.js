import React, { useState } from "react";
import { v1 as uuid } from "uuid";
import { Button, Container, Navbar } from 'react-bootstrap';
import './home.css';

const Home = (props) => {
    const [isFriendList, setIsFriendList] = useState(false);
    const [isGroupList, setIsGroupList] = useState(false);

    const create = () => {
        const id = uuid();
        props.history.push(`/meeting/${id}`);
    }

    const handleShowFriendList = () => {
        if (isGroupList) {
            setIsGroupList(false)
        }
        setIsFriendList(true);

    }

    const handleShowGroupList = () => {
        if (isFriendList) {
            setIsFriendList(false)
        }
        setIsGroupList(true);

    }


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
                <div className="list-selection">
                    <div className="user-list-selection">
                        <button className="btn-user">
                            <i className="fas fa-user"></i>
                        </button>
                    </div>
                    <div className="btn-list-selection">
                        <button className={isFriendList ? "btn-active" : "btn-default"} onClick={handleShowFriendList}>Friend</button>
                    </div>
                    <div className="btn-list-selection">
                        <button className={isGroupList ? "btn-active" : "btn-default"} onClick={handleShowGroupList}>Group</button>
                    </div>
                    <div className="btn-list-selection">
                        <button className="btn-default" >Note</button>
                    </div>
                    <div className="btn-list-selection">
                        <button className="btn-default" >Setting</button>
                    </div>

                </div>
                {isFriendList &&
                    <>
                        <div className="friend-chat-list">
                            <div className="friend-chat">
                                <div>Avatar</div>
                                <div style={{ marginLeft: "15px" }}>
                                    <div>
                                        Name
                                    </div>
                                    <div>content</div>
                                </div>
                            </div>
                            <div className="friend-chat">
                                <div>Avatar</div>
                                <div style={{ marginLeft: "15px" }}>
                                    <div>
                                        Name
                                    </div>
                                    <div>content</div>
                                </div>
                            </div>
                        </div>
                        <div className="friend-chat-content">
                            <h2>Content</h2>
                        </div>
                    </>
                }
                {isGroupList &&
                    <>
                        <div className="group-chat-list">
                            <div className="group-chat">
                                <div>Avatar</div>
                                <div style={{ marginLeft: "15px" }}>
                                    <div>
                                        Group
                                    </div>
                                    <div>content </div>
                                </div>
                            </div>
                            <div className="group-chat">
                                <div>Avatar</div>
                                <div style={{ marginLeft: "15px" }}>
                                    <div>
                                        Group
                                    </div>
                                    <div>
                                        content

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="group-chat-content">
                            <h2>Content</h2>
                            <div className="btn-list-selection">
                                <Button onClick={create} style={{color: "black"}}>
                                    Start
                                </Button>
                            </div>
                        </div>
                        <div className="member-group">
                            <div>
                                member 1
                            </div>
                            <div>
                                memeber 2
                            </div>
                            <div>
                                member 3
                            </div>
                            <div>
                                memeber 4
                            </div>
                            <div>
                                memeber 5
                            </div>
                        </div>
                    </>
                }

            </div>
        </>
    );
};

export default Home;