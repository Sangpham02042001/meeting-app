import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './conversations.css';
import { axiosAuth } from '../../utils';
import { getConversations, createConversation } from '../../store/reducers/conversation.reducer';
import { Switch, Link, Route } from "react-router-dom";
import { useHistory, useParams } from 'react-router';
import Avatar from '../../components/Avatar';
import ConversationChat from '../../components/ConversationChat';
import { v4 } from 'uuid';


export default function Conversations() {
    const [textSearch, setTextSearch] = useState('');
    const [searchUsers, setSearchUsers] = useState([]);
    const [userSearch, setUserSearch] = useState(null);
    // const tmpConverId = v4();
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

    const handleChooseUser = (userFind) => {
        setSearchUsers([]);
        setTextSearch('');

        if (userSearch && userFind.id === userSearch.id) {
            return;
        }

        setUserSearch(userFind)

        const participant = conversations.find(conv => conv.participantId === userFind.id);
        if (!participant) {
            dispatch(createConversation({ conversationId: null, participantId: userFind.id }));
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
                            return <ConversationLink key={conv.participantId}
                                conversation={conv}
                                user={user}
                                // tmpConverId={tmpConverId}
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
                                <Route path={`/conversations/${conver.participantId}`} key={conver.participantId}>
                                    <ConversationChat
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

const ConversationLink = ({ conversation, user, tmpConverId }) => {
    const [participant, setParticipant] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
    const lastMessageChange = useSelector(state => state.conversationReducer.lastMessageChange);
    const curParticipant = useSelector(state => state.conversationReducer.participant);

    useEffect(async () => {
        try {
            const response = await axiosAuth.get(`/api/users/${conversation.participantId}`);
            setParticipant(response.data);
            if (conversation.conversationId ) {
                const response = await axiosAuth.get(`/api/conversations/${conversation.conversationId}/messages/lastMessage`);
                setLastMessage(response.data.lastMessage);
                
            }
        } catch (error) {
            console.log(error);
        }
    }, [lastMessageChange])


    return (
        <>
            {participant &&
                <Link to={`/conversations/${participant.id}`}
                    key={participant.id}
                    style={{ textDecoration: "none", color: "black", width: "100%", display: "flex", justifyContent: "center" }}>
                    <div className="user-chat" style={{backgroundColor: curParticipant && participant.id === curParticipant.id ? '#fff': ''}}>
                        <Avatar width="40px" height="40px" userId={participant.id} />
                        <div style={{ marginLeft: "15px" }}>
                            {participant.userName}
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "120px", opacity: conversation.isRead ? "0.6" : "1" }}>
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
