import { createSlice } from '@reduxjs/toolkit'




export const meetingSlice = createSlice({
  name: 'Meeting',
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

export const {saveMessage} = meetingSlice.actions;

export default meetingSlice.reducer
