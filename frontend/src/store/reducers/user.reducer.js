import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { axiosInstance } from '../../utils'
import extend from 'lodash/extend'

const initialState = {
  user: {},
  error: null,
  loading: false,
  authenticated: false,
  loaded: false
}

export const signin = createAsyncThunk('user/signin', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/api/signin', {
      email, password
    });
    if (response.status === 200) {
      console.log(response.data)
      return {
        user: response.data
      }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
  }
})


export const userSlice = createSlice({
  name: 'User',
  initialState,
  extraReducers: {

  },
  reducers: {
    isAuthenticated: state => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        state.user = user
        state.loading = false
        state.authenticated = true
      }
      state.loaded = true
    }
  },
  extraReducers: {
    [signin.pending]: (state, action) => {
      state.loading = true
    },
    [signin.fulfilled]: (state, action) => {
      let user = action.payload.user
      state.loading = false
      state.authenticated = true
      window.localStorage.setItem('user', JSON.stringify(user))
      user.token = undefined
      state.user = extend(state.user, user)
    },
    [signin.rejected]: (state, action) => {
      state.error = action.payload.error
      state.loading = false
    },
  }
})

export const { isAuthenticated } = userSlice.actions;

export default userSlice.reducer
