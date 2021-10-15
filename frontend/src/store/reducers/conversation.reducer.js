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
    participant: null,
    messageChange: false,

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
    sendMessageCv: (state,action) => {
      const { messageId, content, senderId, receiverId, conversationId, photo, createdAt } = action.payload;
      const conversation = state.conversations.find(conv => conv.participantId === receiverId);
      conversation.conversationId = conversationId;
      if (state.participant && receiverId === state.participant.id ) {
        state.messages.push({ id: messageId, content, userId: senderId, conversationId, photo, createdAt });
      }
      state.messageChange = !state.messageChange;
    },
    receiveMessage: (state, action) => {
      const { messageId, content, senderId, receiverId, conversationId, photo, createdAt } = action.payload;
      const conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (!conversation) {
        state.conversations.unshift({conversationId, participantId: senderId})
      }
      if (state.participant && senderId === state.participant.id ) {
        state.messages.push({ id: messageId, content, userId: senderId, conversationId, photo, createdAt });
      }
      state.messageChange = !state.messageChange;
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
  }
})

export const { createConversation, sendMessageCv, receiveMessage } = conversationSlice.actions;

export default conversationSlice.reducer
