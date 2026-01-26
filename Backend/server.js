import app from "./app.js";
import "dotenv/config";
import { connectDB } from "./data/db.js";
import http from "http";
import { Server } from "socket.io";
const PORT = 3000;
await connectDB();
// Create raw HTTP server
const server = http.createServer(app);

// Create Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.205:5173"],
    credentials: true,
  },
});

// Handle connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
