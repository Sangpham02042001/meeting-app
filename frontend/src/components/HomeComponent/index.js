import React from 'react';
import './homeComponent.css';

export default function HomeComponent() {

    return (
        <div className="home-component">
            <div class="home-items" id="start-item">
                <img src="world-map.svg" id="world-img"></img>
                <div>
                    <a
                        id="help"
                        class="footer-button"
                        href="#"
                    ><i class="far fa-question-circle"></i> Help</a>
                </div>
            </div>
            <div class="home-items" id="center-item">
                <h1>Welcome to meeting app</h1>
                <img src="Remote-team-bro.svg" id="home-image"></img>
                <div id="profile">
                    <a
                        href="something.php"
                        class="contact-links"
                        target="_blank"
                    ><i class="fab fa-facebook-square"></i></a>
                    <a
                        id="profile-link"
                        href="something.php"
                        class="contact-links"
                        target="_blank"
                    ><i class="fab fa-github"></i></a>
                    <a
                        href="something.php"
                        class="contact-links"
                        target="_blank"
                    ><i class="fab fa-twitter"></i></a>
                    <a
                        href="something.php"
                        class="contact-links"
                        target="_blank"
                    ><i class="fas fa-at"></i></a>
                </div>
            </div>
            <div class="home-items" id="end-item">
                <div id="calendar">
                    <h1>Calendar or Up-coming</h1>
                </div>
                <div>
                    <a
                        href="#"
                        id="customize"
                        class="footer-button"
                    ><i class="fas fa-pencil-alt"></i>Customize</a>
                </div>
            </div>
        </div>
    )
}
