import { configureStore } from '@reduxjs/toolkit';
import roomChatBoxReducer from './reducers/roomChatBox';


const store = configureStore({
  reducer: {

    roomChatBoxReducer,

  }
})

export default store