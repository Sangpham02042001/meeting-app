import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './conversations.css';
import { axiosAuth } from '../../utils';
import { getConversations, createConversation } from '../../store/reducers/conversation.reducer';
import { Switch, Link, Route } from "react-router-dom";
import { useHistory } from 'react-router';
import Avatar from '../../components/Avatar';
import UserChat from '../../components/UserChat';
import { v1 as uuid } from 'uuid';

export default function Conversations() {
    const [textSearch, setTextSearch] = useState('');
    const [searchUsers, setSearchUsers] = useState([]);
    const [userFindList, setUserFindList] = useState([]);
    const tempConversationId = "temp-conversation-id"

    const user = useSelector(state => state.userReducer.user);
    const conversations = useSelector(state => state.conversationReducer.conversations);

    const dispatch = useDispatch();
    const history = useHistory();
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

        for (let userChat of userFindList) {
            if (userChat.id === userFind.id) {
                return;
            }
        }
        setUserFindList(userFindList => {
            userFindList.unshift(userFind)
            return userFindList;
        })

        const participant = conversations.find(conv => conv.participantId === userFind.id);
        if (!participant) {
            dispatch(createConversation({ conversationId: tempConversationId, participantId: userFind.id }));
        }
        history.push(`/conversations/${userFind.id}`);

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
                                    <Avatar width="40px" height="40px" userId={userFind.id} />
                                    <div style={{ marginLeft: "15px" }}>
                                        {userFind.userName}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }

                <div className="conversation-user">
                    {
                        conversations.map(conv => {
                            return <UserLink key={conv.participantId}
                                conversation={conv}
                                user={user}
                                tempId={tempConversationId}
                            />
                        })
                    }
                </div>
            </div>
            <div className="conversation-content">
                <Switch>
                    {
                        conversations.map(conver => {
                            return (
                                <Route path={`/conversations/${conver.participantId}`} key={conver.conversationId}>
                                    <UserChat
                                        conversation={conver}
                                        user={user}
                                    />
                                </Route>
                            )
                        })
                    }
                </Switch>
            </div>
        </>
    )
}

const UserLink = ({ conversation, user, tempId }) => {
    const [participantInfo, setParticipantInfo] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);


    useEffect(async () => {
        try {
            const participant = await axiosAuth.get(`/api/users/${conversation.participantId}`);
            setParticipantInfo(participant.data);
            if (conversation.conversationId !== tempId) {
                const response = await axiosAuth.get(`/api/conversations/${conversation.conversationId}/messages/lastMessage`);
                setLastMessage(response.data.lastMessage);
            }
        } catch (error) {
            console.log(error);
        }
    }, [])


    return (
        <>
            {participantInfo &&
                <Link to={`/conversations/${participantInfo.id}`} key={participantInfo.id} style={{ textDecoration: "none", color: "black", width: "100%", display: "flex", justifyContent: "center" }}>
                    <div className="user-chat">
                        <Avatar width="40px" height="40px" userId={participantInfo.id} />
                        <div style={{ marginLeft: "15px" }}>
                            {participantInfo.userName}
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "120px", opacity: "0.6" }}>
                                {lastMessage &&
                                    (lastMessage.userId === user.id ?
                                        <span>You: {lastMessage.content}</span>
                                        :
                                        <span>{lastMessage.content}</span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </Link>
            }
        </>
    )
}
