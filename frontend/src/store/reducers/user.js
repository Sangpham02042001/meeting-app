import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: {},
  error: null,
  loading: false,
  authenticated: false,
  loaded: false
}

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
  }
})

export const { isAuthenticated } = userSlice.actions;

export default userSlice.reducer
