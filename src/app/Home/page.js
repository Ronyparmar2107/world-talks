'use client'
import React, { useEffect, useState } from 'react'
import styles from './Home.module.css'
import Image from 'next/image'
import friends_list from '../../dummy_data/friends_list'
import conversations from '@/dummy_data/conversations'
import { useDispatch, useSelector } from 'react-redux'
import { fetchuser } from '@/Redux-Toolkit/Slices/userSlice'
import { IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
    let { token, user } = useSelector(state => state.user)
    const [openChatId, setOpenChatId] = useState()
    const [conversation, setConversation] = useState()

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchuser(token))
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
    const makeDate = (date) => {
        const newDate = new Date(date)
        const dd = newDate.getDate().toString();
        const mm = String(newDate.getMonth() + 1).padStart(2, '0'); // January is 0
        const yyyy = newDate.getFullYear();
        console.log(dd, mm, yyyy)
        return `${dd}/${mm}/${yyyy}`
    }
    const today = new Date();
    const tdd = String(today.getDate()).padStart(2, '0');
    const tmm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    const tyyyy = today.getFullYear();

    const formattedDate = `${tdd}/${tmm}/${tyyyy}`;
    return (
        <div className={styles.home_main_container}>
            <div className={styles.home_side_container}>
                <div className={styles.options_container}>
                    <div className={styles.friends_number}>
                        <div>10</div>
                        <p>Requests</p>
                    </div>
                    <div className={styles.friend_request}>
                        <div>{user.friends_list.length}</div>
                        <p>Friends</p>
                    </div>
                    <div className={styles.account}>
                        <div className={styles.profile_photo}>
                            <Image
                                src="/profile.png"
                                height={30}
                                width={30}
                                alt="Picture of the author"
                            />
                        </div>
                        <p>{user?.name}</p>
                    </div>
                </div>
                <div className={styles.chat_list_container}>
                    {
                        user.friends_list.length === 0 ?
                            <div style={{ display: "flex", alignItems: "center" }}> Add Friends <IconButton aria-label="delete">
                                <AddIcon style={{ "color": 'white' }} />
                            </IconButton> </div>
                            :
                            user.friends_list.map((friend) => {
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