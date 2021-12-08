import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  darkMode: localStorage.getItem('DARK_MODE') === 'true',
  muted: localStorage.getItem('MUTED') == 'true'
}

export const settingSlice = createSlice({
  name: 'Setting',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      if (state.darkMode) {
        state.darkMode = false
        localStorage.setItem('DARK_MODE', false)
      } else {
        state.darkMode = true
        localStorage.setItem('DARK_MODE', true)
      }
    },
    toggleMute: (state) => {
      if (state.muted) {
        state.muted = false
        localStorage.setItem('MUTED', false)
      } else {
        state.muted = true
        localStorage.setItem('MUTED', true)
      }
    }
  }
})

export const { toggleDarkMode, toggleMute } = settingSlice.actions;
export default settingSlice.reducer