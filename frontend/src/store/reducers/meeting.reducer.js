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
    meetings: {
      teams: [],
      conversations: []
    },
    meeting: {
      id: 0,
      members: [],
      messages: [],
    },
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
      let { teamId, meetingId, user } = action.payload;
      let _user = state.meeting.members.find(u => u.userId === user.userId);
      if (!_user) {
        state.meeting.members.push(user);
      }
    },
    userOutMeeting: (state, action) => {
      let { meetingId, userId } = action.payload;
      if (state.meeting.id === meetingId) {
        let idx = state.meeting.members.findIndex(m => m.userId === userId)
        if (idx >= 0) {
          state.meeting.members.splice(idx, 1)
        }
      }
    },
    getMeetingMembers: (state, action) => {
      let { members, meetingId } = action.payload
      state.meeting.members = members
      state.meeting.id = meetingId
    }
  }
})

export const { saveMessage, userJoinMeeting, getMeetingMembers, userOutMeeting } = meetingSlice.actions;

export default meetingSlice.reducer
