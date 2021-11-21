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
    let { notifications, numOf_UnReadNotifications, numOfNotifications } = response.data
    return { notifications, numOf_UnReadNotifications, numOfNotifications }
})

export const readNotif = createAsyncThunk('notification/readNotif', async (notifId, { rejectWithValue }) => {
    await axiosAuth.put(`${baseURL}/api/notifications/${notifId}`)
    return { notifId }
})

export const deleteNoti = createAsyncThunk('notifications/delete', async ({ notiId }, { rejectWithValue }) => {
    await axiosAuth.delete(`/api/notifications/${notiId}`)
    return { notiId }
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
            state.numOfNotifications = action.payload.numOfNotifications
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
            let { notifId } = action.payload
            let idx = state.notifications.findIndex(noti => noti.id === notifId)
            if (idx >= 0) {
                state.notifications.splice(idx, 1, {
                    ...state.notifications[idx],
                    isRead: 1
                })
                if (state.numOf_UnReadNotifications) {
                    state.numOf_UnReadNotifications = state.numOf_UnReadNotifications - 1;
                }
            }
        },
        [readNotif.rejected]: (state, action) => {
            state.error = action.error.message
            console.log(state.error)
        },
        [deleteNoti.pending]: () => {

        },
        [deleteNoti.fulfilled]: (state, action) => {
            let { notiId } = action.payload
            if (notiId) {
                let idx = state.notifications.findIndex(noti => noti.id === notiId)
                if (idx >= 0) {
                    state.notifications.splice(idx, 1)
                }
            }
        },
        [deleteNoti.rejected]: (state, action) => {
            console.log(action.payload)
        }
    },
    reducers: {
        hideNoti: (state, action) => {
            let { notiId } = action.payload
            if (notiId) {
                let idx = state.notifications.findIndex(noti => noti.id === notiId)
                if (idx >= 0) {
                    state.notifications.splice(idx, 1)
                }
            }
        },
        receivceNotification: (state, action) => {
            let { noti } = action.payload
            let idx = state.notifications.findIndex(n => n.id == noti.id)
            if (idx < 0) {
                state.notifications.unshift(noti)
                state.numOf_UnReadNotifications += 1
                state.numOfNotifications += 1
            } else {
                state.notifications.splice(idx, 1, noti)
                state.numOf_UnReadNotifications += 1
            }
        }
    }
})

export const { hideNoti, receivceNotification } = notificationSlice.actions;
export default notificationSlice.reducer