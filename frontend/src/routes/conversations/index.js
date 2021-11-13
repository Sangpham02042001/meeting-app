import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './conversations.css';
import { axiosAuth } from '../../utils';
import { getConversations, createConversation, clearConversation } from '../../store/reducers/conversation.reducer';
import { Switch, Route } from "react-router-dom";
import { useHistory, useParams } from 'react-router';
import Avatar from '../../components/Avatar';
import ConversationChat from './ConversationChat';
import ConversationLink from './ConversationLink';


export default function Conversations(props) {
    const [textSearch, setTextSearch] = useState('');
    const [searchUsers, setSearchUsers] = useState([]);
    const [userSearch, setUserSearch] = useState(null);
    const user = useSelector(state => state.userReducer.user);
    const conversations = useSelector(state => state.conversationReducer.conversations);
    const dispatch = useDispatch();
    const history = useHistory();
    useEffect(() => {
        dispatch(getConversations({ userId: user.id }));

        return () => {
            dispatch(clearConversation())
        }
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

        history.replace(`/conversations/${userFind.id}`);
    }

    return (
        <div className="conversation-page">
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
                            />
                        })
                    }
                </div>
            </div>
            <div className="conversation-content">
                {props.params === '/conversations' ?
                    <div className="conversation-welcome">
                        HELLO WORLD
                    </div>
                    :
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
                }

            </div>
        </div>
    )
}


