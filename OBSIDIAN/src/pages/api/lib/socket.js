import { Server } from "socket.io";

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Initialisation de Socket.IO...");

    io = new Server(res.socket.server, {
      path: "/api/lib/socket",
      cors: {
        origin: "*", // Changez "*" par votre domaine en production
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {

      socket.on("sendMessage", (message) => {
        console.log("Message recived :", message);
        io.emit("newMessage", message);
      });

      socket.on("notifyUser", ({ tag, message }) => {
        console.log(`Notification to ${tag}: ${message.content}`);
        io.emit("notification", {
          tag: tag,
          message: `You were mentioned in a message: ${message.content}`,
        });
      });

      socket.on("disconnect", () => {
      });
    });
  }

  res.end();
}