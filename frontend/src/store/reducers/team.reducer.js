import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import extend from 'lodash/extend'
import { axiosAuth, baseURL } from '../../utils'

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
  let response = await axiosAuth.get(`/api/users/${id}/teams`)
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
