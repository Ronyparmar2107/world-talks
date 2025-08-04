'use client'
import api from "@/api/api";
import axios from "axios";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const initialState = {
    user: null,
    token: null,
    isLoading: false,
}

export const createUser = createAsyncThunk(
    "user/createUser",
    async (data, { rejectWithValue }) => {
        try {
            console.log(api.defaults.baseURL)
            const response = await api.post('user/createuser', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

const userSlice = createSlice({
    name: "userSlice",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(createUser.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createUser.fulfilled || createUser.rejected, (state) => {
                state.isLoading = false
            })
    }
})

// export const {extraReducers} = userSlice.actions
export default userSlice.reducer