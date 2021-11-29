import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosAuth } from '../../utils';


export const getConversations = createAsyncThunk('conversations/getUserConversations', async () => {
  const response = await axiosAuth.get(`/api/conversations`);
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

export const readConversation = createAsyncThunk('conversations/readConversation', async ({ conversationId }, { dispatch }) => {
  const response = await axiosAuth.patch(`/api/conversations/${conversationId}`, { conversationId });
  dispatch(getNumberMessageUnread())
  return response.data;
})

export const getAllImages = createAsyncThunk('conversations/getAllImages', async ({ conversationId }) => {
  const response = await axiosAuth.get(`/api/conversations/${conversationId}/messages/images`);
  return response.data;
})

export const getAllFiles = createAsyncThunk('conversations/getAllFiles', async ({ conversationId }) => {
  const response = await axiosAuth.get(`/api/conversations/${conversationId}/messages/files`);
  return response.data;
})

export const getNumberMessageUnread = createAsyncThunk('conversations/getNumberMessageUnread', async () => {
  const response = await axiosAuth.get(`/api/conversations/messages`);
  return response.data;
})


export const conversationSlice = createSlice({
  name: 'Conversation',
  initialState: {
    conversations: [],
    conversation: {
      messages: [],
      images: [],
      files: [],
      participant: null,
    },
    conversationCall: {
      isRinging: false,
      isCalling: false,
      conversationId: null,
      senderId: null,
      senderName: null,
      receiverId: null,
    },
    numberMessagesUnread: 0,
    lastMessageChange: false,
  },
  extraReducers: {
    [getConversations.fulfilled]: (state, action) => {
      console.log('Get conversations successfully!')
      console.log(action.payload.conversations)
      state.conversations = action.payload.conversations;
    },
    [getConversations.rejected]: (state, action) => {
      console.log('Get conversations of user fail!')
    },
    [getMessages.fulfilled]: (state, action) => {
      console.log('Get messages successfully!')
      state.conversation.messages = action.payload.messages;
    },
    [getMessages.rejected]: (state, action) => {
      console.log('Get messages of user fail!')
    },
    [getParticipant.fulfilled]: (state, action) => {
      state.conversation.participant = action.payload;
    },
    [getParticipant.rejected]: (state, action) => {
      console.log('Get participant info error!!');
    },
    [readConversation.fulfilled]: (state, action) => {
      const { conversationId } = action.payload;
      let conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (conversation) {
        conversation.isRead = true;
      }
    },
    [readConversation.rejected]: (state, action) => {
      console.log('Read error!!');
    },
    [getAllImages.fulfilled]: (state, action) => {
      const { images } = action.payload;
      state.conversation.images = images;
    },
    [getAllImages.rejected]: (state, action) => {
      console.log('get images error')
    },
    [getAllFiles.fulfilled]: (state, action) => {
      const { files } = action.payload;
      state.conversation.files = files;
    },
    [getAllFiles.rejected]: (state, action) => {
      console.log('get files error')
    },
    [getNumberMessageUnread.fulfilled]: (state, action) => {
      const { numberMessages } = action.payload;
      state.numberMessagesUnread = numberMessages;
    },
    [getNumberMessageUnread.rejected]: (state, action) => {
      console.log('get number of messages error')
    },
  },
  reducers: {
    sendMessageCv: (state, action) => {
      const { messageId, content, senderId, receiverId,
        conversationId, files, photos, createdAt, senderName } = action.payload;
      let convParticipant = state.conversations.find(conv => {
        return (conv.participantId === receiverId || conv.participantId === senderId)
      });

      if (convParticipant) {
        console.log('replaceeeeee id', convParticipant)
        convParticipant.conversationId = conversationId;
      }

      let conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (!conversation && !convParticipant) {
        state.conversations.unshift({
          conversationId, participantId: senderId,
          participantName: senderName, isRead: false
        })
      }

      if (state.conversation.participant && (receiverId === state.conversation.participant.id || senderId === state.conversation.participant.id)) {
        state.conversation.messages.push({ id: messageId, content, userId: senderId, conversationId, files, photos, createdAt });

        if (files && files.length && files[0].type === 'file') {
          state.conversation.files.unshift(...files)
        }
        if (photos && photos.length) {
          state.conversation.images.unshift(...photos)
        }
      }

      const pIdx = state.conversations.findIndex(conv => conv.conversationId === conversationId);

      if (pIdx >= 0) {
        //check is read?
        conversation = state.conversations[pIdx];
        conversation.isRead = true;
        if (!state.conversation.participant || state.conversation.participant.id !== receiverId) {
          conversation.isRead = false;
        }


        state.conversations.splice(pIdx, 1);
        state.conversations.unshift(conversation);

        //check status
        if (conversation.participantId === senderId) {
          conversation.status = 'active';
        }
      }


      state.lastMessageChange = !state.lastMessageChange;
    },
    receiveMessageCv: (state, action) => {
      const { messageId, content, senderId, receiverId, conversationId, files, photos, createdAt } = action.payload;
      let conversation = state.conversations.find(conv => conv.conversationId === conversationId);
      if (!conversation) {
        state.conversations.unshift({ conversationId, participantId: senderId, isRead: false })
      }
      if (state.conversation.participant && senderId === state.conversation.participant.id) {
        state.conversation.messages.push({ id: messageId, content, userId: senderId, conversationId, files, photos, createdAt });
        //sang add
        if (files && files.length) {
          state.conversation.files.unshift(...files)
        }
        if (photos && photos.length) {
          state.conversation.images.unshift(...photos)
        }
      }
      state.lastMessageChange = !state.lastMessageChange;
    },
    createConversation: (state, action) => {
      const { conversationId, participantId, participantName } = action.payload;
      const pIdx = state.conversations.map(conv => conv.conversationId).indexOf(conversationId);
      if (pIdx >= 0) {
        state.conversations.splice(pIdx, 1);
      }
      state.conversations.unshift({ conversationId, participantId, participantName, isRead: true });
    },
    conversationCalling: (state, action) => {
      state.conversationCall = { ...state.conversationCall, ...action.payload, isRinging: true }
    },
    startCall: (state, action) => {
      state.conversationCall = { ...state.conversationCall, ...action.payload, isCalling: true }
    },
    cancelCall: (state, action) => {
      let { conversationId } = action.payload;
      if (conversationId === state.conversationCall.conversationId) {
        state.conversationCall.isRinging = false;
        state.conversationCall.isCalling = false;
      }
    },
    clearConversation: (state, action) => {
      state.conversation.messages = [];
      state.conversation.participant = null;
    },
    removeMessageCv: (state, action) => {
      let { conversationId, messageId } = action.payload;
      let idxMsg = state.conversation.messages.findIndex(m => m.id === messageId);
      if (idxMsg >= 0) {
        state.conversation.messages.splice(idxMsg, 1);
        //sang add
        state.conversation.files = state.conversation.files.filter(file => file.messageId != messageId)
        state.conversation.images = state.conversation.images.filter(img => img.messageId != messageId)
      }
    },
    setConversationStatus: (state, action) => {
      let { userId, status, time } = action.payload;
      let conversation = state.conversations.find(conver => conver.participantId === userId);
      if (conversation) {
        console.log(time)
        conversation.status = status;
        conversation.statusTime = time;
      }
    }
  }
})

export const { createConversation, sendMessageCv, receiveMessageCv,
  conversationCalling, clearConversation, cancelCall, startCall, removeMessageCv,
  setConversationStatus } = conversationSlice.actions;

export default conversationSlice.reducer
