import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";

// Create Channel
export const createChannel = async (request, response) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId;

    // Validate admin user
    const admin = await User.findById(userId);
    if (!admin) {
      return response.status(404).json({ message: "Admin user not found." });
    }

    // Validate members
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return response
        .status(400)
        .json({ message: "Some members are not valid users." });
    }

    // Create and save the channel
    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });
    await newChannel.save();

    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Error in createChannel:", error);
    return response
      .status(500)
      .json({ message: "Internal server error during channel creation." });
  }
};

// Get User Channels
export const getUserChannels = async (request, response) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.userId);

    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return response.status(200).json({ channels });
  } catch (error) {
    console.error("Error in getUserChannels:", error);
    return response
      .status(500)
      .json({
        message: "Internal server error during fetching user channels.",
      });
  }
};

// Get Channel Messages
export const getChannelMessages = async (request, response) => {
  try {
    const { channelId } = request.params;

    // Validate channel
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });

    if (!channel) {
      return response.status(404).json({ message: "Channel not found." });
    }

    const messages = channel.messages || [];
    return response.status(200).json({ messages });
  } catch (error) {
    console.error("Error in getChannelMessages:", error);
    return response
      .status(500)
      .json({
        message: "Internal server error during fetching channel messages.",
      });
  }
};
