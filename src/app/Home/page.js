'use client'
import React, { useEffect, useRef, useState } from 'react'
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
import { get_socket, disconnect_socket } from '@/utils/socket'
import { Socket } from 'socket.io-client'

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
    let socket = useRef(null)
    let chat_div = useRef(null)

    const [open, setOpen] = useState(false)

    const [addFriendLoading, setAddFriendLoading] = useState(false)

    const [openProfileMenu, setOpenProfileMenu] = useState(false)
    const [openRequestBox, setOpenRequestBox] = useState(false)

    // const [openConversationId, setOpenConversationId] = useState()
    const [conversation, setConversation] = useState({ _id: null, messages: [] })

    // Tracks whichever conversation is actually on screen right now. Read inside the
    // socket listener instead of `conversation` directly, since that listener is only
    // ever attached once (see effect below) and would otherwise close over a stale value.
    const openConversationId = useRef(null)

    const [addFriend, setAddFriend] = useState()

    const [messageInput, setMessageInput] = useState('')

    const dispatch = useDispatch()

    useEffect(() => {
        openConversationId.current = conversation?._id ?? null
    }, [conversation?._id])

    useEffect(() => {
        ScrollerHandler()
    }, [conversation.messages])

    useEffect(() => {
        if (!socket.current) {
            socket.current = get_socket()
        }

        const handleReceiveMessage = ({ conversation_id, message }) => {
            // Only append the message if its conversation is the one currently open.
            // Otherwise it belongs to a chat the user hasn't opened - ignore it here.
            console.log("Here", conversation_id, openConversationId.current);

            if (conversation_id === openConversationId.current) {
                updateConversation(message)
            }
        }
        socket.current.on("receive_message", handleReceiveMessage)
        socket.current.on("message_status_update", handleReceiveMessage)
        socket.current.on("message_seen", handleReceiveMessage)

        dispatch(fetchUser(token))

        return () => {
            socket.current.off("receive_message", handleReceiveMessage)
            socket.current.off("message_status_update", handleReceiveMessage)
        }
    }, [dispatch])

    // console.log(user)

    // Still Need to work on it
    const addDateLable = (messages, index) => {
        let current_date = new Date(messages[index]?.created_date)
        let current_day = current_date.getDate()
        let current_month = current_date.getMonth()
        let current_year = current_date.getFullYear()

        let dateLable = <div className={styles.chat_date_container}>
            <div className={styles.chat_date}>
                {`${current_day} / ${current_month + 1} / ${current_year}`}
            </div>
        </div>

        if (index === 0) {
            return dateLable
        }
        else {
            let previous_date = new Date(messages[index - 1]?.created_date)
            let previous_day = previous_date.getDate()
            let previous_month = previous_date.getMonth()
            let previous_year = previous_date.getFullYear()
            if (previous_day === current_day && previous_month === current_month && previous_year === current_year) return <></>
            else return dateLable
        }
    }

    // Adding a friend
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

    //Managing Friend Request Accept or Reject
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
            dispatch(fetchUser(token))
            dispatch(notificationHandler(response.data.message))

        } catch (error) {
            console.log(error)
            dispatch(notificationHandler("Something went wrong!!"))
        }
    }

    // Loading a chat 
    const openChat = async (conversation_id) => {
        setConversation({ _id: conversation_id })
        // console.log(conversation_id)
        // setConversation(conversations.find(ele => ele.id === conversation_id))
        try {
            let response = await api.post("conversation/getconversation", {
                conversation_id
            },
                {
                    headers: {
                        "auth_token": token
                    }
                })
            if (response.data.status) {
                setConversation(response.data.conversation)
                socket.current.emit("message_seen", { conversation_id: openConversationId.current })
            }
            else dispatch(notificationHandler(response.data.message))
        } catch (error) {
            console.log(error)
            dispatch(notificationHandler("Something went wrong while connecting to server"))
        }
    }

    //Send Message
    const sendMessage = () => {
        if (!messageInput.trim()) return
        console.log(conversation._id)
        socket.current.emit("send_message", { conversation_id: conversation._id, message: messageInput })
        setMessageInput("")
        // setTimeout(ScrollerHandler, 100)
    }

    const ScrollerHandler = () => {
        console.log("Scroller Function is running")
        let elem = document.getElementById('chat-display');
        let testing = elem.offsetHeight + 100000000;
        elem.scrollTo(0, testing);
        // StopScroller();
    }

    //Update Chat
    const updateConversation = (message) => {

        setConversation(prev => {
            if (!prev?.messages) return prev
            const alreadyExists = prev.messages.some(m => m._id === message._id)
            // console.log(alreadyExists, prev.messages, message)
            return {
                ...prev,
                messages: alreadyExists
                    ? prev.messages.map(m => m._id === message._id ? message : m)
                    : [...prev.messages, message]
            }
        })
        if (message.sender !== user._id && document.hasFocus()) {
            socket.current.emit("message_seen", { conversation_id: openConversationId.current })
        }
    }
    return (
        <div className={styles.home_main_container}>
            {/* Add Friend Dialog box */}
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

            {/* Left Side */}
            <div className={styles.home_side_container}>
                <div className={styles.options_container}>
                    <Button className={styles.friends_number} onClick={() => setOpenRequestBox(true)}>
                        <div>{user?.requests?.filter(ele => ele?.is_active === true)?.length}</div>
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
                                    request?.is_active && <ListItem
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
                            socket.current.disconnect()
                            disconnect_socket()
                        }}>Logout</MenuItem>
                    </Menu>
                </div>
                <div className={styles.chat_list_container}>
                    {
                        // Add Friend Button
                        user?.friends_list?.length === 0 || null ?
                            <div style={{ display: "flex", alignItems: "center" }}> Add Friends <IconButton aria-label="delete" onClick={() => setOpen(true)}>
                                <AddIcon style={{ "color": 'white' }} />
                            </IconButton> </div>
                            :
                            // Listing All Conversations
                            user?.conversation_list?.map((chat) => {
                                // console.log(chat)
                                let chat_name
                                if (!chat?.is_group) {
                                    let friend = user?.friends_list?.filter(ele => ele._id === chat.participants.filter(participant_id => participant_id !== user._id)[0])[0]
                                    chat_name = friend?.name
                                }
                                else chat_name = chat.group_name
                                return (
                                    <div key={chat?._id} className={styles.chat_item + " " + (conversation?._id === chat?._id ? styles.current_chat_item : "")} onClick={() => openChat(chat?._id)}>
                                        <Image
                                            src="/profile.png"
                                            height={10}
                                            width={10}
                                            alt="Picture of the author"
                                        />
                                        <div className={styles.chat_item_details_container}>
                                            <h6>{chat_name}</h6>
                                            <p>You have a new message.</p>
                                        </div>
                                    </div>
                                )
                            })
                    }
                </div>
            </div>

            {/* Right Side */}
            < div className={styles.chat_main_container}>
                <div id="chat-display" className={styles.chat_display_container} ref={chat_div}>
                    {
                        conversation?.messages?.map((message, index) => {
                            message["time"] = `${new Date(message.created_date).getHours()} : ${new Date(message.created_date).getMinutes()}`
                            return (
                                <div key={message?._id}>
                                    {addDateLable(conversation?.messages, index)}
                                    {message?.sender !== user._id ?
                                        (<div className={styles.message_main_container + " " + styles.receiver_message}>
                                            <div className={styles.message_box}>
                                                <div className={styles.message}>{message?.message}</div>
                                                <div className={styles.message_meta}>
                                                    <div className={styles.message_time}>{message?.time}</div>
                                                </div>
                                                {/* <div className={styles.message_status}>Seen</div> */}
                                            </div>
                                        </div>) :
                                        (<div className={styles.message_main_container + " " + styles.sender_message}>
                                            <div className={styles.message_box}>
                                                <div className={styles.message}>{message?.message}</div>
                                                <div className={styles.message_meta}>
                                                    <div className={styles.message_time}>{message?.time}</div>
                                                    <div className={styles.message_status}> {message?.status}</div>
                                                </div>
                                            </div>
                                        </div>)}
                                </div>
                            )
                        })
                    }

                </div>
                <div className={styles.chat_input_container} >
                    <input
                        type='text'
                        value={messageInput}
                        onChange={(e) => {
                            setMessageInput(e.target.value)
                            // console.error("On change")
                        }
                        }
                        // tabIndex={0}
                        onKeyDown={(e) => {
                            // alert("This is a test")
                            // console.log(e.key)
                            if (e.key === 'Enter' && messageInput.trim().length > 0) sendMessage()
                        }}
                        placeholder='Write your message here...' />
                    <button className={styles.send_button} onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div >
    )
}

export default Home