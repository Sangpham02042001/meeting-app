import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseURL } from '../../utils'
import axios from "axios";
import { axiosAuth } from "../../utils";

const initialState = {
    notifications: [],
    numOf_UnReadNotifications: null,
    error: null,
    hasMore: true,
    loading: false,
    loaded: true
}

export const getNotifs = createAsyncThunk('notification/getNotifs', async (offset, { rejectWithValue }) => {
    let { token, id } = JSON.parse(window.localStorage.getItem('user'))
    let response = await axiosAuth.get(`${baseURL}/api/users/${id}/notifications?offset=${offset}&num=3`)
    let { notifications, numOf_UnReadNotifications } = response.data
    return { notifications, numOf_UnReadNotifications }
})

export const readNotif = createAsyncThunk('notification/readNotif', async (notifId, { rejectWithValue }) => {
    let { token } = JSON.parse(window.localStorage.getItem('user'))
    let response = await axiosAuth.put(`${baseURL}/api/notifications/${notifId}`)
    return response.data
})

export const notificationSlice = createSlice({
    name: 'Notification',
    initialState,
    extraReducers: {
        [getNotifs.pending]: (state, action) => {
            state.loading = true
            state.loaded = false
            state.hasMore = true
        },
        [getNotifs.fulfilled]: (state, action) => {
            let notifications = action.payload.notifications
            state.loading = false
            state.loaded = true
            state.hasMore = true
            state.notifications = state.notifications.concat(notifications)
            state.numOf_UnReadNotifications = action.payload.numOf_UnReadNotifications
            // window.localStorage.setItem('notifications', JSON.stringify(notifications))
        },
        [getNotifs.rejected]: (state, action) => {
            state.error = action.error.message
            state.loading = false
            state.hasMore = false
            console.log(state.error) // 
        },
        [readNotif.pending]: (state, action) => {
        },
        [readNotif.fulfilled]: (state, action) => {
        },
        [readNotif.rejected]: (state, action) => {
            state.error = action.error.message
            console.log(state.error)
        }
    },
    reducers: {
        // cleanNotificationState: state => {
        //     state.notifications = []
        //     state.numOf_UnReadNotifications = 0
        // }
    }
})

// export const { cleanNotificationState } = notificationSlice.actions;
export default notificationSlice.reducer