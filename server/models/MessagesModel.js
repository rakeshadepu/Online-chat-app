import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    messageType: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
      validate: {
        validator: function (value) {
          if (this.messageType === "text" && (!value || value.trim() === "")) {
            return false;
          }
          return true;
        },
        message: "Text content cannot be empty.",
      },
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.messageType === "file";
      },
      validate: {
        validator: function (value) {
          if (this.messageType === "file" && !value) {
            return false;
          }
          return true;
        },
        message: "File URL is required for file messages.",
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const Message = mongoose.model("Messages", messageSchema);

export default Message;
