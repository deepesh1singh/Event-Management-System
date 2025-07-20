const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: false,
      default: "unknown", // Default value, you can change it accordingly
      match: /^[a-zA-Z\s]+$/,
      // You can add more validation here if needed
    },
    email: {
      type: String,
      required: true,
      unique: true,
      default: "abc@xyz.com", // Default value, you can change it accordingly
      trim: true,
      lowercase: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      // You can add more validation here if needed
    },
    password: {
      type: String,
      required: true,
      default: "password", // Default value, you can change it accordingly
    },
    personType: {
      type: String,
      required: true,
      default: "customer", // Default value, you can change it accordingly
      enum: ['manager', 'vendor', 'customer','accountant'] // Enumerated values
    },
    gender: {
      type: String,
      required: true,
      default: "unknown", // Default value, you can change it accordingly
      enum: ['male', 'female', 'other', 'unknown'] // Enumerated values
    },
    dateOfBirth: {
      type: Date,
      required: true,
      default: new Date(2000, 1, 1), // Default value, you can change it accordingly
      // You can add more validation here if needed
    },
    age: {
      type: Number,
      required: true,
      default: 18, // Default value, you can change it accordingly
      // You can add more validation here if needed
    },
    mobileNumber: {
      type: String,
      required: true,
      default: "0000000000", // Default value, you can change it accordingly
      // You can add more validation here if needed
    },
    tickets_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'booking',
      default: []
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false
    },
  }, { timestamps: true });
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
  this.password = hash;
  next();
});
module.exports = mongoose.model("user", userSchema);