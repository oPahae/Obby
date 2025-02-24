import React, { useState, useEffect, useRef } from 'react';
import Message from "../components/Message";
import Tags from "../components/Tags";
import Infos from "../components/Infos";
import { verifyAuth } from "../middlewares/auth";
import { useRouter } from 'next/router';
import { io } from "socket.io-client";
let socket;

export default function Room({ session }) {
  const [showInfo, setShowInfo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const messageRef = useRef("");
  const messagesRef = useRef("");
  const sendRef = useRef("");
  const router = useRouter()
  const { id } = router.query;

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    initSocket()
    checkRoom()
    const handleKeyDown = (e) => { if (e.key === "Enter") sendRef.current.click() }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function initSocket() {
    await fetch("/api/lib/socket");
    socket = io({
      path: "/api/lib/socket",
    });
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    socket.on("newMessage", (message) => {
      fetchMessages();
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  async function checkRoom() {
    try {
      const response = await fetch(`/api/room/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      
      if(!response.ok)
        window.location.href = "/"
    } catch (error) {
      console.error("Connexion error :", error);
    }
  }
  
  useEffect(() => {
    fetchMessages();
    setTimeout(() => {
      messagesRef.current.scrollBy({ top: messagesRef.current.scrollHeight, left: 0, behavior: "smooth" })
    }, 500);
  }, [id]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/msg/getMsgs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      } else {
        console.error("Error fetching for infos", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Connexion error :", error);
    }
  };

  const handleSend = async (content, type = "text") => {
    console.log(tags)
    if (content.trim() || type !== "text") {
      const newMessage = {
        userID: session.id,
        username: session.username,
        type: type,
        content: content,
        date: new Date(),
        likes: 0,
        tags: tags
      };
  
      try {
        const response = await fetch("/api/msg/sendMsg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, message: newMessage }),
        });
  
        if (response.ok) {
          socket.emit("sendMessage", newMessage); // Émet un événement via Socket.IO
          tags.forEach((tag) => {
            socket.emit("notifyUser", { tag, message: newMessage });
          });
          setMessage("")
          setTags([])
        } else {
          console.error("Error sending message");
        }
      } catch (error) {
        console.error("Connexion error :", error);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : null;
      if (type) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Content = reader.result;
          handleSend(base64Content, type);
        };
        reader.readAsDataURL(file); // Lit le fichier comme URL encodée en base64
      } else {
        alert("File type not supported !");
      }
    }
  };  

  // Gestion de l'enregistrement audio
  const handleRecordAudio = async () => {
    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const audioChunks = [];
        recorder.ondataavailable = (event) => audioChunks.push(event.data);
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = () => {
            const base64Audio = reader.result;
            handleSend(base64Audio, 'audio');
          };
          reader.readAsDataURL(audioBlob);
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const handleLeave = async () => {
    if(!confirm("Are you sure ?")) return
    try {
      const response = await fetch("/api/room/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomID: id, userID: session.id }),
      });

      if (response.ok) {
        window.location.href = "/"
      } else {
        console.error("Can't leave this room");
      }
    } catch (error) {
      console.error("Error :", error);
    }
  }

  const [tags, setTags] = useState([])

  const handleTag = (user) => {
    setMessage(message.split("@")[0] + user.username)
    setTags(prev => [...prev, user.username])
    console.log(tags)
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white font-['DM_Sans']">
      {/* Search Bar */}
      <div className="sticky top-0 h-12 bg-transparent bg-opacity-40 backdrop-blur-md px-6 py-3 z-10 shadow-md flex items-center space-x-4 rounded-b-3xl">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full px-6 py-2 rounded-full bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-inner transition-all backdrop-blur-md"
        />
        <button
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
          onClick={() => setShowInfo(e => !e)}
        >
          Info
        </button>
        <button
          className="px-5 py-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 transition-all transform hover:scale-105"
          onClick={handleLeave}
        >
          Leave
        </button>
      </div>

      {/* Messages Zone */}
      <div ref={messagesRef} className="flex-grow overflow-y-auto p-6 space-y-6 relative z-10">
        {messages
          .filter((msg) => msg.content.includes(searchTerm))
          .map((msg, index) => (
            <Message key={index} msg={msg} session={session}  />
        ))}
        <div className="h-12"></div>
      </div>

      {/* Send Message Bar */}
      {message.includes("@") &&
        <div className="fixed bottom-12 left-0 w-1/2 z-20">
          <Tags roomId={id} userTagged={message.split("@")[1]} handleTag={handleTag} session={session} />
        </div>
      }
      <div className="z-30 sticky bottom-0 h-12 bg-gray-900 bg-opacity-40 backdrop-blur-md px-6 py-3 flex items-center space-x-4 shadow-md rounded-t-3xl">
        <label
          className="p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shadow-md hover:from-gray-600 hover:to-gray-500 transition cursor-pointer"
          title="Upload Image/Video"
        >
          📁
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
        <button
          onClick={handleRecordAudio}
          className={`p-3 rounded-lg shadow-md ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-400'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500'
          } transition`}
          title="Record Audio"
        >
          🎤
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-grow px-6 py-2 rounded-full bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-inner"
          autoComplete='off'
        />
        {message !== "" &&
          <button
            ref={sendRef}
            onClick={e => handleSend(message)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Send
          </button>
        }
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-40 transition-opacity duration-300 overflow-y-hidden h-[110vh]">
          <div className="relative bg-white dark:bg-gray-800 text-black dark:text-white rounded-3xl shadow-2xl p-6 max-w-4xl w-full mx-4 animate-fadeIn max-h-[100%] overflow-y-scroll">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-transform transform hover:scale-110"
              title="Close"
            >
              ✖
            </button>
            <Infos roomId={id} session={session} />
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (!user) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  return {
    props: { session: { username: user.username, id: user.id } },
  };
}