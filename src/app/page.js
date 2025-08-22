'use client'
import styles from "./page.module.css";
import Login from "./Login/page";
import { useDispatch, useSelector } from "react-redux";
import Chat from "./Home/page"
import { Snackbar } from "@mui/material";
import { fetchUser, notificationHandler } from "@/Redux-Toolkit/Slices/userSlice";
import { useEffect } from "react";
import { init_socket } from "@/utils/socket";

export default function Home() {
  let { isLogin, notification, notification_toggle } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  useEffect(() => {
    let token = localStorage.getItem("token")
    console.log(token)
    if (token) {
      dispatch(fetchUser(token))
      init_socket(token)
    }
  }, [dispatch])

  return (
    <>
      {!isLogin ? <Login /> : <Chat />}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={notification_toggle}
        onClose={() => dispatch(notificationHandler(""))}
        message={notification}
      />
    </>
  );
}
