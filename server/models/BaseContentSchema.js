import mongoose from "mongoose";

// Common schema for comments that can be reused across models
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  replies: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      type: String, // emoji/reaction type
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Common content section schema that can be used across different types of content
const contentSectionSchema = new mongoose.Schema({
  subtitle: String,
  content: String,
  imageUrl: String,
  imageCaption: String,
  videoUrl: String,
  videoTitle: String,
  videoDescription: String,
  orderIndex: Number,
});

// Base schema that contains common fields for all content types
const baseContentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: String,
  primaryImage: {
    url: String,
    caption: String,
    credit: String,
  },
  images: [
    {
      url: String,
      caption: String,
      credit: String,
    },
  ],
  period: String,
  location: String,
  tags: [String],
  attributes: [
    {
      key: String,
      value: String,
    },
  ],
  contentSections: [contentSectionSchema],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [commentSchema],
  viewCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
  },
  metadata: {
    lastModified: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export { baseContentSchema, contentSectionSchema, commentSchema };
