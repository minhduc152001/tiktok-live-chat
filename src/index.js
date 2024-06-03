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
const cors = require("cors");
const { clientBlocked } = require("./utils/limiter");
const userRouter = require("./routers/user.routes");
const orderRouter = require("./routers/order.routes");
const roomRouter = require("./routers/room.routes");
const chatRouter = require("./routers/chat.routes");
const { runQueue, processJobQueue, jobQueue, jobIntervals } = require("./clients/queue");
const LiveService = require("./services/livechat.service");
const { addJob } = require("./utils/addJob");
const app = express();
const httpServer = createServer(app);

const port = process.env.PORT;

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

// let userId = undefined;

// Emit global connection statistics
setInterval(() => {
  io.emit("statistic", { globalConnectionCount: getGlobalConnectionCount() });
}, 5000);

// Serve frontend files
app.use(express.static("public"));

// Use CORS
app.use(cors());

io.on("connection", (socket) => {
  let tiktokConnectionWrapper;

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

      tiktokConnectionWrapper.connect();
    } catch (err) {
      socket.emit("tiktokDisconnected", err.toString());
      return;
    }

    // Redirect wrapper control events once
    tiktokConnectionWrapper.once("connected", (state) =>
      socket.emit("tiktokConnected", state)
    );
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
    tiktokConnectionWrapper.connection.on("member", (msg) =>
      socket.emit("member", msg)
    );
    tiktokConnectionWrapper.connection.on("chat", (msg) =>
      socket.emit("chat", msg)
    );
  });

  socket.on("disconnect", () => {
    if (tiktokConnectionWrapper) {
      tiktokConnectionWrapper.disconnect();
    }
  });
});

// Initialize the processJobQueue with the startTrackLive function
processJobQueue(LiveService.startTrackLive(addJob(jobQueue), jobIntervals));

// Start the queue processing
runQueue();

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/chats", chatRouter);

// Start http listener
httpServer.listen(port);
console.info(`Server running! Please visit http://localhost:${port}`);
