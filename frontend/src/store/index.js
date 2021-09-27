import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './reducers/meeting.reducer';
import userReducer from './reducers/user.reducer';
import conversationReducer from './reducers/conversation.reducer';

const store = configureStore({
  reducer: {
    meetingReducer,
    userReducer,
    conversationReducer
  }
})

export default store