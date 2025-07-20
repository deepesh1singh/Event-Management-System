require("express-async-errors");
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { connectDB } = require("./db");
const cors = require("cors");
const ejs = require("ejs");

const app = express();

const port = process.env.PORT;

(async function initializeApp() {
  try {
    await connectDB();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process if unable to connect to the database
  }
})();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/index");
});

app.use("/index", require("./routes/index.route"));
app.use("/index", require("./routes/profile.routes"));

app.use((error, req, res, next) => {
  const errorMessage = error.message || "An unexpected error occurred";
  res.status(500).render("500", { title: "Error", errorMessage: errorMessage });
});

app.listen(port, () => {
  console.log("Listening to Port ", port);
});

module.exports = app;
