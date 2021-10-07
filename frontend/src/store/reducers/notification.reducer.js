import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseURL } from '../../utils'
import axios from "axios";

const initialState = {
    notifications: [],
    error: null,
    loading: false,
    loaded: false
}

export const getNotifs = createAsyncThunk('user/getNotifs', async (offset, {rejectWithValue}) => {
    let { token, id } = JSON.parse(window.localStorage.getItem('user'))
    let response = await axios.get(`${baseURL}/api/users/${id}/notifications?offset=${offset}&num=10`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    let { notifications } = response.data
    return { notifications }
})

export const notificationSlice = createSlice({
    name: 'Notification',
    initialState,
    extraReducers: {
        [getNotifs.pending]: (state, action) => {
            state.loading = true
        },
        [getNotifs.fulfilled]: (state, action) => {
            let notifications = action.payload.notifications
            state.loading = false
            state.notifications = state.notifications.concat(notifications)
            // window.localStorage.setItem('notifications', JSON.stringify(notifications))
        },
        [getNotifs.rejected]: (state,action) => {
            state.error = action.error.message
            state.loading = false
            console.log(state.error) // 
        }
    }
})

export default notificationSlice.reducer