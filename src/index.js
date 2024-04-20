require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const {
  TikTokConnectionWrapper,
  getGlobalConnectionCount,
} = require("./utils/connectionWrapper");
const { clientBlocked } = require("./utils/limiter");
const ChatService = require("./services/chat.service");
const userRouter = require("./routers/user.routes");

const app = express();
const httpServer = createServer(app);

// Enable cross origin resource sharing
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(() => {
  console.log("Connected to DB! ✅");
});

app.use(morgan("tiny"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let userId = undefined;

// Emit global connection statistics
setInterval(() => {
  io.emit("statistic", { globalConnectionCount: getGlobalConnectionCount() });
}, 5000);

// Serve frontend files
app.use(express.static("public"));

// Test middleware
app.use((req, res, next) => {
  console.log("cookies:", req.cookies);
  userId = req.cookies.userId;
  next();
});

io.on("connection", (socket) => {
  let tiktokConnectionWrapper;
  let room = {
    roomId: "",
    createTime: null,
  };
  const owner = {
    displayId: "",
    nickname: "",
  };

  console.info(
    "New connection from origin",
    socket.handshake.headers["origin"] || socket.handshake.headers["referer"]
  );

  socket.on("setUniqueId", (uniqueId, options) => {
    // Prohibit the client from specifying these options (for security reasons)
    if (typeof options === "object" && options) {
      delete options.requestOptions;
      delete options.websocketOptions;
    } else {
      options = {};
    }

    // Session ID in .env file is optional
    if (process.env.SESSIONID) {
      options.sessionId = process.env.SESSIONID;
      console.info("Using SessionId");
    }

    // Check if rate limit exceeded
    if (process.env.ENABLE_RATE_LIMIT && clientBlocked(io, socket)) {
      socket.emit(
        "tiktokDisconnected",
        "You have opened too many connections or made too many connection requests. Please reduce the number of connections/requests or host your own server instance. The connections are limited to avoid that the server IP gets blocked by TokTok."
      );
      return;
    }

    // Connect to the given username (uniqueId)
    try {
      tiktokConnectionWrapper = new TikTokConnectionWrapper(
        uniqueId,
        options,
        true
      );

      setInterval(() => {
        tiktokConnectionWrapper.connect();
      }, 3000);
    } catch (err) {
      socket.emit("tiktokDisconnected", err.toString());
      return;
    }

    // Redirect wrapper control events once
    tiktokConnectionWrapper.once("connected", (state) => {
      room.roomId = state.roomId;
      room.createTime = new Date(parseInt(state.roomInfo.create_time) * 1000);
      owner.displayId = state.roomInfo.owner.display_id;
      owner.nickname = state.roomInfo.owner.nickname;

      return socket.emit("tiktokConnected", state);
    });
    tiktokConnectionWrapper.once("disconnected", (reason) =>
      socket.emit("tiktokDisconnected", reason)
    );

    // Notify client when stream ends
    tiktokConnectionWrapper.connection.on("streamEnd", () =>
      socket.emit("streamEnd")
    );

    // Redirect message events
    tiktokConnectionWrapper.connection.on("roomUser", (msg) =>
      socket.emit("roomUser", msg)
    );
    // tiktokConnectionWrapper.connection.on("member", (msg) =>
    //   socket.emit("member", msg)
    // );
    tiktokConnectionWrapper.connection.on("chat", async (msg) => {
      // Store chat
      await ChatService.add(msg, room, userId, owner);

      return socket.emit("chat", msg);
    });
  });

  socket.on("disconnect", () => {
    if (tiktokConnectionWrapper) {
      tiktokConnectionWrapper.disconnect();
    }
  });
});

// ROUTES
app.use("/api/v1/users", userRouter);

// Start http listener
const port = process.env.PORT || 8081;
httpServer.listen(port);
console.info(`Server running! Please visit http://localhost:${port}`);
