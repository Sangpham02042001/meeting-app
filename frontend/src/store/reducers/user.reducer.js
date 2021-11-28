import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { axiosAuth, axiosInstance } from '../../utils'
import extend from 'lodash/extend';
import { socketClient } from '../../utils';

const initialState = {
  user: {},
  error: null,
  loading: false,
  authenticated: false,
  loaded: false,
  status: 'active',
}

export const signin = createAsyncThunk('user/signin', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/api/signin', {
      email, password
    });
    if (response.status === 200) {
      return {
        user: {
          ...response.data,
          email
        }
      }
    }
  } catch (error) {
    let { data } = error.response
    if (data && data.error) {
      return rejectWithValue(data)
    }
  }
})

export const updateBasicUserInfo = createAsyncThunk('user/updateBasicUserInfo', async ({ form, userId }, { rejectWithValue }) => {
  try {
    const response = await axiosAuth.put(`/api/users/${userId}`, form);
    if (response.status === 200) {
      return {
        updatedUser: response.data.user,

      }
    }
  } catch (error) {
    console.log(error)
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
      const user = localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))
      if (user) {
        state.user = user
        state.user.userName = user.firstName.concat(user.lastName);
        state.loading = false
        state.authenticated = true
      }
      state.loaded = true
    },
    setMyStatus: (state, action) => {
      const { userId, status } = action.payload;
      if (userId === state.user.id) state.status = status;
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
      if (action.payload.error) {
        state.error = action.payload.error
      }
      state.loading = false
    },
    [updateBasicUserInfo.pending]: () => {
      console.log('update user info pending')
    },
    [updateBasicUserInfo.fulfilled]: (state, action) => {
      let { updatedUser } = action.payload
      state.user = {
        ...state.user,
        ...updatedUser
      }
      let user = JSON.parse(localStorage.getItem('user'))
      user = {
        ...user,
        ...updatedUser
      }
      localStorage.setItem('user', JSON.stringify(user))
    },
    [updateBasicUserInfo.rejected]: (state, action) => {
      console.log(action.payload.error)
    }
  }
})

export const { isAuthenticated, setMyStatus } = userSlice.actions;

export default userSlice.reducer
