import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import extend from 'lodash/extend'
import { axiosAuth, baseURL } from '../../utils'

const initialState = {
  joinedTeams: [],
  requestTeams: [],
  team: {},
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
  response = await axiosAuth.get(`/api/teams/${teamId}/invited-users`)
  let { invitedUsers } = response.data
  team.invitedUsers = invitedUsers
  response = await axiosAuth.get(`/api/teams/${teamId}/members`)
  let { members } = response.data
  team.members = members
  return { team }
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

export const teamSlice = createSlice({
  name: 'Team',
  initialState,
  reducers: {
    createNewTeam: (state, action) => {
      let { id, hostId, name } = action.payload
      state.joinedTeams.push({
        id, hostId, name
      })
    }
  },
  extraReducers: {
    [getJoinedTeams.pending]: (state) => {
      state.loading = true
    },
    [getJoinedTeams.fulfilled]: (state, action) => {
      state.joinedTeams = action.payload.teams
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
      state.requestTeams = action.payload.teams
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
      state.requestTeams.push(action.payload.team)
      state.loading = false
    },
    [requestJoinTeam.rejected]: (state, action) => {
      console.log(action.payload.error)
    }
  }
})

export const { createNewTeam } = teamSlice.actions;

export default teamSlice.reducer
