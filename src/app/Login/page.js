'use client'

import React from 'react'
import styles from './Login.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Login = () => {
    const router = useRouter()
    const LoginHandler = () => {
        router.push('/Home')
    }
    return (
        <div className={styles.login_page}>
            <div className={styles.login_main_container}>
                <h1>World-Talks</h1>
                <div className={styles.login_parameter}>
                    <label>Email Id</label>
                    <input type='email' />
                </div>
                <div className={styles.login_parameter}>
                    <label>Password</label>
                    <input type='password' />
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