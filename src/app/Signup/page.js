'use client'
import React from 'react'
import { Button } from '@mui/material'
import { useState } from 'react'
import styles from '../Login/Login.module.css'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { createUser, notificationHandler } from '@/Redux-Toolkit/Slices/userSlice'
import { useRouter } from 'next/navigation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Signup = () => {
    const { isLoading } = useSelector(state => state.user)
    const [signupForm, setSignupForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        confirm_email: '',
        password: '',
        confirm_password: ''
    })
    const [errors, setErrors] = useState({})

    const dispatch = useDispatch()
    const router = useRouter()

    const validate = () => {
        let next_errors = {}
        if (!signupForm.first_name.trim()) next_errors.first_name = "Required"
        if (!signupForm.last_name.trim()) next_errors.last_name = "Required"

        if (!signupForm.email.trim()) next_errors.email = "Email is required"
        else if (!EMAIL_REGEX.test(signupForm.email.trim())) next_errors.email = "Enter a valid email address"

        if (!signupForm.confirm_email.trim()) next_errors.confirm_email = "Required"
        else if (signupForm.confirm_email !== signupForm.email) next_errors.confirm_email = "Emails don't match"

        if (!signupForm.password) next_errors.password = "Password is required"
        else if (signupForm.password.length < 6) next_errors.password = "At least 6 characters"

        if (!signupForm.confirm_password) next_errors.confirm_password = "Required"
        else if (signupForm.confirm_password !== signupForm.password) next_errors.confirm_password = "Passwords don't match"

        setErrors(next_errors)
        return Object.keys(next_errors).length === 0
    }

    const submit_handler = async () => {
        if (!validate()) {
            dispatch(notificationHandler("Please fix the highlighted fields"))
            return
        }

        let data = {
            name: signupForm.first_name + " " + signupForm.last_name,
            email: signupForm.email,
            password: signupForm.password
        }
        let result = await dispatch(createUser(data))

        if (result.meta.requestStatus === "fulfilled") {
            dispatch(notificationHandler("Account Created. Now Login & Start Chatting."))
            router.push("/")
        }
    }

    const field = (key, label, type = 'text') => (
        <div className={styles.login_parameter}>
            <label>{label}</label>
            <input
                type={type}
                className={errors[key] ? styles.input_error : ''}
                value={signupForm[key]}
                onChange={(e) => setSignupForm({ ...signupForm, [key]: e.target.value })}
            />
            <span className={styles.error_text}>{errors[key]}</span>
        </div>
    )

    return (
        <div className={styles.login_page}>
            <div className={styles.login_main_container}>
                <h1>World-Talks</h1>
                <p>Let&apos;s make your account.</p>
                {field('first_name', 'First Name')}
                {field('last_name', 'Last Name')}
                {field('email', 'Email Id', 'email')}
                {field('confirm_email', 'Confirm Email Id', 'email')}
                {field('password', 'Password', 'password')}
                {field('confirm_password', 'Confirm Password', 'password')}

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
                >Submit</Button>

                <div className={styles.signup_container}>
                    <p>Already have an account? <Link href='/'>Login</Link></p>
                </div>
            </div>
        </div >
    )
}

export default Signup
