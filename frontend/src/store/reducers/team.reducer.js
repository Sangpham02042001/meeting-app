import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import extend from 'lodash/extend'
import { axiosAuth } from '../../utils'

const initialState = {
  joinedTeams: [],
  requestingTeams: [],
  invitedTeams: [],
  team: {
    members: [],
    invitedUsers: [],
    requestUsers: [],
    messages: [],
    messagesLoaded: false,
    meetings: [],
    meetingActive: null
  },
  joinedTeamLoaded: false,
  teamLoaded: false,
  error: null,
  loading: false,
}

export const getJoinedTeams = createAsyncThunk('teams/getJoinedTeams', async () => {
  let { id } = JSON.parse(window.localStorage.getItem('user'))
  let response = await axiosAuth.get(`/api/users/${id}/teams`)
  let { teams } = response.data
  return { teams }
})

export const getRequestTeams = createAsyncThunk('teams/getRequestTeams', async () => {
  let { id } = JSON.parse(window.localStorage.getItem('user'))
  let response = await axiosAuth.get(`/api/users/${id}/requesting-teams`)
  let { teams } = response.data
  return { teams }
})

export const getTeamInfo = createAsyncThunk('teams/getTeamInfo', async ({ teamId }, { rejectWithValue }) => {
  let response = await axiosAuth.get(`/api/teams/${teamId}`)
  let { team } = response.data
  //get invited users
  response = await axiosAuth.get(`/api/teams/${teamId}/invited-users`)
  let { invitedUsers } = response.data
  team.invitedUsers = invitedUsers
  //get members
  response = await axiosAuth.get(`/api/teams/${teamId}/members`)
  let { members } = response.data
  team.members = members
  //get request users
  response = await axiosAuth.get(`/api/teams/${teamId}/requestusers`)
  let { requestUsers } = response.data
  team.requestUsers = requestUsers
  //get meetings
  response = await axiosAuth.get(`/api/teams/${teamId}/meetings`)
  let { meetings } = response.data
  team.meetings = meetings
  team.meetingActive = meetings.filter(meeting => meeting.active)[0] || null
  return { team }
})

