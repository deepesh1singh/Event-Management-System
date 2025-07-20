const {
  getSearchResults,
  getallevents,
  getEventDetails,
  signUpController,
  resetPasswordRequestController,
  resetPasswordController,
  loginController,
} = require("../controllers/auth.controller");

const router = require("express").Router();

router.get("/", getallevents);

router.get("/search", getSearchResults);

// routes
router.get("/login", (req, res) => {
  res.render("../views/login", { title: "Login" });
});

router.get("/signup", (req, res) => {
  res.render("../views/signup", { title: "SignUp" });
});

router.get("/forgot", (req, res) => {
  res.render("../views/forgot", { title: "Forgot Password" });
});

router.get("/resetPassword", (req, res) => {
  res.render("../views/Reset", { title: "Reset Password" });
});

router.get("/contact", (req, res) => {
  res.render("../views/contact", { title: "Contact Us" });
});

router.get("/about", (req, res) => {
  res.render("../views/about", { title: "About Us" });
});

router.get("/details/:id",getEventDetails);

router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/forgot", resetPasswordRequestController);
router.post("/resetPassword", resetPasswordController);

module.exports = router;
