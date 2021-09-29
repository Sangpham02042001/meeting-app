import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './conversations.css';
import { Button } from 'react-bootstrap';
import { axiosAuth, socketClient } from '../../utils';
import { sendMessage } from '../../store/reducers/conversation.reducer';
import { Route, Switch, Redirect, Link } from "react-router-dom";
import { baseURL } from '../../utils';
import Avatar from '../../components/Avatar';

export default function Conversations() {
    const [rows, setRows] = useState(1);
    const [message, setMessage] = useState('');
    const [textSearch, setTextSearch] = useState('');
    const [searchUsers, setSearchUsers] = useState([]);
    const [userChatList, setUserChatList] = useState([]);
    const minRows = 1;
    const maxRows = 5;

    const messages = useSelector(state => state.conversationReducer.messages);
    const user = useSelector(state => state.userReducer.user);

    const dispatch = useDispatch();

    const onWriteMessage = (event) => {
        const textareaLineHeight = 24;

        const previousRows = event.target.rows;
        event.target.rows = minRows; // reset number of rows in textarea 
        const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }

        if (currentRows >= maxRows) {
            event.target.rows = maxRows;
            event.target.scrollTop = event.target.scrollHeight;
        }
        setRows(currentRows < maxRows ? currentRows : maxRows)
        setMessage(event.target.value);
    }

    const onScrollChange = (event) => {
        console.log(event.target.scrollHeight)
        event.target.scrollTop = event.target.scrollHeight;
    }

    const handleEnterMessage = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(event);
            setMessage('');
        }
    }

    const handleSendMessage = (event) => {
        if (message !== '') {

            let { id, userName } = user;
            dispatch(sendMessage({ content: message, userId: id, userName, conversationId: null }));
            setMessage('');
        }

    }

    const onSearch = async (event) => {
        let searchUserName = event.target.value.trim();
        setTextSearch(event.target.value)

        if (searchUserName !== '') {
            let response = await axiosAuth.post('/api/users/search', {
                text: searchUserName.trim(),
            })
            setSearchUsers(response.data.users)
            return;
        }

        setSearchUsers([]);
    }

    const handleChooseUser = (userFind, event) => {
        setSearchUsers([]);
        setTextSearch('');

        for (let userChat of userChatList) {
            if (userChat.id === userFind.id) {
                return;
            }
        }
        setUserChatList(userChatList => {
            userChatList.push(userFind)

            return userChatList;
        })
    }

    return (
        <>
            <div className="conversation-list">
                <div className="search-user">
                    <input
                        type="search"
                        placeholder="Search"
                        className="input-search"
                        aria-label="Search"
                        onChange={onSearch}
                        value={textSearch}
                    />
                </div>

                {searchUsers.length > 0 &&
                    searchUsers.map(userFind => {
                        return (
                            <div className="search-list" key={userFind.id} >
                                <div className="user-find" onClick={event => handleChooseUser(userFind, event)}>
                                    <div>
                                        {userFind.userName}
                                    </div>
                                    <div>
                                        {userFind.email}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }

                <div className="conversation-user">
                    {userChatList.length > 0 &&
                        userChatList.map(userChat => {
                            return (
                                <Link to={`/conversations/${userChat.id}`} key={userChat.id} style={{ textDecoration: "none", color: "black", width: "100%", display: "flex", justifyContent: "center" }}>
                                    <div className="user-chat">
                                        <Avatar width="40px" height="40px" userId={userChat.id} />
                                        <div style={{ marginLeft: "15px" }}>
                                            {userChat.userName}
                                            <div style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "120px", opacity: "0.6"}}>
                                                {messages.length > 0 ?
                                                    (messages[messages.length - 1].userId === user.id ?
                                                       <span>You: {messages[messages.length - 1].content}</span>
                                                       :
                                                       <span>{userChat.userName}: {messages[messages.length - 1].content}</span>
                                                    )                                                   
                                                    :
                                                    null
                                                }
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            )
                        })
                    }
                </div>
            </div>
            <div className="conversation-content">
                <Switch>
                    {userChatList.map(userChat => {
                        return (
                            <Route path={`/conversations/${userChat.id}`} key={userChat.id}>
                                <div className="conversation-message">
                                    <div className="header-message">
                                        <div className="header-name">
                                            <Avatar width="40px" height="40px" userId={user.id} />
                                            <div style={{ display: "flex", alignItems: "center", fontSize: "17px", marginLeft: "15px" }}>
                                                <Link to="/profile" style={{ color: "black", textDecoration: "none" }}>{userChat.userName}</Link>
                                            </div>
                                        </div>
                                        <div className="header-btn-list">
                                            <button className="header-btn">
                                                <i style={{ color: "#1A73E8", fontSize: "20px" }} className="fas fa-phone"></i>
                                            </button>
                                            <button className="header-btn">
                                                <i style={{ color: "#1A73E8", fontSize: "20px" }} className="fas fa-video"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="content-message" onChange={onScrollChange}>
                                        {messages.map((message, idx) => {
                                            return (
                                                <div key={idx} className={message.userId === user.id ? "my-message" : "user-message"}>
                                                    <div className='message-send'>
                                                        {message.content}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="input-message">
                                        <textarea className="input-box"
                                            placeholder="Send message"
                                            rows={rows}
                                            onChange={onWriteMessage}
                                            onKeyDown={handleEnterMessage}
                                            value={message}
                                        />
                                        <div className="input-btn">
                                            <Button variant="outline-light" onClick={handleSendMessage}>
                                                <i style={{ color: "#1A73E8" }} className="far fa-paper-plane"></i>
                                            </Button>
                                            <Button variant="outline-light" onClick={handleSendMessage}>
                                                <i style={{ color: "#69B00B" }} className="fas fa-image"></i>
                                            </Button>
                                            <Button variant="outline-light" onClick={handleSendMessage}>
                                                <i style={{ color: "#1A73E8" }} className="fas fa-thumbs-up"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="conversation-custom">
                                    <div className="custom-info">
                                        <Avatar width="100px" height="100px" userId={userChat.id} />
                                        <div style={{ fontSize: "36px" }}>
                                            {userChat.userName}
                                        </div>
                                    </div>

                                </div>

                            </Route>
                        )
                    })}
                </Switch>
            </div>
        </>
    )
}
