'use client'
import React from 'react'
import { useState } from 'react'
import styles from '../Login/Login.module.css'

const Signup = () => {
    const [signupForm, setSignupForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        confirm_email: '',
        password: '',
        confirm_password: ''
    })


    const submit_handler = () => {
        if (signupForm.confirm_email === signupForm.email) {
            if (signupForm.password === signupForm.confirm_password) console.log("Account Created")
            else alert("Match both the password fields")
        }
        else alert("Match both the email fields")

    }

    return (
        <div className={styles.login_page}>
            <div className={styles.login_main_container}>
                <h1>World-Talks</h1>
                <p>Let's make your account.</p>
                <div className={styles.login_parameter}>
                    <label>First Name</label>
                    <input value={signupForm.first_name} onChange={(e) => { setSignupForm({ ...signupForm, first_name: e.target.value }) }} type='text' />
                </div>
                <div className={styles.login_parameter}>
                    <label>Last Name</label>
                    <input value={signupForm.last_name} onChange={(e) => { setSignupForm({ ...signupForm, last_name: e.target.value }) }} type='text' />
                </div>
                <div className={styles.login_parameter}>
                    <label>Email Id</label>
                    <input value={signupForm.email} onChange={(e) => { setSignupForm({ ...signupForm, email: e.target.value }) }} type='email' />
                </div>
                <div className={styles.login_parameter}>
                    <label>Confirm Email Id</label>
                    <input value={signupForm.confirm_email} onChange={(e) => { setSignupForm({ ...signupForm, confirm_email: e.target.value }) }} type='email' />
                </div>
                <div className={styles.login_parameter}>
                    <label>Password</label>
                    <input value={signupForm.password} onChange={(e) => { setSignupForm({ ...signupForm, password: e.target.value }) }} type='password' />
                </div>
                <div className={styles.login_parameter}>
                    <label>Confirm Password</label>
                    <input value={signupForm.confirm_password} onChange={(e) => { setSignupForm({ ...signupForm, confirm_password: e.target.value }) }} type='password' />
                </div>
                <button className={styles.login_button} onClick={submit_handler}>Sign Up</button>
            </div>
        </div>
    )
}

export default Signup