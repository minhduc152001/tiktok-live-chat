import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectMongo from "connect-mongo";
import cookieParser from "cookie-parser"; // Add this line
// import authRoutes from "./routes/auth";
// import User from "./models/User";

// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    // store: new (connectMongo(session))({
    //   mongooseConnection: mongoose.connection,
    // }),
    cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Home Page");
});

app.get("/dashboard", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.send("Dashboard Page");
  } else {
    res.redirect("/login");
  }
});

// app.use("/auth", authRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start server
    app.listen(3000, () => {
      console.log("Server started on http://localhost:3000");
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
