import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import extend from 'lodash/extend'
import { v4 } from 'uuid'
import { axiosAuth, baseURL, socketClient, timeDiff } from '../../utils'

const initialState = {
  joinedTeams: [],
  requestingTeams: [],
  invitedTeams: [],
  meetingJoined: null,
  team: {
    members: [],
    invitedUsers: [],
    requestUsers: [],
    meetmessLoaded: false,
    meetingActive: null,
    meetmess: [],
    files: [],
    images: [],
    numOfMeetMess: 0,
    fakeMessageId: v4()
  },
  joinedTeamLoaded: false,
  requestTeamLoaded: false,
  invitedTeamLoaded: false,
  teamLoaded: false,
  error: null,
  loading: false,
}

export const getCurrentMeeting = createAsyncThunk('teams/getCurrentMeeting', async () => {
  let response = await axiosAuth.get(`/api/meetings/current-meeting`)
  return response.data
})

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

export const getInvitedTeams = createAsyncThunk('teams/getInvitedTeams', async () => {
  try {
    let { id } = JSON.parse(window.localStorage.getItem('user'))
    let response = await axiosAuth.get(`/api/users/${id}/invitations`)
    let { teams } = response.data
    return { teams }
  } catch (error) {
    console.log(error)
  }
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
  //get meetingActive 
  response = await axiosAuth.get(`/api/teams/${teamId}/meetingactive`)
  let { meetingActive } = response.data
  team.meetingActive = meetingActive
  //get shared files
  response = await axiosAuth.get(`/api/teams/${teamId}/files`)
  let { files } = response.data
  team.files = files
  //get shared images
  response = await axiosAuth.get(`/api/teams/${teamId}/images`)
  let { images } = response.data
  team.images = images
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

export const confirmInvitations = createAsyncThunk('teams/confirmInvitations', async ({ teams }, { getState, rejectWithValue }) => {
  try {
    let { teamReducer } = getState()
    let { id } = JSON.parse(window.localStorage.getItem('user'))
    console.log(teams, teamReducer.invitedTeams)
    let _teams = teamReducer.invitedTeams.filter(t => teams.indexOf(t.id) >= 0)
    let response = await axiosAuth.put(`/api/users/${id}/confirm-invitations`, {
      teams: teams
    })
    if (response.status == 200) {
      return { teams: _teams }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const cancelInviteUsers = createAsyncThunk('teams/cancelInvite', async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await axiosAuth.put(`${baseURL}/api/teams/${teamId}/users`, {
      users: [userId]
    })
    return { userId }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const refuseJoinRequests = createAsyncThunk('teams/refuseRequest', async ({ teamId, userId }, { rejectWithValue }) => {
  try {
    await axiosAuth.put(`${baseURL}/api/teams/${teamId}/remove-requests`, {
      users: [userId]
    })
    return { userId }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
    return error
  }
})

export const getTeamMeetMess = createAsyncThunk('teams/getMeetMess', async ({ teamId, offset, num }, { rejectWithValue }) => {
  try {
    let response = await axiosAuth.get(`/api/teams/${teamId}/meetmess?offset=${offset}&num=${num}`)
    return {
      meetmess: response.data.meetmess,
      numOfMeetMess: response.data.numOfMeetMess,
      offset
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
        hostId: team.hostId,
        meetmess: []
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

// export const outTeam = createAsyncThunk('teams/out', async ({ userId, teamId }, { rejectWithValue }) => {
//   try {
//     let response = await axiosAuth.delete(`/api/users/${userId}/teams/${teamId}`)
//     if (response.status == 200) {
//       return {
//         teamId
//       }
//     }
//   } catch (error) {
//     let { data } = error.response
//     if (data && data.error) {
//       return rejectWithValue(data)
//     }
//     return error
//   }
// })

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

export const outJoinedMeeting = createAsyncThunk('/outJoinedMeeting', async ({ }, { getState }) => {
  const { teamReducer } = getState()
  console.log(teamReducer)
  const { meetingActive } = teamReducer.team
  console.log(meetingActive)
  if (meetingActive) {
    let response = await axiosAuth.get(`/api/meetings/${meetingActive.id}`)
    return response.data
  }
})

export const teamSlice = createSlice({
  name: 'Team',
  initialState,
  reducers: {
    cleanTeamState: (state, action) => {
      state.team = {
        name: 'clean',
        members: [],
        invitedUsers: [],
        requestUsers: [],
        meetmess: [],
        meetmessLoaded: false,
      }
    },
    sendMessage: (state, action) => {
      let { messageId, content, senderId, teamId, photos, videos, isMessage, createdAt, files } = action.payload;
      if (state.team.id && state.team.id == teamId) {
        state.team.meetmess.push({ id: messageId, content, userId: senderId, teamId, photos, videos, isMessage, files, createdAt })
        if (files && files.length) {
          state.team.files.unshift(...files)
        }
        if (videos && videos.length) {
          state.team.files.unshift(...videos)
        }
        if (photos && photos.length) {
          state.team.images.unshift(...photos)
        }
        state.team.fakeMessageId = v4()
      }
    },
    updateMeetingState: (state, action) => {
      let { meetingId } = action.payload
      if (state.team.meetingActive && state.team.meetingActive.id == meetingId) {
        state.team.meetingActive = null
      }
    },
    setMeetingJoined: (state, action) => {
      let { teamId, id } = action.payload
      state.meetingJoined = {
        teamId,
        id
      }
    },
    setMeetingActive: (state, action) => {
      let { meeting } = action.payload
      if (meeting) {
        let { teamId } = meeting
        if (teamId == state.team.id) {
          state.team.meetingActive = meeting
        }
      }
    },
    endActiveMeeting: (state, action) => {
      let { meeting } = action.payload
      if (state.team.meetingActive && state.team.meetingActive.id == meeting.id) {
        state.team.meetingActive = null
        let idx = state.team.meetmess.filter(m => m.isMeeting).findIndex(m => m.id == meeting.id)
        if (idx >= 0) {
          state.team.meetmess.splice(idx, 1, {
            ...meeting,
            isMeeting: true
          })
        } else {
          state.team.meetmess.push({
            ...meeting,
            isMeeting: true
          })
        }
      }
      if ((state.meetingJoined || {}).id === meeting.id) {
        state.meetingJoined = null
      }
    },
    clearMeetingJoined: (state, action) => {
      let { meetingId } = action.payload
      if (meetingId === (state.meetingJoined || {}).id) {
        state.meetingJoined = null
      }
    },
    inviteUsers: (state, action) => {
      let { users, teamId } = action.payload
      if (users && users.length && state.team.id == teamId) {
        state.team.invitedUsers.push(...users)
      }
    },
    receiveTeamInvitation: (state, action) => {
      let { id, name, hostId } = action.payload
      if (id && name && hostId) {
        state.invitedTeams.push({ id, name, hostId, isMeeting: false })
      }
    },
    confirmRequest: (state, action) => {
      let { userId, teamId } = action.payload
      if (state.team.id == teamId) {
        let idx = state.team.requestUsers.findIndex(user => user.id == userId)
        if (idx >= 0) {
          state.team.members.push(state.team.requestUsers[idx])
          state.team.requestUsers.splice(idx, 1)
        }
      }
    },
    receiveTeamConfirm: (state, action) => {
      let { id, name, hostId } = action.payload
      if (id && name && hostId) {
        let idx = state.joinedTeams.findIndex(t => t.id == id)
        if (idx < 0) {
          state.joinedTeams.push({ id, name, hostId })
        }
        idx = state.requestingTeams.findIndex(t => t.id == id)
        if (idx >= 0) {
          state.requestingTeams.splice(idx, 1)
        }
      }
    },
    joinRequest: (state, action) => {
      let { team } = action.payload
      let idx = state.requestingTeams.findIndex(t => t.id === team.id)
      if (idx < 0) {
        state.requestingTeams.push(team)
      }
    },
    cancelJoin: (state, action) => {
      let { teamId } = action.payload
      let idx = state.requestingTeams.findIndex(t => t.id == teamId)
      if (idx >= 0) {
        state.requestingTeams.splice(idx, 1)
      }
    },
    receiveCancelJoin: (state, action) => {
      let { teamId, userId } = action.payload
      if (state.team && state.team.id == teamId) {
        let idx = state.team.requestUsers.findIndex(u => u.id == userId)
        if (idx >= 0) {
          state.team.requestUsers.splice(idx, 1)
        }
      }
    },
    outTeam: (state, action) => {
      let { teamId } = action.payload
      let idx = state.joinedTeams.findIndex(t => t.id == teamId)
      if (idx >= 0) {
        state.joinedTeams.splice(idx, 1)
      }
    },
    confirmInvitation: (state, action) => {
      let { id, name, hostId } = action.payload
      state.joinedTeams.push({ id, name, hostId })
      let idx = state.invitedTeams.findIndex(t => t.id == id)
      if (idx >= 0) {
        state.invitedTeams.splice(idx, 1)
      }
    },
    newMember: (state, action) => {
      let { teamId, userName, id } = action.payload
      if (state.team.id == teamId) {
        state.team.members.push({ id, userName })
        let idx = state.team.invitedUsers.findIndex(u => u.id == id)
        if (idx >= 0) {
          state.team.invitedUsers.splice(idx, 1)
        }
      }
    },
    receviceTeamRequest: (state, action) => {
      let { teamId, userName, userId } = action.payload
      if (state.team.id == teamId) {
        let idx = state.team.requestUsers.findIndex(u => u.id === userId)
        if (idx < 0) {
          state.team.requestUsers.push({
            id: userId,
            userName
          })
        }
      }
    },
    cancelInviteUser: (state, action) => {
      let { teamId, userId } = action.payload
      if (state.team.id == teamId) {
        let idx = state.team.invitedUsers.findIndex(u => u.id == userId)
        if (idx >= 0) {
          state.team.invitedUsers.splice(idx, 1)
        }
      }
    },
    receiveCancelInvite: (state, action) => {
      let { teamId } = action.payload
      let idx = state.invitedTeams.findIndex(t => t.id == teamId)
      if (idx >= 0) {
        state.invitedTeams.splice(idx, 1)
      }
    },
    removeTeamMessge: (state, action) => {
      let { teamId, messageId } = action.payload
      if (teamId, messageId) {
        if (state.team.id == teamId) {
          let idx = state.team.meetmess.findIndex(item => item.id == messageId && item.isMessage)
          state.team.meetmess.splice(idx, 1)
          state.team.files = state.team.files.filter(file => file.messageId != messageId)
          state.team.images = state.team.images.filter(img => img.messageId != messageId)
        }
      }
    },
    removeMember: (state, action) => {
      let { teamId, userId } = action.payload
      if (state.team.id == teamId) {
        let idx = state.team.members.findIndex(m => m.id == userId)
        if (idx >= 0) {
          state.team.members.splice(idx, 1)
        }
      }
    },
    forceOutTeam: (state, action) => {
      let { teamId } = action.payload
      let idx = state.joinedTeams.findIndex(t => t.id == teamId)
      if (idx >= 0) {
        state.joinedTeams.splice(idx, 1)
      }
      if (teamId == state.team.id) {
        state.team = {
          members: [],
          invitedUsers: [],
          requestUsers: [],
          meetmessLoaded: false,
          meetingActive: null,
          meetmess: [],
          files: [],
          images: [],
          numOfMeetMess: 0,
          fakeMessageId: v4()
        }
        state.teamLoaded = false
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
      state.joinedTeamLoaded = true
      state.error = action.error.message
    },
    [getRequestTeams.pending]: (state) => {
      state.loading = true
    },
    [getRequestTeams.fulfilled]: (state, action) => {
      state.requestingTeams = action.payload.teams
      state.loading = false
      state.requestTeamLoaded = true
    },
    [getRequestTeams.rejected]: (state, action) => {
      state.loading = false
      state.error = action.error.message
      state.requestTeamLoaded = true
    },
    [getInvitedTeams.pending]: (state) => {
      state.loading = true
    },
    [getInvitedTeams.fulfilled]: (state, action) => {
      state.invitedTeams = action.payload.teams
      state.invitedTeamLoaded = true
      state.loading = false
    },
    [getInvitedTeams.rejected]: (state, action) => {
      state.invitedTeamLoaded = true
      state.loading = false
    },
    [getTeamInfo.pending]: (state) => {
      state.loading = true
      state.teamLoaded = false
    },
    [getTeamInfo.fulfilled]: (state, action) => {
      let { team } = action.payload
      state.team = extend(state.team, team)
      state.loading = false
      state.teamLoaded = true
      // if (team.meetingActive && team.meetingActive.id) {
      //   let members = team.meetingActive.members
      //   let { id } = JSON.parse(window.localStorage.getItem('user'))
      //   if (id && members.length) {
      //     let inMeeting = members.find(m => m.id === id)
      //     if (inMeeting) {
      //       team.meetingJoined = {
      //         teamId: team.id,
      //         meetingId: meetingActive.id
      //       }
      //     }
      //   }
      // }
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
      state.invitedTeams = state.invitedTeams.filter(team => teams.indexOf(team.id) < 0)
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
      console.log(teams)
      // state.invitedTeams = state.invitedTeams.filter(team => teams.map(t => t.td).indexOf(team.id) < 0)
      state.invitedTeams = state.invitedTeams.filter(team => !teams.find(t => t.id == team.id))
      state.loading = false
      state.joinedTeams.push(...teams)
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
      let idx = state.joinedTeams.findIndex(t => t.id == state.team.id)
      if (idx >= 0) {
        state.joinedTeams.splice(idx, 1, {
          ...state.joinedTeams[idx],
          name: state.team.name
        })
      }
      state.loading = false
    },
    [updateBasicTeamInfo.rejected]: (state, action) => {
      state.error = action.payload.error
      state.loading = false
    },
    [cancelInviteUsers.fulfilled]: (state, action) => {
      let { userId } = action.payload
      state.team.invitedUsers = state.team.invitedUsers.filter(t => t.id != userId)
    },
    [cancelInviteUsers.rejected]: (state, action) => {
      state.error = action.payload.error
    },
    [refuseJoinRequests.fulfilled]: (state, action) => {
      let { userId } = action.payload
      state.team.requestUsers = state.team.requestUsers.filter(u => u.id != userId)
    },
    [refuseJoinRequests.rejected]: (state, action) => {
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
        meetmessLoaded: false,
        meetingActive: null,
        meetmess: [],
        files: [],
        images: [],
        numOfMeetMess: 0,
        fakeMessageId: v4()
      }
      let { teamId } = action.payload
      state.joinedTeams = state.joinedTeams.filter(team => team.id != teamId)
      state.loading = false
      state.teamLoaded = false
    },
    [deleteTeam.rejected]: (state, action) => {
      state.loading = false
      state.error = action.payload.error
    },
    [getTeamMeetMess.pending]: (state) => {
      state.team.meetmessLoaded = false
    },
    [getTeamMeetMess.fulfilled]: (state, action) => {
      if (!action.payload.offset) {
        state.team.meetmess = action.payload.meetmess
      } else {
        state.team.meetmess.unshift(...action.payload.meetmess)
      }
      if (action.payload.numOfMeetMess) {
        state.team.numOfMeetMess = action.payload.numOfMeetMess
      }
      state.team.meetmessLoaded = true
    },
    [getTeamMeetMess]: (state, action) => {
      state.team.meetmessLoaded = true
    },
    // [outTeam.pending]: (state) => {
    //   state.loading = true
    // },
    // [outTeam.fulfilled]: (state, action) => {
    //   let { teamId } = action.payload
    //   let idx = state.joinedTeams.map(team => team.id).indexOf(teamId)
    //   state.joinedTeams.splice(idx, 1)
    //   state.loading = false
    // },
    // [outTeam.rejected]: (state, action) => {
    //   state.loading = false
    //   state.error = action.payload.error
    // },
    [createNewTeam.pending]: (state) => {
      console.log('create team pending');
      state.error = null;
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
      state.loading = true
    },
    [createTeamMeeting.fulfilled]: (state, action) => {
      let { meeting } = action.payload
      state.team.meetingActive = meeting
      let hostName = state.team.members.find(m => m.id === meeting.hostId).userName
      socketClient.emit('new-meeting', {
        meeting: meeting,
        hostName,
        teamName: state.team.name
      })
      state.loading = false
    },
    [createTeamMeeting.rejected]: (state, action) => {
      state.error = action.payload.error;
      state.loading = false
    },
    [getCurrentMeeting.pending]: () => {
      console.log('get current meeting pending')
    },
    [getCurrentMeeting.fulfilled]: (state, action) => {
      let { meetingJoined } = action.payload
      if (meetingJoined) {
        let { id, teamId } = meetingJoined
        console.log(id, teamId)
        if (id && teamId) {
          state.meetingJoined = { id, teamId }
        }
      }
    },
    [getCurrentMeeting.rejected]: (state, action) => {
      state.error = (action.payload || {}).error
    },
    [outJoinedMeeting.pending]: () => {

    },
    [outJoinedMeeting.fulfilled]: (state, action) => {
      let { meeting } = action.payload
      console.log('after', meeting)
      if (meeting && meeting.active === false) {
        state.team.meetingActive = null
      }
      state.meetingJoined = null
    },
    [outJoinedMeeting.rejected]: (state, action) => {
      console.log(action.payload)
    },
  }
})

export const { cleanTeamState, sendMessage, updateMeetingState,
  setMeetingJoined, setMeetingActive, endActiveMeeting,
  clearMeetingJoined, inviteUsers, receiveTeamInvitation,
  confirmRequest, receiveTeamConfirm, joinRequest,
  receviceTeamRequest, removeTeamMessge, removeMember,
  forceOutTeam, cancelJoin, receiveCancelJoin,
  outTeam, confirmInvitation, newMember,
  cancelInviteUser, receiveCancelInvite } = teamSlice.actions;

export default teamSlice.reducer
