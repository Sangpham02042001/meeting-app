import React from "react";
import { v1 as uuid } from "uuid";
import { Button, Container, Navbar } from 'react-bootstrap';
import './home.css';

const Home = (props) => {
    function create() {
        const id = uuid();
        props.history.push(`/meeting/${id}`);
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

            <ul className="list-selection">
                <li>
                    <Button>Chat</Button>
                </li>
                <li>
                    <Button>Group</Button>
                </li>
                <li>
                    <Button onClick={create}>
                        Start meeting
                    </Button>
                </li>
            </ul>

            <div className="list-chatbox">

            </div>
        </>
    );
};

export default Home;