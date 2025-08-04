'use client'
import { configureStore } from "@reduxjs/toolkit"
import userReducer from './Slices/userSlice'

export const Store = configureStore({
    reducer: {
        user: userReducer
    }
})