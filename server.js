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

// MongoDB connection
mongoose.connect(process.env.DB_URI);




const db = mongoose.connection;
db.on("error",(error) => console.log(error));
db.once("open",() => console.log("Connected to the Database"))

const app = express();
const PORT = process.env.PORT;
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
  })
);

app.use(nocache());


app.use("/", userauthRoute);
app.use("/", adminfeatRoute);

// Handling all other GET requests
app.get("*", (req, res) => {
  res.status(404).render("user/page404");
});


app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
