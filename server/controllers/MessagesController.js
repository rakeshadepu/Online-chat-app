import { mkdirSync, renameSync } from "fs";
import Message from "./../models/MessagesModel.js";

// Get Messages Between Two Users
export const getMessages = async (request, response) => {
  try {
    const { userId } = request; // Current user
    const { id: otherUserId } = request.body; // Recipient user ID

    if (!userId || !otherUserId) {
      return response
        .status(400)
        .json({ message: "Both user IDs are required." });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    }).sort({ timestamp: 1 }); // Oldest to newest

    return response.status(200).json({ messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return response.status(500).json({ message: "Internal server error." });
  }
};

// Upload File
export const uploadFile = async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({ message: "File is required." });
    }

    const timestamp = Date.now();
    const fileDir = `uploads/files/${timestamp}`;
    const filePath = `${fileDir}/${request.file.originalname}`;

    mkdirSync(fileDir, { recursive: true }); // Ensure directory exists
    renameSync(request.file.path, filePath); // Move file to target location

    return response.status(200).json({ filePath });
  } catch (error) {
    console.error("File upload error:", error);
    return response
      .status(500)
      .json({ message: "Internal server error in uploadFile." });
  }
};
