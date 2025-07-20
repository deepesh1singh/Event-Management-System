// service/auth.service.js
const JWT = require("jsonwebtoken");
const User = require("../models/User.model");
const Token = require("../models/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const signup = async (data) => {
    let user = await User.findOne({ email: data.email });
    if (user) {

        alert("Email already exists! Please enter a different email.")
    }
    else {
        user = new User(data);
        sendEmail(user.email, "Welcome to Our Platform", { name: user.name }, "./template/welcome.handlebars");
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);
        await user.save();
        return (data = {
            userId: user._id,
            email: user.email,
            name: user.name,
            token: token,
        });
    }
};

const addSalesMan = async (data) => {
    // Extract the email and personType from the data
    const [email1, email2] = data.email; // Extract email[0] and email[1]
    const personType = 'vendor'; // Set the personType to 'vendor'

    // Check if the second email exists in the database
    let user = await User.findOne({ email: email2 });
    if (user) {
        throw new Error("Email already exists! Please enter a different email.");
    } else {
        // Create a new User instance with the provided data
        user = new User({
            ...data,
            email: email2, // Use the second email for user creation
            personType: personType // Set the personType to 'vendor'
        });

        // Send welcome email
        sendEmail(email1, "Welcome to Our Platform", { name: user.name, email: email2, password: data.password }, "./template/welcome2.handlebars");

        // Generate JWT token
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);

        // Save the new user
        await user.save();

        // Return user data with token
        return {
            userId: user._id,
            email: user.email,
            name: user.name,
            token: token,
        };
    }
};

const addAccountant = async (data) => {
    // Extract the email and personType from the data
    let [email1, email2] = data.email; // Extract email[0] and email[1]
    email1 = email1.toString();
    email2 = email2.toString();
    const personType = 'accountant';
    console.log(data);

    // Check if the second email exists in the database
    let user = await User.findOne({ email: email2 });
    if (user) {
        throw new Error("Email already exists! Please enter a different email.");
    } else {
        // Create a new User instance with the provided data
        user = new User({
            ...data,
            email: email2, // Use the second email for user creation
            personType: personType // Set the personType to 'vendor'
        });

        // Send welcome email
        sendEmail(email1, "Welcome to Our Platform", { name: user.name, email: email2, password: data.password }, "./template/welcome2.handlebars");

        // Generate JWT token
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);

        // Save the new user
        await user.save();

        // Return user data with token
        return {
            userId: user._id,
            email: user.email,
            name: user.name,
            token: token,
        };
    }
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.is_deleted) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid email or password/ If you are a new user please signup.");
        }
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);

        // Send email
        sendEmail(user.email, "Login Successful", { name: user.name }, "./template/loginAccount.handlebars");

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
            token: token,
        };
    }

    else {
        throw new Error("User is deleted");
    }
};

const requestPasswordReset = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.error("User does not exist");
            throw new Error("User does not exist");
        }

        let token = await Token.findOne({ userId: user._id });
        if (token) await token.deleteOne();

        let resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

        const newToken = new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now(),
        });

        await newToken.save();
        const baseURL = process.env.CLIENT_URL;
        const link = `${baseURL}/index/resetPassword?token=${resetToken}&id=${user._id}`;
        console.log("Link", link);

        sendEmail(user.email, "Password Reset Request", { name: user.name, token: resetToken, userId: user._id, link: link }, "./template/requestResetPassword.handlebars");
        return link;
    } catch (error) {
        console.error("Error in requestPasswordReset:", error);
        throw error;
    }
};

const resetPassword = async (userId, token, password) => {
    console.log("userId", userId);
    console.log("token", token);
    console.log("password", password);
    try {
        const passwordResetToken = await Token.findOne({ userId });

        if (!passwordResetToken) {
            throw new Error("Invalid or expired password reset token");
        }

        const isValid = await bcrypt.compare(token, passwordResetToken.token);

        if (!isValid) {
            throw new Error("Invalid password reset token");
        }

        const hashedPassword = await bcrypt.hash(password, Number(bcryptSalt));

        await User.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } }
        );

        const user = await User.findById(userId);
        sendEmail(
            user.email,
            "Password Reset Successfully",
            { name: user.name },
            "./template/resetPassword.handlebars"
        );

        await passwordResetToken.deleteOne();

        return true;
    } catch (error) {
        console.error("Error in resetPassword:", error);
        throw error;
    }
};

module.exports = {
    signup,
    login,
    requestPasswordReset,
    resetPassword,
    addSalesMan,
    addAccountant
};
