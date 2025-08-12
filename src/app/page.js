'use client'
import styles from "./page.module.css";
import Login from "./Login/page";
import { useDispatch, useSelector } from "react-redux";
import Chat from "./Home/page"
import { Snackbar } from "@mui/material";
import { fetchuser, notificationHandler } from "@/Redux-Toolkit/Slices/userSlice";
import { useEffect } from "react";

export default function Home() {
  let { isLogin, notification, notification_toggle } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  useEffect(() => {
    let token = localStorage.getItem("token")
    if (token) {
      dispatch(fetchuser(token))
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
