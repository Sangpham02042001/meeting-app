import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '../../utils';


export const conversationSlice = createSlice({
  name: 'Conversation',
  initialState: {
    messages: [],
    conversations: []
  },
  extraReducers: {
    
  },
  reducers: {
    sendMessage: (state, action) => {
      const {content, userId, userName, conversationId} = action.payload;
      state.messages.push({content, userId, userName, conversationId});
    }
  }
})

export const {sendMessage} = conversationSlice.actions;

export default conversationSlice.reducer
