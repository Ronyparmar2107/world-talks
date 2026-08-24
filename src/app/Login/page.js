'use client'

import React, { useState } from 'react'
import { Button } from '@mui/material'
import styles from './Login.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, notificationHandler } from '@/Redux-Toolkit/Slices/userSlice'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
    const { isLoading } = useSelector(state => state.user)
    const [creds, setCreds] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const dispatch = useDispatch()
    const router = useRouter()

    const validate = () => {
        let next_errors = {}
        if (!creds.email.trim()) next_errors.email = "Email is required"
        else if (!EMAIL_REGEX.test(creds.email.trim())) next_errors.email = "Enter a valid email address"

        if (!creds.password) next_errors.password = "Password is required"

        setErrors(next_errors)
        return Object.keys(next_errors).length === 0
    }

    const LoginHandler = () => {
        if (validate()) {
            dispatch(loginUser(creds))
        } else {
            dispatch(notificationHandler('Please fix the highlighted fields'))
        }
    }

    return (
        <div className={styles.login_page}>
            <div className={styles.login_main_container}>
                <h1>World-Talks</h1>
                <p>Welcome back. Log in to keep chatting.</p>
                <div className={styles.login_parameter}>
                    <label>Email Id</label>
                    <input
                        type='email'
                        className={errors.email ? styles.input_error : ''}
                        value={creds.email}
                        onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') LoginHandler() }}
                    />
                    <span className={styles.error_text}>{errors.email}</span>
                </div>
                <div className={styles.login_parameter}>
                    <label>Password</label>
                    <input
                        type='password'
                        className={errors.password ? styles.input_error : ''}
                        value={creds.password}
                        onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') LoginHandler() }}
                    />
                    <span className={styles.error_text}>{errors.password}</span>
                </div>
                <Button
                    className={styles.login_button}
                    onClick={LoginHandler}
                    loading={isLoading}
                    variant="contained"
                    disableElevation
                    sx={{
                        background: '#1a2b6b',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        '&:hover': { background: '#132056' }
                    }}
                >Login</Button>
                <div className={styles.signup_container}>
                    <p>Are you new here? <Link href='/Signup'>Sign-Up</Link></p>
                    <p><Link href='/ForgotPassword'>Forgot Password?</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Login
