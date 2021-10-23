import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { baseURL, axiosAuth } from '../../utils';

export const createTeamMeeting = createAsyncThunk('/createTeamMeeting', async ({ teamId }, { rejectWithValue }) => {
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
    meetings: {
      teams: [],
      conversations: []
    },
    users: [],
    error: null
  },
  extraReducers: {
    [createTeamMeeting.pending]: (state, action) => {
      console.log('create meeting pending')
    },
    [createTeamMeeting.fulfilled]: (state, action) => {
      state.meetings.teams.push(action.payload.meeting)
    },
    [createTeamMeeting.rejected]: (state, action) => {
      state.error = action.payload.error;
    }
  },
  reducers: {
    saveMessage: (state, action) => {
      const { message, userId, userName } = action.payload;
      state.messages.push({ message, userId, userName });
    },
    userJoinMeeting: (state, action) => {
      let {teamId, meetingId, userJoinId} = action.payload;
      let user = state.users.find(user => user.userId === userJoinId);
      if (!user) {
        state.users.push({id: userJoinId});
      }
      
    }
  }
})

export const { saveMessage, userJoinMeeting } = meetingSlice.actions;

export default meetingSlice.reducer
