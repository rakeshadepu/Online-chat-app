import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";

// Search Contacts
export const searchContacts = async (request, response) => {
  try {
    const { searchTerm } = request.body;

    if (!searchTerm) {
      return response.status(400).json({ message: "Search term is required." });
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}{}|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: request.userId } }, // Exclude the current user
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        },
      ],
    });

    return response.status(200).json({ contacts });
  } catch (error) {
    console.error("Error in searchContacts:", error);
    return response
      .status(500)
      .json({ message: "Internal server error in searchContacts." });
  }
};

// Get Contacts for Direct Messages List
export const getContactsForDMList = async (request, response) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 }, // Sort messages by timestamp
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users", // Name of the MongoDB users collection
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo", // Extract user information
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 }, // Sort by most recent message
      },
    ]);

    return response.status(200).json({ contacts });
  } catch (error) {
    console.error("Error in getContactsForDMList:", error);
    return response
      .status(500)
      .json({ message: "Internal server error in getContactsForDMList." });
  }
};

// Get All Contacts
export const getAllContacts = async (request, response) => {
  try {
    const users = await User.find(
      { _id: { $ne: request.userId } },
      "firstName lastName email _id"
    );

    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return response.status(200).json({ contacts });
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    return response
      .status(500)
      .json({ message: "Internal server error in getAllContacts." });
  }
};
