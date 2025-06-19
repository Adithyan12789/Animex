const express = require("express");
const path = require("path");
const nocache = require("nocache");
const userauthRoute = require("./routes/userAuth");
const adminfeatRoute = require("./routes/adminfeat");
const session = require("express-session");
const mongoose = require("mongoose");
const serverless = require('serverless-http');
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
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true
    };
    
    await mongoose.connect(process.env.DB_URI, options);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Initialize MongoDB connection
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

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

// Session configuration with memory store for serverless
const MemoryStore = require('memorystore')(session);
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 86400 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || '1231fdsdfssg33435',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  })
);

app.use(nocache());

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

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
  
  // Check if headers are already sent
  if (res.headersSent) {
    return next(err);
  }

  // Try to render error page, fallback to JSON if that fails
  try {
    res.status(500).render("user/page404", { 
      error: "Something went wrong!",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } catch (renderError) {
    console.error("Error rendering error page:", renderError);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 404 handler
app.get("*", (req, res) => {
  try {
    res.status(404).render("user/page404");
  } catch (error) {
    console.error("Error rendering 404 page:", error);
    res.status(404).json({ error: "Not Found" });
  }
});

if (process.env.NODE_ENV === 'production') {
  module.exports = serverless(app); // for Vercel
} else {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