export const updateBasicTeamInfo = createAsyncThunk('teams/updateInfo', async ({ data, teamId }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.put(`/api/teams/${teamId}`, data)
    return response.data
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const requestJoinTeam = createAsyncThunk('teams/requestJoin', async ({ team }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.post(`/api/users/teams/${team.id}`)
    if (response.status == 200) {
      return { team }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const refuseInvitations = createAsyncThunk('teams/refuseInvitations', async ({ teams }, { rejectWithValue }) => {
  try {
    let { id } = JSON.parse(window.localStorage.getItem('user'))
    let response = await axiosAuth.put(`/api/users/${id}/remove-invitations`, {
      teams
    })
    if (response.status == 200) {
      return { teams }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const confirmInvitations = createAsyncThunk('teams/confirmInvitations', async ({ teams }, { rejectWithValue }) => {
  try {
    let { id } = JSON.parse(window.localStorage.getItem('user'))
    let _teams = teams.map(team => team.id)
    let response = await axiosAuth.post(`/api/users/${id}/confirm-invitations`, {
      teams: _teams
    })
    if (response.status == 200) {
      return { teams }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const inviteUsers = createAsyncThunk('teams/inviteUsers', async ({ teamId, users }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.post(`/api/teams/${teamId}/users`, {
      users: users.map(user => user.id)
    })
    if (response.status == 200) {
      return { users }
    } else {
      throw 'Something wrong'
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const getTeamMessages = createAsyncThunk('teams/getMessages', async ({ teamId, offset, num }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.get(`/api/teams/${teamId}/messages?offset=${offset}&num=${num}`)
    return {
      messages: response.data.messages,
      numOfMessages: response.data.numOfMessages
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const deleteTeam = createAsyncThunk('teams/delete', async ({ teamId }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.delete(`/api/teams/${teamId}`)
    if (response.status == 200) {
      return {
        message: response.data.message,
        teamId
      }
    } else {
      throw `Something wrong`
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const createNewTeam = createAsyncThunk('teams/create', async ({ formData }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.post('/api/teams', formData);
    if (response.status == 201) {
      let { team } = response.data
      return {
        id: team.id,
        name: team.name,
        hostId: team.hostId
      }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const outTeam = createAsyncThunk('teams/out', async ({ userId, teamId }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.delete(`/api/users/${userId}/teams/${teamId}`)
    if (response.status == 200) {
      return {
        teamId
      }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const createTeamMeeting = createAsyncThunk('/createTeamMeeting', async ({ teamId }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.post(`/api/meetings`, {
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

export const teamSlice = createSlice({
  name: 'Team',
  initialState,
  reducers: {
    cleanTeamState: (state, action) => {
      state.team = {
        members: [],
        invitedUsers: [],
        requestUsers: [],
        messages: [],
        messagesLoaded: false,
        meetings: []
      }
    },
    sendMessage: (state, action) => {
      let { messageId, content, senderId, teamId, photo } = action.payload;
      if (state.team.id && state.team.id == teamId) {
        state.team.messages.push({ id: messageId, content, userId: senderId, teamId, photo })
      }
    },
    updateMeetingState: (state, action) => {
      let { meetingId } = action.payload
      if (state.team.meetingActive && state.team.meetingActive.id == meetingId) {
        state.team.meetingActive = null
      }
    }
  },
  extraReducers: {
    [getJoinedTeams.pending]: (state) => {
      state.loading = true
    },
    [getJoinedTeams.fulfilled]: (state, action) => {
      state.joinedTeams = action.payload.teams.map(team => ({
        ...team,
        isMeeting: false
      }))
      state.loading = false
      state.joinedTeamLoaded = true
    },
    [getJoinedTeams.rejected]: (state, action) => {
      state.loading = false
      state.joinedTeamLoaded = false
      state.error = action.error.message
    },
    [getRequestTeams.pending]: (state) => {
      state.loading = true
    },
    [getRequestTeams.fulfilled]: (state, action) => {
      state.requestingTeams = action.payload.teams
      state.loading = false
    },
    [getRequestTeams.rejected]: (state, action) => {
      state.loading = false
      state.error = action.error.message
    },
    [getTeamInfo.pending]: (state) => {
      state.loading = true
    },
    [getTeamInfo.fulfilled]: (state, action) => {
      state.team = extend(state.team, action.payload.team)
      state.loading = false
      state.teamLoaded = true
    },
    [getTeamInfo.rejected]: (state, action) => {
      // state.error = action.payload.error
      state.loading = false
      state.teamLoaded = true
    },
    [requestJoinTeam.pending]: (state) => {
      state.loading = true
    },
    [requestJoinTeam.fulfilled]: (state, action) => {
      state.requestingTeams.push(action.payload.team)
      state.loading = false
    },
    [requestJoinTeam.rejected]: (state, action) => {
      console.log(action.payload.error)
      state.loading = false
    },
    [refuseInvitations.pending]: state => {
      state.loading = true
    },
    [refuseInvitations.fulfilled]: (state, action) => {
      let { teams } = action.payload
      state.invitedTeams = state.invitedTeams.filter(team => teams.indexOf(team.id) >= 0)
      state.loading = false
    },
    [refuseInvitations.rejected]: (state, action) => {
      state.loading = false
      console.log(action.payload.error)
    },
    [confirmInvitations.pending]: state => {
      state.loading = true
    },
    [confirmInvitations.fulfilled]: (state, action) => {
      let { teams } = action.payload
      state.invitedTeams = state.invitedTeams.filter(team => teams.indexOf(team.id) >= 0)
      state.loading = false
      state.joinedTeams.concat(teams)
    },
    [confirmInvitations.rejected]: (state, action) => {
      state.loading = false
      console.log(action.payload.error)
    },
    [updateBasicTeamInfo.pending]: (state) => {
      state.loading = true
    },
    [updateBasicTeamInfo.fulfilled]: (state, action) => {
      state.team = extend(state.team, action.payload.team)
      state.loading = false
    },
    [updateBasicTeamInfo.rejected]: (state, action) => {
      state.error = action.payload.error
      state.loading = false
    },
    [inviteUsers.pending]: state => {
      state.loading = true
    },
    [inviteUsers.fulfilled]: (state, action) => {
      state.team.invitedUsers.concat(action.payload.users)
      state.loading = false
    },
    [inviteUsers.rejected]: (state, action) => {
      state.loading = false
      state.error = action.payload.error
    },
    [deleteTeam.pending]: (state) => {
      state.loading = false
    },
    [deleteTeam.fulfilled]: (state, action) => {
      state.team = {
        members: [],
        invitedUsers: [],
        requestUsers: [],
        meetings: []
      }
      let { teamId } = action.payload
      state.joinedTeams = state.joinedTeams.filter(team => team.id != teamId)
      state.loading = false
    },
    [deleteTeam.rejected]: (state, action) => {
      state.loading = false
      state.error = action.payload.error
    },
    [getTeamMessages.pending]: (state) => {
      // state.loading = true;
      state.team.messagesLoaded = false
    },
    [getTeamMessages.fulfilled]: (state, action) => {
      // state.loading = false;
      if (state.team.messages.length === 0) {
        state.team.messages.push(...action.payload.messages.sort((team1, team2) => team1.id - team2.id))
      } else {
        state.team.messages.unshift(...action.payload.messages.sort((team1, team2) => team1.id - team2.id))
      }
      if (action.payload.numOfMessages) {
        state.team.numOfMessages = action.payload.numOfMessages
      }
      state.team.messagesLoaded = true
    },
    [getTeamMessages.rejected]: (state, action) => {
      console.log(action.payload.error)
      state.team.messagesLoaded = true
    },
    [outTeam.pending]: (state) => {
      state.loading = true
    },
    [outTeam.fulfilled]: (state, action) => {
      let { teamId } = action.payload
      let idx = state.joinedTeams.map(team => team.id).indexOf(teamId)
      state.joinedTeams.splice(idx, 1)
      state.loading = false
    },
    [outTeam.rejected]: (state, action) => {
      state.loading = false
      state.error = action.payload.error
    },
    [createNewTeam.pending]: (state) => {
      console.log('create team pending');
    },
    [createNewTeam.fulfilled]: (state, action) => {
      let { id, hostId, name } = action.payload
      state.joinedTeams.push({
        id, hostId, name
      })
    },
    [createNewTeam.rejected]: (state, action) => {
      state.error = action.payload.error
    },
    [createTeamMeeting.pending]: (state, action) => {
      console.log('create meeting pending')
    },
    [createTeamMeeting.fulfilled]: (state, action) => {
      console.log(action.payload.meeting)
      state.team.meetingActive = action.payload.meeting
      state.team.meetings.push(action.payload.meeting)
    },
    [createTeamMeeting.rejected]: (state, action) => {
      state.error = action.payload.error;
    }
  }
})

export const { cleanTeamState, sendMessage, updateMeetingState } = teamSlice.actions;

export default teamSlice.reducer
