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

export const getMeetingMessages = createAsyncThunk('meeting/getMessages', async ({ meetingId }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.get(`/api/meetings/${meetingId}/messages`)
    return {
      messages: response.data.messages,
    }
  } catch (error) {
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
    // meetings: {
    //   teams: [],
    //   conversations: []
    // },
    meeting: {
      id: null,
      members: [],
      messages: [],
      teamId: null,
      messagesLoaded: false
    },
    error: null
  },
  extraReducers: {
    [createTeamMeeting.pending]: (state, action) => {
      console.log('create meeting pending')
    },
    [createTeamMeeting.fulfilled]: (state, action) => {
      console.log(action.payload.meeting)
      state.meeting = action.payload.meeting
    },
    [createTeamMeeting.rejected]: (state, action) => {
      state.error = action.payload.error;
    },
    [getMeetingMessages.pending]: (state) => {
      // state.loading = true;
      state.meeting.messagesLoaded = false
    },
    [getMeetingMessages.fulfilled]: (state, action) => {
      // state.loading = false;
      // if (state.meeting.messages.length === 0) {
      //   state.meeting.messages.push(...action.payload.messages.sort((mess1, mess2) => mess1.id - mess2.id))
      // } else {
      state.meeting.messages.unshift(...action.payload.messages.sort((mess1, mess2) => mess1.id - mess2.id))
      // }
      state.meeting.messagesLoaded = true
    },
    [getMeetingMessages.rejected]: (state, action) => {
      console.log(action.payload.error)
      state.team.messagesLoaded = true
    },
  },
  reducers: {
    saveMessage: (state, action) => {
      const { message, userId, userName } = action.payload;
      state.messages.push({ message, userId, userName });
    },
    sendMeetingMessage: (state, action) => {
      let { messageId, content, senderId, meetingId, photo } = action.payload;
      if (state.meeting.id && state.meeting.id == meetingId) {
        state.meeting.messages.push({ id: messageId, content, userId: senderId, photo, meetingId })
      }
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
      console.log('on user out meeting', meetingId, userId)
      if (state.meeting.id === meetingId) {
        let idx = state.meeting.members.findIndex(m => m.userId === userId)
        if (idx >= 0) {
          state.meeting.members.splice(idx, 1)
        }
      }
    },
    getMeetingMembers: (state, action) => {
      let { members, meetingId, teamId } = action.payload
      state.meeting.members = members
      state.meeting.id = meetingId
      state.meeting.teamId = teamId
    }
  }
})

export const { saveMessage, userJoinMeeting, getMeetingMembers,
  userOutMeeting, sendMeetingMessage } = meetingSlice.actions;

export default meetingSlice.reducer
