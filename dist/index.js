"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Add this line
// import authRoutes from "./routes/auth";
// import User from "./models/User";
const MONGODB_URI = process.env.MONGODB_URI;
const app = (0, express_1.default)();
// Middleware
app.set("view engine", "ejs");
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)()); // Use cookie-parser middleware
app.use((0, express_session_1.default)({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    // store: new (connectMongo(session))({
    //   mongooseConnection: mongoose.connection,
    // }),
    cookie: { secure: false }, // Set secure to true if using HTTPS
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
// Routes
app.get("/", (req, res) => {
    res.send("Home Page");
});
app.get("/dashboard", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("Dashboard Page");
    }
    else {
        res.redirect("/login");
    }
});
// app.use("/auth", authRoutes);
// Connect to MongoDB
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log("Connected to MongoDB");
    // Start server
    app.listen(3000, () => {
        console.log("Server started on http://localhost:3000");
    });
})
    .catch((err) => console.error("Error connecting to MongoDB:", err));
