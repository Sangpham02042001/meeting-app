import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import extend from 'lodash/extend'
import { baseURL } from '../../utils'

const initialState = {
  joinedTeam: [],
  team: {},
  joinedTeamLoaded: false,
  teamLoaded: false,
  error: null,
  loading: false,
}

export const getJoinedTeams = createAsyncThunk('teams/getJoinedTeams', async () => {
  let { token, id } = JSON.parse(window.localStorage.getItem('user'))
  let response = await axios.get(`${baseURL}/api/users/${id}/teams`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  let { teams } = response.data
  return { teams }
})

export const getTeamInfo = createAsyncThunk('teams/getTeamInfo', async ({ teamId }, { rejectWithValue }) => {
  let { token } = JSON.parse(window.localStorage.getItem('user'))
  let response = await axios.get(`${baseURL}/api/teams/${teamId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  let { team } = response.data
  response = await axios.get(`${baseURL}/api/teams/${teamId}/invited-users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  let { invitedUsers } = response.data
  team.invitedUsers = invitedUsers
  response = await axios.get(`${baseURL}/api/teams/${teamId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  let { members } = response.data
  team.members = members
  return { team }
})

export const teamSlice = createSlice({
  name: 'Team',
  initialState,
  reducers: {
    createNewTeam: (state, action) => {
      let { id, hostId, name } = action.payload
      state.joinedTeam.push({
        id, hostId, name
      })
    }
  },
  extraReducers: {
    [getJoinedTeams.pending]: (state) => {
      state.loading = true
    },
    [getJoinedTeams.fulfilled]: (state, action) => {
      state.joinedTeam = action.payload.teams
      state.loading = false
      state.joinedTeamLoaded = true
    },
    [getJoinedTeams.rejected]: (state, action) => {
      state.loading = false
      state.joinedTeamLoaded = false
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
    }
  }
})

export const { createNewTeam } = teamSlice.actions;

export default teamSlice.reducer
