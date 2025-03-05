const express = require("express");
const path = require("path");
const nocache = require("nocache");
const userauthRoute = require("./routes/userAuth");
const adminfeatRoute = require("./routes/adminfeat");
const session = require("express-session");
const mongoose = require("mongoose");
require("dotenv").config();

// Load environment variables from .env file
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Add error logging middleware at the very beginning
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

connectDB();

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to the Database"));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files handling
app.use("/static", express.static(path.join(__dirname, "/public")));
app.use("/temp", express.static(path.join(__dirname, "/temp")));
app.use(express.static("uploads"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || '1231fdsdfssg33435',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(nocache());

// Routes
app.use("/", userauthRoute);
app.use("/", adminfeatRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).render("user/page404", { 
    error: "Something went wrong!",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.get("*", (req, res) => {
  res.status(404).render("user/page404");
});

// For Vercel serverless function
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
