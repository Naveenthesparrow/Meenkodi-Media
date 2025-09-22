import mongoose from "mongoose";

const commonModelFeatures = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  images: [
    {
      url: String,
      caption: String,
      credit: String,
    },
  ],
  contentSections: [
    {
      subtitle: String,
      content: String,
      imageUrl: String,
      imageCaption: String,
      videoUrl: String,
      videoTitle: String,
      videoDescription: String,
      orderIndex: Number,
    },
  ],
  metadata: {
    period: String,
    region: String,
    significance: String,
    tags: [String],
    customFields: [
      {
        key: String,
        value: String,
      },
    ],
  },
  media: {
    images: [
      {
        url: String,
        caption: String,
        credit: String,
      },
    ],
    videos: [
      {
        url: String,
        title: String,
        description: String,
      },
    ],
    documents: [
      {
        url: String,
        title: String,
        type: String,
      },
    ],
  },
  social: {
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
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
            type: String,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: Number,
    views: Number,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
  },
  meta: {
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
};

export default commonModelFeatures;
