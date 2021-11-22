import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  darkMode: localStorage.getItem('DARK_MODE') === 'true'
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
    }
  }
})

export const { toggleDarkMode } = settingSlice.actions;
export default settingSlice.reducer