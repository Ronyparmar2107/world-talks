'use client'
import api from "@/api/api";
// import axios from "axios";
// import { headers } from "next/headers";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    notification: "",
    notification_toggle: false,
    isLogin: false
}

export const createUser = createAsyncThunk(
    "user/createUser",
    async (data, { rejectWithValue }) => {
        try {
            // console.log(api.defaults.baseURL)
            const response = await api.post('user/createuser', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('user/auth', data)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const fetchuser = createAsyncThunk(
    'user/fetchUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('user/getuser', {}, {
                headers: {
                    "auth_token": data
                }
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)

        }
    }
)
const userSlice = createSlice({
    name: "userSlice",
    initialState,
    reducers: {
        notificationHandler: (state, action) => {
            state.notification = action.payload
            state.notification_toggle = !state.notification_toggle
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createUser.fulfilled || createUser.rejected, (state) => {
                state.isLoading = false
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                let data = action.payload
                console.log(data)
                if (data.auth_user) {
                    state.isLogin = true
                    state.token = data.token
                    localStorage.setItem("token", data.token)
                }
                else {
                    notificationHandler(data.error)
                }
                state.isLoading = false
            })
            .addCase(loginUser.rejected, (state) => {
                state.isLoading = false
                notificationHandler('Server not reachable.')
            })
            .addCase(fetchuser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchuser.fulfilled, (state, action) => {
                let data = action.payload
                if (data.fetch_user) {
                    state.user = data.user
                    if (!state.token) {
                        state.token = localStorage.getItem("token")
                        state.isLogin = true
                    }
                }
                else {
                    notificationHandler(data.error)
                }
                state.isLoading = false
            })
            .addCase(fetchuser.rejected, state => {
                state.isLoading = false
            })
    }
})

export const { notificationHandler } = userSlice.actions
export default userSlice.reducer