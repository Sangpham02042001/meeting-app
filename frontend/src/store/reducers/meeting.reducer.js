import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { baseURL, axiosAuth } from '../../utils';

export const createMeeting = createAsyncThunk('/meeing/create', async ({ teamId }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.post(`${baseURL}/api/meetings`, {
      teamId
    })
    if (response.status) {
      let { meeting } = response.data
      return { meeting }
    }
  } catch (error) {
    console.log(error)
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const meetingSlice = createSlice({
  name: 'Meeting',
  initialState: {
    messages: [],
    meeting: {},
    error: null
  },
  extraReducers: {
    [createMeeting.pending]: (state, action) => {
      console.log('create meeting pending')
    },
    [createMeeting.fulfilled]: (state, action) => {
      state.meeting = action.payload.meeting
    },
    [createMeeting.rejected]: (state, action) => {
      state.error = action.payload.error
    }
  },
  reducers: {
    saveMessage: (state, action) => {
      const { message, userId, userName } = action.payload;
      state.messages.push({ message, userId, userName });
    }
  }
})

export const { saveMessage } = meetingSlice.actions;

export default meetingSlice.reducer
