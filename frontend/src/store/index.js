import { configureStore } from '@reduxjs/toolkit';
import roomChatBoxReducer from './reducers/roomChatBox';
import userReducer from './reducers/user';

const store = configureStore({
  reducer: {

    roomChatBoxReducer,
    userReducer
  }
})

export default store