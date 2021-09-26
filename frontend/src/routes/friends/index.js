import React from 'react';
import './friends.css'

export default function Friends() {
    return (
        <>
            <div className="layout-leftside-list">
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
            <div className="layout-rightside-content">
                <h2>Content</h2>
            </div>
        </>
    )
}
