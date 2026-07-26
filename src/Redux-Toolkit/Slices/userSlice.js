'use client'
import api from "@/api/api";
import { init_socket } from "@/utils/socket";
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

export const fetchUser = createAsyncThunk(
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

// export const sendRequest = createAsyncThunk(
//     "user/sendRequest",
//     async (data, { rejectWithValue }) => {
//         try {
//             const response = await api.post('user/sendrequest',
//                 { email: data.email },
//                 {
//                     headers: {
//                         "auth_token": data.token
//                     }
//                 }
//             )
//             return response.data
//         } catch (error) {
//             return rejectWithValue(error.response?.data || error.message)
//         }
//     }
// )
const userSlice = createSlice({
    name: "userSlice",
    initialState,
    reducers: {
        notificationHandler: (state, action) => {
            console.log("State", state)
            state.notification = action.payload
            state.notification_toggle = !state.notification_toggle
        },
        logoutHandler: (state, action) => {
            state.isLogin = false
            state.token = null
            state.user = null
            localStorage.clear()
            state.notification = "Logout Successfully"
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
                if (data.status) {
                    // console.log("Are you coming here?")
                    state.isLogin = true
                    state.token = data.token
                    localStorage.setItem("token", data.token)
                    init_socket(data.token)
                }
                else {
                    // console.log("In exception Handler")
                    state.notification = data.error
                    state.notification_toggle = !state.notification_toggle
                }
                state.isLoading = false
            })
            .addCase(loginUser.rejected, (state) => {
                state.isLoading = false
                state.notification = 'Server not reachable.'
                state.notification_toggle = !state.notification_toggle
                // notificationHandler('Server not reachable.')
            })
            .addCase(fetchUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                let data = action.payload
                if (data.status) {
                    state.user = data.user
                    if (!state.token) {
                        state.token = localStorage.getItem("token")
                        state.isLogin = true
                    }
                }
                else {
                    state.notification = data.error
                    state.notification_toggle = !state.notification_toggle
                }
                state.isLoading = false
            })
            .addCase(fetchUser.rejected, state => {
                state.isLoading = false
            })
        // .addCase(sendRequest.rejected, state => state.isLoading = false)
        // .addCase(sendRequest.fulfilled, (state, action) => {
        //     let data = action.payload
        //     if (data.status) {
        //         notificationHandler(data.message)
        //     }
        //     state.isLoading = false
        // })
        // .addCase(sendRequest.pending, state => state.isLoading = true)
    }
})

export const { notificationHandler, logoutHandler } = userSlice.actions
export default userSlice.reducer