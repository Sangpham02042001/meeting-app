import { createSlice } from '@reduxjs/toolkit'





export const roomChatBoxSlice = createSlice({
  name: 'RoomChatBox',
  initialState: {
    messages: []
  },
  extraReducers: {
    
  },
  reducers: {
    saveMessage: (state, action) => {
      const {message, userId, userName} = action.payload;
      state.messages.push({message, userId, userName});
    }
  }
})

export const {saveMessage} = roomChatBoxSlice.actions;

export default roomChatBoxSlice.reducer
