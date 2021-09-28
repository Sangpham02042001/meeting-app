import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import extend from 'lodash/extend'
import { baseURL } from '../../utils'

const initialState = {
  joinedTeam: [],
  joinedTeamLoaded: false,
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

export const teamSlice = createSlice({
  name: 'Team',
  initialState,
  reducers: {
    createNewTeam: (state, action) => {
      let { team } = action.payload
      state.joinedTeam.push(team)
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
    }
  }
})

export const { createNewTeam } = teamSlice.actions;

export default teamSlice.reducer
