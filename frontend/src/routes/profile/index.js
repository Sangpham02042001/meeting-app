import React from 'react';
import './profile.css';

export default function Profile() {

    return (
        <div className="container">
            <div className="profile-content" id="pro-content">
                <h1>Personal info</h1>
                <div class="info">
                    <div className="row">
                        <label className="card-info">Full name</label>
                        <input type="text" className="input-info" value="SpicyCode"></input>
                    </div>
                    <div className="row">
                        <label className="card-info">Birthday</label>
                        <input type="text" className="input-info"></input>
                    </div>
                    <div className="row">
                        <label className="card-info">Gender</label>
                        <input type="text" className="input-info"></input>
                    </div>
                    <div className="row">
                        <label className="card-info">Email</label>
                        <input type="text" className="input-info"></input>
                    </div>
                    <div className="row">
                        <label className="card-info">Phone</label>
                        <input type="text" className="input-info"></input>
                    </div>
                    <div className="row">
                        <label className="card-info">Address</label>
                        <input type="text" className="input-info"></input>
                    </div>
                </div>
            </div>
            <div className="teams">
                <h1>Your teams</h1>
            </div>
        </div>
    )
}
