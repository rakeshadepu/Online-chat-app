import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true, // Ensures all emails are stored in lowercase
      trim: true, // Removes unnecessary whitespace
      match: [/\S+@\S+\.\S+/, "Email is invalid."], // Validates email format
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
    },
    firstName: {
      type: String,
      trim: true, // Removes unnecessary whitespace
    },
    lastName: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null, // Provides clarity that image can be null
    },
    color: {
      type: Number,
      default: null,
    },
    profileSetup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

// Pre-save middleware to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified
  try {
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
    next();
  } catch (error) {
    return next(error); // Pass any errors to the next middleware
  }
});

// Model creation
const User = mongoose.model("Users", userSchema);

export default User;
