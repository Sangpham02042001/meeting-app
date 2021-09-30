import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './conversations.css';
import { axiosAuth } from '../../utils';
import { getConversations } from '../../store/reducers/conversation.reducer';
import { Switch } from "react-router-dom";

import UserChatLink from '../../components/UserChatLink';
import UserChatList from '../../components/UserChatList';

export default function Conversations() {
    const [textSearch, setTextSearch] = useState('');
    const [searchUsers, setSearchUsers] = useState([]);
    const [userChatList, setUserChatList] = useState([]);

    const user = useSelector(state => state.userReducer.user);
    const conversations = useSelector(state => state.conversationReducer.conversations);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getConversations({ userId: user.id }));
    }, [])


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
            userChatList.unshift(userFind)
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
                    {
                        conversations.map(conv => {
                            return <UserChatLink key={conv.conversationId}
                                conversationId={conv.conversationId}
                                user={user}
                            />
                        })
                    }
                </div>
            </div>
            <div className="conversation-content">
                <Switch>
                    {
                        conversations.map(conver => {
                            return <UserChatList
                                key={conver.conversationId}
                                conversationId={conver.conversationId}
                                user={user}

                            />
                        })
                    }
                </Switch>
            </div>
        </>
    )
}
