const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRouters = require("./routers/userRouters");
const chatRouters = require("./routers/chatRouters");
const messageRouters = require("./routers/messageRouters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

//-------------------------------------------------------- I have commented this----------------------------------------------------------
// For deployment purpose

app.get("/", (req, res) => {
  res.send("API is running Successfully");
});

//---------------------------------------------------------  I have commented this ----------------------------------------------------------

app.use("/api/user", userRouters);
app.use("/api/chat", chatRouters);
app.use("/api/message", messageRouters);

// --------------------------deployment------------------------------

// Ensure this is correctly placed after your API routes

// const __dirname1 = path.resolve(); // Resolve the directory name

// if (process.env.NODE_ENV === "production") {
//   console.log("Environment: Production");

//   // Serve static files from the React frontend build folder
//   app.use(express.static(path.join(__dirname1, "frontend", "build")));

//   // Handle all other routes by serving the React frontend
//   app.get("*", (req, res) => {
//     console.log("Serving index.html");
//     res.sendFile(path.join(__dirname1, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running Successfully...");
//   });
// }

// --------------------------deployment------------------------------

// Ensure this is correctly placed

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.userData = userData; // Store userData in socket object
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("disconnect", () => {
    if (socket.userData) {
      socket.leave(socket.userData._id);
      console.log("User Disconnected");
    }
  });
});

//in package.json
// "build": "npm install --legacy-peer-deps && npm install --legacy-peer-deps --prefix frontend && npm run build --prefix frontend"