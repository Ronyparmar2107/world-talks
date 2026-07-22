'use client'

import React, { useState } from 'react'
import styles from './Login.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { loginUser, notificationHandler } from '@/Redux-Toolkit/Slices/userSlice'

const Login = () => {
    const [creds, setCreds] = useState({
        email: '',
        password: ''
    })
    const dispatch = useDispatch()
    const router = useRouter()
    const LoginHandler = () => {
        if (creds.email !== '' && creds.password !== '') {
            // console.log("Came here")
            dispatch(loginUser(creds))
        }
        else dispatch(notificationHandler('Please fill all the details'))
    }
    return (
        <div className={styles.login_page}>
            <div className={styles.login_main_container}>
                <h1>World-Talks</h1>
                <div className={styles.login_parameter}>
                    <label>Email Id</label>
                    <input type='email' value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} />
                </div>
                <div className={styles.login_parameter}>
                    <label>Password</label>
                    <input type='password' value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
                </div>
                <button className={styles.login_button} onClick={LoginHandler}>Login</button>
                <div className={styles.signup_container}>
                    <p>Are you new here? <Link href='/Signup'>Sign-Up</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Login