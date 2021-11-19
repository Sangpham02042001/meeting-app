import React, { useState } from 'react';
import './home.css';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import moment from 'moment'

export default function Home() {

    // const [date, setDate] = useState(new Date());
    // const changeDate= (e) => {
    //     setDate(e);
    // }

    return (
        <div className="home-component">
            <div className="home-items" id="start-item">
                <img src="world-map.svg" id="world-img"></img>
                <div>
                    <a
                        id="help"
                        className="footer-button"
                        href="#"
                    ><i className="far fa-question-circle"></i> Help</a>
                </div>
            </div>
            <div className="home-items" id="center-item">
                <h1>Welcome to meeting app</h1>
                <img src="Remote-team-bro.svg" id="home-image"></img>
                <div id="profile">
                    <a
                        href="#"
                        className="contact-links"
                    ><i className="fab fa-facebook-square"></i></a>
                    <a
                        id="profile-link"
                        href="#"
                        className="contact-links"
                    ><i className="fab fa-github"></i></a>
                    <a
                        href="#"
                        className="contact-links"
                    ><i className="fab fa-twitter"></i></a>
                    <a
                        href="#"
                        className="contact-links"
                    ><i className="fas fa-at"></i></a>
                </div>
            </div>
            <div className="home-items" id="end-item">
                <div id="calendar">
                    {/* <Calendar 
                        value={date}
                        onChange={changeDate}
                    />
                    <p>Current selected date is <b>{moment(date).format('MMMM Do YYYY')}</b></p> */}
                </div>
                <div>
                    <a
                        href="#"
                        id="customize"
                        className="footer-button"
                    ><i className="fas fa-pencil-alt"></i>Customize</a>
                </div>
            </div>
        </div>
    )
}
