import React from 'react';
import './homeComponent.css';

export default function HomeComponent() {

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
                        href="something.php"
                        className="contact-links"
                        target="_blank"
                    ><i className="fab fa-facebook-square"></i></a>
                    <a
                        id="profile-link"
                        href="something.php"
                        className="contact-links"
                        target="_blank"
                    ><i className="fab fa-github"></i></a>
                    <a
                        href="something.php"
                        className="contact-links"
                        target="_blank"
                    ><i className="fab fa-twitter"></i></a>
                    <a
                        href="something.php"
                        className="contact-links"
                        target="_blank"
                    ><i className="fas fa-at"></i></a>
                </div>
            </div>
            <div className="home-items" id="end-item">
                <div id="calendar">
                    <h1>Calendar or Up-coming</h1>
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
