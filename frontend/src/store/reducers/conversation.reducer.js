import { createSlice } from '@reduxjs/toolkit'


export const conversationSlice = createSlice({
  name: 'Conversation',
  initialState: {
    messages: []
  },
  extraReducers: {
    
  },
  reducers: {
    saveMessage: (state, action) => {
      const {content, userId, userName} = action.payload;
      state.messages.push({content, userId, userName});
    }
  }
})

export const {saveMessage} = conversationSlice.actions;

export default conversationSlice.reducer
