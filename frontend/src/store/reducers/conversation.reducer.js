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
  return response.data;
})

export const readConversation = createAsyncThunk('conversations/readConversation', async ({ conversationId }) => {
  const response = await axiosAuth.patch(`/api/conversations/${conversationId}`, {conversationId});
  return response.data;
})


export const conversationSlice = createSlice({
  name: 'Conversation',
  initialState: {
    messages: [],
    conversations: [],
    participant: null,
    lastMessageChange: false,

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
    },
    [readConversation.fulfilled]: (state, action) => {
      const {conversationId} = action.payload;
      let conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (conversation) {
        conversation.isRead = true;
      }
    },
    [readConversation.rejected]: (state, action) => {
      console.log('Read error!!');
    },
  },
  reducers: {
    sendMessageCv: (state,action) => {
      const { messageId, content, senderId, receiverId, conversationId, photo, createdAt } = action.payload;
      let conversation = state.conversations.find(conv => conv.participantId === receiverId);
      if (conversation) {
        conversation.conversationId = conversationId;
      }
      conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (!conversation) {
        state.conversations.unshift({conversationId, participantId: senderId, isRead: false})
      }

      if (state.participant && (receiverId === state.participant.id || senderId === state.participant.id)) {
        state.messages.push({ id: messageId, content, userId: senderId, conversationId, photo, createdAt });
      }

      const pIdx = state.conversations.map(conv => conv.conversationId).indexOf(conversationId);
      if (pIdx >= 0) {
        conversation = state.conversations[pIdx];
        conversation.isRead = true;
        if (!state.participant || state.participant.id !== receiverId) {
          conversation.isRead = false;
        }
        state.conversations.splice(pIdx, 1);
        state.conversations.unshift(conversation);
      }

      state.lastMessageChange = !state.lastMessageChange;
    },
    receiveMessageCv: (state, action) => {
      const { messageId, content, senderId, receiverId, conversationId, photo, createdAt } = action.payload;
      const conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (!conversation) {
        state.conversations.unshift({conversationId, participantId: senderId, isRead: false})
      }
      if (state.participant && senderId === state.participant.id ) {
        state.messages.push({ id: messageId, content, userId: senderId, conversationId, photo, createdAt });
      }
      state.lastMessageChange = !state.lastMessageChange;
    },
    createConversation: (state, action) => {
      const { conversationId, participantId } = action.payload;
      const pIdx = state.conversations.map(conv => conv.conversationId).indexOf(conversationId);
      if (pIdx >= 0) {
        state.conversations.splice(pIdx, 1);
      }
      state.conversations.unshift({ conversationId, participantId, isRead: true });
    },
  }
})

export const { createConversation, sendMessageCv, receiveMessageCv } = conversationSlice.actions;

export default conversationSlice.reducer
