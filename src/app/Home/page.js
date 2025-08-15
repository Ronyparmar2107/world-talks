'use client'
import React, { useEffect, useState } from 'react'
import styles from './Home.module.css'
import Image from 'next/image'
import friends_list from '../../dummy_data/friends_list'
import conversations from '@/dummy_data/conversations'
import api from "../../api/api"

import { useDispatch, useSelector } from 'react-redux'
import { fetchUser, logoutHandler, notificationHandler, sendRequest } from '@/Redux-Toolkit/Slices/userSlice'
import {
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Typography,
    Button,
    Menu,
    MenuItem,
    styled,
    List,
    ListItem,
    ListItemText,
    Box
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
// import { styled } from '@mui/material/styles';
// import TextField from '@mui/material/TextField';
// import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button'
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const Home = () => {
    let { token, user } = useSelector(state => state.user)
    const [open, setOpen] = useState(false)
    const [addFriendLoading, setAddFriendLoading] = useState(false)
    const [openProfileMenu, setOpenProfileMenu] = useState(false)
    const [openRequestBox, setOpenRequestBox] = useState(false)
    const [openChatId, setOpenChatId] = useState()
    const [conversation, setConversation] = useState()
    const [addFriend, setAddFriend] = useState()

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchUser(token))
    }, [dispatch])

    console.log(user)
    const openChat = (friend_id, conversation_id) => {
        setOpenChatId(friend_id)
        setConversation(conversations.find(ele => ele.id === conversation_id))
    }

    const addDateLable = (messages, index) => {

        let dateLable = < div className={styles.chat_date_container}>
            <div className={styles.chat_date}>
                {messages[index]?.date}
            </div>
        </div >

        if (index === 0) {
            return dateLable
        }
        else {
            let prev_element = messages[index - 1]
            if (prev_element.date === messages[index].date) return <></>
            else return dateLable
        }
    }

    // const makeDate = (date) => {
    //     const newDate = new Date(date)
    //     const dd = newDate.getDate().toString();
    //     const mm = String(newDate.getMonth() + 1).padStart(2, '0'); // January is 0
    //     const yyyy = newDate.getFullYear();
    //     console.log(dd, mm, yyyy)
    //     return `${dd}/${mm}/${yyyy}`
    // }
    // const today = new Date();
    // const tdd = String(today.getDate()).padStart(2, '0');
    // const tmm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    // const tyyyy = today.getFullYear();

    // const formattedDate = `${tdd}/${tmm}/${tyyyy}`;

    const addFriendHandler = async () => {
        setAddFriendLoading(true)
        try {
            console.log(token)
            let response = await api.post('user/sendrequest',
                { email: addFriend },
                {
                    headers: {
                        "auth_token": token
                    }
                })
            if (response.data.status) {
                // console.log(response)
                dispatch(notificationHandler(response.data.message))
            } else {

            }
        } catch (error) {
            console.log(error)
            dispatch(notificationHandler("Something went wrong."))
        }
        // dispatch(sendRequest(addFriend, token))
        setOpen(false)
        setAddFriendLoading(false)
    }

    const manageRequest = async (request_id, is_approved) => {

        // console.log("In Here")
        try {
            let response = await api.post("user/managerequest", {
                request_id, is_approved
            }, {
                headers: {
                    "auth_token": token
                }
            })
            console.log(response)
            if (response.data.status) {
                dispatch(notificationHandler(response.data.message))
            }
        } catch (error) {
            console.log(error)
            dispatch(notificationHandler("Something went wrong!!"))
        }
    }
    return (
        <div className={styles.home_main_container}>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent>
                    <DialogContentText>
                        Enter the email address of your friend.
                    </DialogContentText>
                    <form id="add-friend-form">
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="email"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="standard"
                            onChange={(e) => setAddFriend(e.target.value)}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button form="add-friend-form" onClick={addFriendHandler} disabled={addFriendLoading}>
                        {addFriendLoading ? "Sending Request" : "Add Friend"}
                    </Button>
                </DialogActions>
            </Dialog>
            <div className={styles.home_side_container}>
                <div className={styles.options_container}>
                    <Button className={styles.friends_number} onClick={() => setOpenRequestBox(true)}>
                        <div>{user?.requests?.filter(ele => ele.is_active === true)?.length}</div>
                        <p>Requests</p>
                    </Button>
                    <BootstrapDialog
                        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                        onClose={() => setOpenRequestBox(false)}
                        aria-labelledby="customized-dialog-title"
                        open={openRequestBox}
                    >
                        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                            Pending Requests
                        </DialogTitle>
                        <IconButton
                            aria-label="close"
                            onClick={() => setOpenRequestBox(false)}
                            sx={(theme) => ({
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: theme.palette.grey[500],
                            })}
                        >
                            <CloseIcon />
                        </IconButton>
                        <DialogContent dividers >
                            {user?.requests?.length === 0 || null ? "No requests" : <List>
                                {user?.requests?.map((request) => (
                                    request.is_active && <ListItem
                                        key={request.from._id}
                                        divider
                                        sx={{ display: "flex", justifyContent: "space-between" }}
                                    >
                                        {/* Friend Name */}
                                        <ListItemText primary={request.from.name} />

                                        {/* Action Buttons */}
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                sx={{ mr: 1 }}
                                                onClick={() => manageRequest(request._id, true)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => manageRequest(request._id, false)}
                                            >
                                                Reject
                                            </Button>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>}
                        </DialogContent>
                    </BootstrapDialog>
                    <Button className={styles.friend_request}>
                        <div>{user?.friends_list?.length}</div>
                        <p>Friends</p>
                    </Button>
                    <Button className={styles.account}
                        id="basic-button"
                        aria-controls={openProfileMenu ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openProfileMenu ? 'true' : undefined}
                        onClick={(event) => setOpenProfileMenu(event.currentTarget)}>

                        <div className={styles.profile_photo}>
                            <Image
                                src="/profile.png"
                                height={30}
                                width={30}
                                alt="Picture of the author"
                            />
                        </div>
                        <p>{user?.name}</p>
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={openProfileMenu}
                        open={openProfileMenu}
                        onClose={() => setOpenProfileMenu(null)}
                        slotProps={{
                            list: {
                                'aria-labelledby': 'basic-button',
                            },
                        }}
                    >
                        <MenuItem onClick={() => setOpenProfileMenu(null)}>Profile</MenuItem>
                        <MenuItem onClick={() => setOpenProfileMenu(null)}>My account</MenuItem>
                        <MenuItem onClick={() => {
                            setOpenProfileMenu(null)
                            dispatch(logoutHandler())
                        }}>Logout</MenuItem>
                    </Menu>
                </div>
                <div className={styles.chat_list_container}>
                    {
                        user?.friends_list?.length === 0 || null ?
                            <div style={{ display: "flex", alignItems: "center" }}> Add Friends <IconButton aria-label="delete" onClick={() => setOpen(true)}>
                                <AddIcon style={{ "color": 'white' }} />
                            </IconButton> </div>
                            :
                            user?.friends_list?.map((friend) => {
                                return (
                                    <div key={friend.id} className={styles.chat_item + " " + (openChatId === friend.id ? styles.current_chat_item : "")} onClick={() => openChat(friend.id, friend.conversationId)}>
                                        <Image
                                            src="/profile.png"
                                            height={10}
                                            width={10}
                                            alt="Picture of the author"
                                        />
                                        <div className={styles.chat_item_details_container}>
                                            <h6>{friend.name}</h6>
                                            <p>You have a new message.</p>
                                        </div>
                                    </div>
                                )
                            })
                    }
                </div>
            </div>
            < div className={styles.chat_main_container}>
                <div className={styles.chat_display_container}>
                    {
                        conversation?.messages?.map((ele, index) => {
                            return (
                                <div key={index}>

                                    {addDateLable(conversation?.messages, index)}
                                    {ele?.from !== userId ?
                                        <div className={styles.message_main_container + " " + styles.receiver_message}>
                                            <div className={styles.message_box}>
                                                <div className={styles.message}>{ele?.message}</div>
                                                <div className={styles.message_time}>{ele?.time}</div>
                                                <div className={styles.message_status}>Seen</div>
                                            </div>
                                        </div> :
                                        <div className={styles.message_main_container + " " + styles.sender_message}>
                                            <div className={styles.message_box}>
                                                <div className={styles.message}>{ele?.message}</div>
                                                <div className={styles.message_time}>{ele?.time}</div>
                                                <div className={styles.message_status}>Seen</div>
                                            </div>
                                        </div>}
                                </div>
                            )
                        })
                    }


                    {/* <div className={styles.chat_date_container}>
                        <div className={styles.chat_date}> 26/05/2025 </div>
                    </div>
                    <div className={styles.message_main_container + " " + styles.sender_message}>
                        <div className={styles.message_box}>
                            <div className={styles.message}>Hey, Good Morning!</div>
                            <div className={styles.message_time}>11:11</div>
                            <div className={styles.message_status}>Seen</div>
                        </div>
                    </div>

                    <div className={styles.message_main_container + " " + styles.receiver_message}>
                        <div className={styles.message_box}>
                            <div className={styles.message}>Good Morning To you too</div>
                            <div className={styles.message_time}>11:11</div>
                            <div className={styles.message_status}>Seen</div>
                        </div>
                    </div> */}





                </div>
                <div className={styles.chat_input_conatiner}>
                    <input type='text' placeholder='Write your message here...' />
                    <button className={styles.send_button}>Send</button>
                </div>
            </div>
        </div >
    )
}

export default Home