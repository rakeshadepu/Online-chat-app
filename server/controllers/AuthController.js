import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60; // Max age in seconds
const cookieMaxAge = maxAge * 1000; // Convert to milliseconds for cookie

const createToken = (email, userId) => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined in environment variables.");
  }
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge, // JWT expects time in seconds
  });
};

// Signup
export const signup = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response
        .status(400)
        .json({ message: "Email and password are mandatory." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(409).json({ message: "Email is already in use." });
    }

    const user = await User.create({ email, password });
    response.cookie("jwt", createToken(email, user.id), {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: cookieMaxAge,
    });

    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        image: user.image,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during signup." });
  }
};

// Login
export const login = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response
        .status(400)
        .json({ message: "Email and password are mandatory." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response
        .status(404)
        .json({ message: "User with given email not found." });
    }

    const auth = await compare(password, user.password);
    if (!auth) {
      return response
        .status(401)
        .json({ message: "Invalid email or password." });
    }

    response.cookie("jwt", createToken(email, user.id), {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: cookieMaxAge,
    });

    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        image: user.image || null,
        profileSetup: user.profileSetup || false,
        color: user.color || null,
      },
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during login." });
  }
};

// Get User Info
export const getUserInfo = async (request, response) => {
  try {
    const userData = await User.findById(request.userId);
    if (!userData) {
      return response
        .status(404)
        .json({ message: "User with the given id not found." });
    }

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during getUserInfo." });
  }
};

// Update Profile
export const updateProfile = async (request, response) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;

    if (!firstName || !lastName) {
      return response
        .status(400)
        .json({ message: "First name and last name are required." });
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during updateProfile." });
  }
};

// Add Profile Image
export const addProfileImage = async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({ message: "File is required." });
    }

    const date = Date.now();
    const fileName = `uploads/profiles/${date}-${request.file.originalname}`;
    renameSync(request.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return response.status(200).json({ image: updatedUser.image });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during addProfileImage." });
  }
};

// Remove Profile Image
export const removeProfileImage = async (request, response) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).json({ message: "User not found." });
    }

    if (user.image) {
      unlinkSync(user.image);
      user.image = null;
      await user.save();
    }

    return response
      .status(200)
      .json({ message: "Profile image removed successfully." });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during removeProfileImage." });
  }
};

// Logout
export const logout = async (request, response) => {
  try {
    response.cookie("jwt", "", {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return response.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error during logout." });
  }
};
