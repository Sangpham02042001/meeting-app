import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance, axiosAuth } from '../../utils';


export const getConversations = createAsyncThunk('conversations/getUserConversations', async ({ userId }) => {
  const response = await axiosAuth.get(`/api/conversations/users/${userId}`);

  return response.data;
})


export const getMessages = createAsyncThunk('conversations/getMessages', async ({ conversationId }) => {
  const response = await axiosAuth.get(`/api/conversations/${conversationId}/messages`);

  return response.data;
})

export const getParticipant = createAsyncThunk('conversations/getParticipant', async ({ participantId }) => {
  const response = await axiosAuth.get(`/api/users/${participantId}`);
  return response.data
})



export const conversationSlice = createSlice({
  name: 'Conversation',
  initialState: {
    messages: [],
    conversations: [],
    participant: null

  },
  extraReducers: {
    [getConversations.fulfilled]: (state, action) => {
      console.log('Get conversations successfully!')
      state.conversations = action.payload.conversations;
    },
    [getConversations.rejected]: (state, action) => {
      console.log('Get conversations of user fail!')
    },
    [getMessages.fulfilled]: (state, action) => {
      console.log('Get messages successfully!')
      state.messages = action.payload.messages;
    },
    [getMessages.rejected]: (state, action) => {
      console.log('Get messages of user fail!')
    },
    [getParticipant.fulfilled]: (state, action) => {
      state.participant = action.payload;
    },
    [getParticipant.rejected]: (state, action) => {
      console.log('Get participant info error!!');
    }
  },
  reducers: {
    setMessage: (state, action) => {
      const { messageId, content, senderId, userId, conversationId, photo } = action.payload;
      if (state.participant && senderId === state.participant.id || senderId === userId) {
        state.messages.push({ id: messageId, content, userId, conversationId, photo });
      }
    },
    createConversation: (state, action) => {
      const { conversationId, participantId } = action.payload;
      const pIdx = state.conversations.map(conv => conv.conversationId).indexOf(conversationId);
      if (pIdx >= 0) {
        console.log('tmptmptmp')
        state.conversations.splice(pIdx, 1);
      }
      console.log('create conversationid')
      state.conversations.unshift({ conversationId, participantId });
    },
    setConversation: (state, action) => {
      const { nConversationId, oConversationId } = action.payload;
      const conversation = state.conversations.find(conv => conv.conversationId === oConversationId);
      if (conversation) {
        conversation.conversationId = nConversationId;
      }
    }
  }
})

export const { setMessage, createConversation, setConversation } = conversationSlice.actions;

export default conversationSlice.reducer
