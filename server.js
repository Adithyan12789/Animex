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

// MongoDB connection with better error handling
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("Connected to the Database"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to the Database"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "/public")));
app.use("/temp", express.static(path.join(__dirname, "/temp")));
app.set("view engine", "ejs");
app.use(express.static("uploads"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
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
  console.error(err.stack);
  res.status(500).render("user/page404", { 
    error: "Something went wrong!",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.get("*", (req, res) => {
  res.status(404).render("user/page404");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
