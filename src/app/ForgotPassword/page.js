'use client'
import React, { useState } from 'react'
import { Button } from '@mui/material'
import styles from '../Login/Login.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { notificationHandler } from '@/Redux-Toolkit/Slices/userSlice'
import api from '../../api/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [form, setForm] = useState({
        email: '',
        new_password: '',
        confirm_password: ''
    })
    const [errors, setErrors] = useState({})

    const dispatch = useDispatch()
    const router = useRouter()

    const validate = () => {
        let next_errors = {}
        if (!form.email.trim()) next_errors.email = "Email is required"
        else if (!EMAIL_REGEX.test(form.email.trim())) next_errors.email = "Enter a valid email address"

        if (!form.new_password) next_errors.new_password = "Password is required"
        else if (form.new_password.length < 6) next_errors.new_password = "At least 6 characters"

        if (!form.confirm_password) next_errors.confirm_password = "Required"
        else if (form.confirm_password !== form.new_password) next_errors.confirm_password = "Passwords don't match"

        setErrors(next_errors)
        return Object.keys(next_errors).length === 0
    }

    const submit_handler = async () => {
        if (!validate()) {
            dispatch(notificationHandler("Please fix the highlighted fields"))
            return
        }

        setIsLoading(true)
        try {
            let response = await api.post('user/resetpassword', {
                email: form.email,
                new_password: form.new_password
            })
            if (response.data.status) {
                dispatch(notificationHandler(response.data.message))
                router.push("/")
            } else {
                dispatch(notificationHandler(response.data.error))
            }
        } catch (error) {
            console.log(error)
            dispatch(notificationHandler("Something went wrong while connecting to server"))
        }
        setIsLoading(false)
    }

    return (
        <div className={styles.login_page}>
            <div className={styles.login_main_container}>
                <h1>World-Talks</h1>
                <p>Reset your password.</p>
                <div className={styles.login_parameter}>
                    <label>Email Id</label>
                    <input
                        type='email'
                        className={errors.email ? styles.input_error : ''}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <span className={styles.error_text}>{errors.email}</span>
                </div>
                <div className={styles.login_parameter}>
                    <label>New Password</label>
                    <input
                        type='password'
                        className={errors.new_password ? styles.input_error : ''}
                        value={form.new_password}
                        onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                    />
                    <span className={styles.error_text}>{errors.new_password}</span>
                </div>
                <div className={styles.login_parameter}>
                    <label>Confirm New Password</label>
                    <input
                        type='password'
                        className={errors.confirm_password ? styles.input_error : ''}
                        value={form.confirm_password}
                        onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    />
                    <span className={styles.error_text}>{errors.confirm_password}</span>
                </div>

                <Button
                    className={styles.login_button}
                    onClick={submit_handler}
                    loading={isLoading}
                    variant="contained"
                    disableElevation
                    sx={{
                        background: '#1a2b6b',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        '&:hover': { background: '#132056' }
                    }}
                >Reset Password</Button>

                <div className={styles.signup_container}>
                    <p>Remembered it? <Link href='/'>Back to Login</Link></p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
