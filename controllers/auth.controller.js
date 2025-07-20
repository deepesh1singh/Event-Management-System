const {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
} = require("../services/auth.service");

const Event = require("../models/event.model");
const { MongoClient } = require("mongodb");
const connection = require("../db");
const { mongoose } = require("../db");

const getSearchResults = async (req, res, next) => {
  try {
    const searchText = req.query.searchText;
    const isDate = !isNaN(Date.parse(searchText)); // Check if searchText is a valid date

    // Constructing the query object dynamically based on user input
    const query = {
      $or: [
        { title: { $regex: searchText, $options: "i" } }, // Search by title
        { brief: { $regex: searchText, $options: "i" } }, // Search by brief
        { details: { $regex: searchText, $options: "i" } }, // Search by details
        { Performer: { $regex: searchText, $options: "i" } }, // Search by performer
        { Guests: { $regex: searchText, $options: "i" } }, // Search by guest
        { Organisers: { $regex: searchText, $options: "i" } }, // Search by organiser
        { Auditorium: { $regex: searchText, $options: "i" } }, // Search by auditorium
        { Location: { $regex: searchText, $options: "i" } }, // Search by location
      ],
    };

    // If searchText is a valid date, add date search condition to the query
    if (isDate) {
      query.$or.push({ date: new Date(searchText) });
    }

    // Execute the query against the Event model
    const searchResults = await Event.find(query).limit(20);
    res.render("../views/index", { Events: searchResults, title: "Main Page" });
  } catch (error) {
    console.log(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Unable to search on the current data"); window.location.href = '${referer}';</script>`
    ).status(500);
  }
};

const getallevents = async (req, res, next) => {
  try {
    const result = await Event.find().sort({ date: 1 });
    res.render('../views/index', { Events: result, title: 'Main Page' });
  } catch (error) {
    console.log(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Unable to load all the data please try again later or Contact Administrator"); window.location.href = '${referer}';</script>`
    ).status(500);
  }
};

const getEventDetails = async (req, res, next) => {
  try {
    const result = await Event.findOne({ _id: req.params.id });
    res.render('../views/details', { Events: result, titles: 'Details' });
  } catch (error) {
    console.log(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Unable to load all the data please try again later or Contact Administrator"); window.location.href = '${referer}';</script>`
    ).status(500);
  }
};

const signUpController = async (req, res, next) => {
  try {
    await signup(req.body);
    return res.send(
      `<script>alert('Successfully Signed Up , Please Login to Awail Services..'); window.location.href = '/index/login';</script>`
    ).status(200);
  } catch (error) {
    console.error(error);
    return res.send(
      `<script>alert('${error.message}'); window.location.href = '/index/login';</script>`
    ).status(401);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const loginService = await login(email, password);
    // Redirect to /index/:id upon successful login
    res.redirect(`/index/${loginService.userId}`);
  } catch (error) {
    console.error(error);
    return res.send(
      `<script>alert('${error.message}'); window.location.href = '/index/login';</script>`
    ).status(401);
  }
};

const resetPasswordRequestController = async (req, res, next) => {
  try {

    const protocol = req.protocol;
    const host = req.get('host');
    await requestPasswordReset(req.body.email);
    // Redirect to login page with alert message
    return res.send(
      `<script>alert("Check Your Mail to Process Further"); window.location.href = '/index';</script>`
    );
  } catch (error) {
    console.log(error);
    return res.send(
      `<script>alert('${error.message}'); window.location.href = '/index';</script>`
    ).status(500);
  }
};

const resetPasswordController = async (req, res, next) => {
  console.log("Request body:", req.body);
  const { userId, token, password } = req.body; // Destructure userId, token, and password from the request body

  try {
    await resetPassword(userId, token, password); // Call resetPassword with the correct arguments
    // Redirect to login page upon successful password reset
    res.redirect("/index/login");
  } catch (error) {
    // Redirect to login page with alert message
    console.log(error);
    return res.send(
      `<script>alert('Unable to Reset Your Password. Check the filled responses and Try again later'+'${error.message}'); window.location.href = '/index';</script>`
    ).status(500);
  }
};

module.exports = {
  getSearchResults,
  getallevents,
  getEventDetails,
  signUpController,
  loginController,
  resetPasswordRequestController,
  resetPasswordController,
};