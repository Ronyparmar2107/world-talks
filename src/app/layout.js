'use client'
import { Provider } from "react-redux";
import "./globals.css";
import { Roboto } from 'next/font/google'
import { Store } from "../Redux-Toolkit/Store";


const roboto = Roboto({
  subsets: ['latin']
})


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`main_body ${roboto.className}`}>
        <Provider store={Store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
