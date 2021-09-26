import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './reducers/meeting.reducer';
import userReducer from './reducers/user.reducer';

const store = configureStore({
  reducer: {
    meetingReducer,
    userReducer
  }
})

export default store