import { io } from "socket.io-client";

let socket

export const init_socket = (token) => {

    try {
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
                transports: ["websocket"],
                auth: {
                    "auth_token": token
                }
            })

            try {
                socket.on("connect", () => {
                    console.log("socket connected", socket.id)
                })
                socket.on("disconnect", () => {
                    console.log("socket disconnected")
                })

            } catch (error) {

            }


        }

    } catch (error) {
        console.log("Socket Not conected", error)
    }
    return socket

}

export const get_socket = () => {
    if (!socket) throw new Error("Socket not initialized");
    return socket
}

export const disconnect_socket = () => {
    // console.log("in disconnect")
    if (socket) {
        socket.disconnect()
        socket = null
    }
}