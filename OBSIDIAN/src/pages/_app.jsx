import '../styles/globals.css';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/Message';
import Header from '../components/Header';

import { useState, useEffect } from 'react';
import cookieParser from "cookie-parser";
import Script from "next/script";
import "animate.css"

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
let socket;
const noSidebarRoutes = ['/Login', '/Register', '/Forgot', '/test'];

export default function MyApp({ Component, pageProps }) {
  const { session } = pageProps;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => { setSidebarOpen(!sidebarOpen) };
  const showSidebar = !noSidebarRoutes.includes(router.pathname);
  const adminSidebar = router.pathname.startsWith("/Admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.cookie = document.cookie;
    }
  }, []);

  const [isSocketReady, setIsSocketReady] = useState(false);
    const [tag, setTag] = useState([]);
    
    async function initSocket() {
      try {
        await fetch("/api/lib/socket");
        socket = io({
          path: "/api/lib/socket",
        });
  
        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
          setIsSocketReady(true);
        });
  
        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });
  
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    }  

    useEffect(() => {
      initSocket();
      
      if (isSocketReady && socket) {
        socket.on("notification", (data) => {

          setTag(data.tag)
          console.log("tag: "+ data.tag);
          console.log("session: " + session.username)
          console.log("bool: " + data.tag == session.username)

          if(data.tag === session.username) {
            const notificationSound = new Audio("/sounds/notification2.wav");
            notificationSound.play().catch((e) => console.error("Erreur lecture audio:", e));
            toast.info(data.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        });
      }
  
      return () => {
        if (socket) {
          socket.off("notification"); 
        }
      };
    }, [isSocketReady, session]);

  return (
      <div className="flex">
        <ToastContainer />
        {(adminSidebar && <AdminSidebar opened={sidebarOpen} />) || (showSidebar && <Sidebar opened={sidebarOpen} />)}
        <main className={`flex-1 transition-all animate__animated animate__fadeInDown ${showSidebar ? "md:ml-60" : ""} grid h-screen grid-rows-[10%_90%] ${router.pathname.startsWith("/Room") && "overflow-y-hidden"}`}>
          {!noSidebarRoutes.includes(router.pathname) && (
           <Header onToggleSidebar={toggleSidebar} className="z-50" />
         )}
          <Component {...pageProps} />
        </main>


        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
          onLoad={() => console.log("Google Sign-In script loaded")}
        />
      </div>
  );
}

export const config = {
  api: {
    bodyParser: false,
  },
};