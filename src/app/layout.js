import "./globals.css";
import Login from "./Login/page";
import { Roboto } from 'next/font/google'
import Signup from "./Signup/page";
import Home from "./Home/page";
import Link from "next/link";

const roboto = Roboto({
  subsets: ['latin']
})


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`main_body ${roboto.className}`}>
        {children}
        {/* <div>
          <Link href='/Login/Signup'>SignUp</Link>
          <Link href='/Pages/Home'>Home</Link>
        </div> */}
        {/* <Login /> */}
        {/* <Signup /> */}
        {/* <Home /> */}
      </body>
    </html>
  );
}
