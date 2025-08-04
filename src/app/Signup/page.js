'use client'
import React from 'react'
import { Button } from '@mui/material'
import { useState } from 'react'
import styles from '../Login/Login.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { createUser } from '@/Redux-Toolkit/Slices/userSlice'

const Signup = () => {
    const [signupForm, setSignupForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        confirm_email: '',
        password: '',
        confirm_password: ''
    })

    const dispatch = useDispatch()

    const { isLoading } = useSelector(state => state.user)
    // const isLoading = true
    const submit_handler = () => {

        if (Object.values(signupForm).every(v => v != '')) {
            if (signupForm.confirm_email === signupForm.email) {
                if (signupForm.password === signupForm.confirm_password) {
                    let data = {
                        name: signupForm.first_name + " " + signupForm.last_name,
                        email: signupForm.email,
                        password: signupForm.password
                    }
                    dispatch(createUser(data))
                }
                else alert("Match both the password fields")
            }
            else alert("Match both the email fields")
        }
        else alert("Please Fill all the details in form")

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


                <Button className={styles.login_button} onClick={submit_handler} loading={isLoading} variant="contained"
                    style={{
                        margin: '1rem 0',
                        background: 'blue',
                        borderRadius: '10px',
                        // color: 'white',
                        border: 'none',
                        fontSize: '12px',
                        padding: '8px 20px',
                        cursor: 'pointer'
                    }}>Submit</Button>


            </div>
        </div >
    )
}

export default Signup