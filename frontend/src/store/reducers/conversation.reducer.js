import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance, axiosAuth } from '../../utils';


export const getConversations = createAsyncThunk('conversations/getUserConversations', async ({userId}) => {
  const response = await axiosAuth.get(`/api/conversations/users/${userId}`);
  console.log('gelloasdasda');

  return response.data;
})


export const getMessagesConversation = createAsyncThunk('conversations/getMessagesConversation', async ({conversationId}) => {
  const response = await axiosAuth.get(`/api/conversations/${conversationId}/messages`);

  return response.data;
})





export const conversationSlice = createSlice({
  name: 'Conversation',
  initialState: {
    messages: [],
    conversations: [],
    participantList: []
  },
  extraReducers: {
    [getConversations.fulfilled]: (state, action) => {
      console.log('Get conversations successfully!')
      state.conversations = action.payload.conversations;
    },
    [getConversations.rejected]: (state, action) => {
      console.log('Get conversations of user fail!')
    },
    [getMessagesConversation.fulfilled]: (state, action) => {
      console.log('Get messages successfully!')
      state.messages = action.payload.messages;
    },
    [getMessagesConversation.rejected]: (state, action) => {
      console.log('Get messages of user fail!')
    }
  },
  reducers: {
    saveMessage: (state, action) => {
      const {id, content, userId, conversationId} = action.payload;
      state.messages.push({id, content, userId, conversationId});
    }
  }
})

export const {saveMessage} = conversationSlice.actions;

export default conversationSlice.reducer
