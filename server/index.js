import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import mongoose from "mongoose";
import Article from "./models/Article.js";
import Gallery from "./models/Gallery.js";
import Event from "./models/Event.js";
import Resource from "./models/Resource.js";
import Comment from "./models/Comment.js";
import Land from "./models/Land.js";
import Temple from "./models/Temple.js";
import King from "./models/King.js";
import Literature from "./models/Literature.js";
import Dance from "./models/Dance.js";
import Food from "./models/Food.js";
import Festival from "./models/Festival.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import AncientScience from "./models/AncientScience.js";
import Clothing from "./models/Clothing.js";
import { localizeCollection, localizeSingle, resolveLang } from './translationMap.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const allowedOrigins = [
  "http://localhost:5173",
  "https://meenkodi-media-fd.onrender.com",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
    name: "sessionId", // Explicit session name
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Session debugging middleware
app.use((req, res, next) => {
  console.log("=== SESSION MIDDLEWARE DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session exists:", !!req.session);
  console.log("User in session:", req.session?.passport?.user);
  next();
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            role: "user",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Auth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/auth/failure`,
    session: true,
  }),
  (req, res) => {
    console.log("OAuth callback success, redirecting to client...");
    res.redirect(
      `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/auth/google/callback`
    );
  }
);

app.get("/auth/user", (req, res) => {
  console.log("=== AUTH USER DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User:", req.user);
  console.log("Is Authenticated:", req.isAuthenticated());

  if (req.user) {
    const { _id, googleId, displayName, email, role, photo } = req.user;
    console.log("Sending user data:", {
      _id,
      googleId,
      displayName,
      email,
      role,
      photo,
    });
    res.json({ _id, googleId, displayName, email, role, photo });
  } else {
    console.log("No user found, sending 401");
    res.status(401).json(null);
  }
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  });
});

app.get("/auth/failure", (req, res) => {
  res.redirect(
    `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/failure`
  );
});

function ensureAuthenticated(req, res, next) {
  console.log("=== ENSURE AUTHENTICATED DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User:", req.user);
  console.log("Is Authenticated:", req.isAuthenticated());

  if (req.isAuthenticated()) {
    console.log("User is authenticated, proceeding");
    return next();
  }

  console.log("User is NOT authenticated, sending 401");
  res.status(401).send("Not authenticated");
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") return next();
  res.status(403).send("Admins only");
}

app.get("/api/admin/users", ensureAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get("/api/user/profile", ensureAuthenticated, (req, res) => {
  res.json(req.user);
});

// Article routes
app.get("/api/articles", async (req, res) => {
  const lang = resolveLang(req);
  const articles = await Article.find();
  res.json(localizeCollection(articles, 'articles', lang));
});
app.get("/api/articles/:id", async (req, res) => {
  const lang = resolveLang(req);
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found'});
  res.json(localizeSingle(article, 'articles', lang));
});
app.post("/api/articles", ensureAdmin, async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/articles/:id", ensureAdmin, async (req, res) => {
  try {
    console.log("PUT /api/articles/:id", req.params.id, req.body);
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/articles/:id", ensureAdmin, async (req, res) => {
  console.log("DELETE /api/articles/:id", req.params.id);
  const result = await Article.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "Article not found" });
  res.status(204).end();
});

// Gallery routes
app.get("/api/gallery", async (req, res) => {
  const lang = resolveLang(req);
  const gallery = await Gallery.find();
  res.json(localizeCollection(gallery, 'gallery', lang));
});
app.get("/api/gallery/:id", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Gallery item not found" });
    res.json(localizeSingle(item, 'gallery', lang));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/gallery", ensureAdmin, async (req, res) => {
  try {
    const item = await Gallery.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/gallery/:id", ensureAdmin, async (req, res) => {
  try {
    console.log("PUT /api/gallery/:id", req.params.id, req.body);
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Gallery item not found" });
    res.json(item);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/gallery/:id", ensureAdmin, async (req, res) => {
  console.log("DELETE /api/gallery/:id", req.params.id);
  const result = await Gallery.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "Gallery item not found" });
  res.status(204).end();
});

// Event routes
app.get("/api/events", async (req, res) => {
  const lang = resolveLang(req);
  const events = await Event.find();
  res.json(localizeCollection(events, 'events', lang));
});
app.get("/api/events/:id", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(localizeSingle(event, 'events', lang));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/events", ensureAdmin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/events/:id", ensureAdmin, async (req, res) => {
  try {
    console.log("PUT /api/events/:id", req.params.id, req.body);
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/events/:id", ensureAdmin, async (req, res) => {
  console.log("DELETE /api/events/:id", req.params.id);
  const result = await Event.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "Event not found" });
  res.status(204).end();
});

// Resource routes
app.get("/api/resources", async (req, res) => {
  const lang = resolveLang(req);
  const resources = await Resource.find();
  res.json(localizeCollection(resources, 'resources', lang));
});
app.get("/api/resources/:id", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json(localizeSingle(resource, 'resources', lang));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/resources", ensureAdmin, async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/resources/:id", ensureAdmin, async (req, res) => {
  try {
    console.log("PUT /api/resources/:id", req.params.id, req.body);
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json(resource);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/resources/:id", ensureAdmin, async (req, res) => {
  console.log("DELETE /api/resources/:id", req.params.id);
  const result = await Resource.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "Resource not found" });
  res.status(204).end();
});

// Comment routes
app.get("/api/comments/:type/:id", async (req, res) => {
  const comments = await Comment.find({
    relatedType: req.params.type,
    relatedId: req.params.id,
  });
  res.json(comments);
});
app.post("/api/comments", ensureAuthenticated, async (req, res) => {
  const comment = await Comment.create({
    ...req.body,
    author: req.user.displayName,
  });
  res.status(201).json(comment);
});
app.delete("/api/comments/:id", ensureAdmin, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Update user role (admin only)
app.put("/api/admin/users/:id/role", ensureAdmin, async (req, res) => {
  console.log("PUT /api/admin/users/:id/role", req.params.id, req.body);
  const { role } = req.body;
  if (!role || !["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
// Update user info (admin only)
app.put("/api/admin/users/:id", ensureAdmin, async (req, res) => {
  console.log("PUT /api/admin/users/:id", req.params.id, req.body);
  const { displayName, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { displayName, email },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
// Delete user (admin only)
app.delete("/api/admin/users/:id", ensureAdmin, async (req, res) => {
  console.log("DELETE /api/admin/users/:id", req.params.id);
  const result = await User.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "User not found" });
  res.status(204).end();
});

// Land routes
app.get("/api/lands", async (req, res) => {
  const lang = resolveLang(req);
  const lands = await Land.find();
  res.json(localizeCollection(lands, 'lands', lang));
});
app.get("/api/lands/:id", async (req, res) => {
  const lang = resolveLang(req);
  const land = await Land.findById(req.params.id);
  if (!land) return res.status(404).json({ error: 'Land not found'});
  res.json(localizeSingle(land, 'lands', lang));
});
app.post("/api/lands", ensureAdmin, async (req, res) => {
  try {
    const land = await Land.create(req.body);
    res.status(201).json(land);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/lands/:id", ensureAdmin, async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json(land);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/lands/:id", ensureAdmin, async (req, res) => {
  const result = await Land.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "Land not found" });
  res.status(204).end();
});

// Multer setup for general file uploads
const createDirectories = () => {
  const directories = [
    "uploads/gallery",
    "uploads/articles",
    "uploads/events",
    "uploads/resources",
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Multer storage configuration for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), "uploads/gallery");

    // Ensure uploads directory exists with full permissions
    try {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
    } catch (err) {
      console.error("Failed to create uploads directory:", err);
    }

    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const sanitizedOriginalName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, "_") // Replace special characters
      .toLowerCase();

    cb(null, `image-${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    // Detailed image type validation
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, GIF, WEBP, BMP`
        ),
        false
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
    files: 1, // Limit to single file upload
  },
});

// General image upload endpoint
app.post(
  "/api/upload/image",
  ensureAdmin,
  (req, res, next) => {
    // Log authentication details
    console.log("Image Upload Authentication Check:", {
      isAuthenticated: req.isAuthenticated(),
      user: req.user
        ? {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role,
          }
        : "No user",
    });

    // Ensure admin authentication
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized",
        details: "Only admin users can upload images",
      });
    }

    next();
  },
  imageUpload.single("image"),
  (req, res) => {
    try {
      console.log("Image Upload Request FULL Details:", {
        file: req.file
          ? {
              originalname: req.file.originalname,
              filename: req.file.filename,
              path: req.file.path,
              destination: req.file.destination,
              size: req.file.size,
              mimetype: req.file.mimetype,
            }
          : "No file",
        user: req.user
          ? {
              email: req.user.email,
              role: req.user.role,
              id: req.user._id,
            }
          : "No user",
        body: req.body,
      });

      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({
          error: "No image file uploaded",
          details: "File was not processed by multer",
        });
      }

      // Ensure uploads directory exists with full permissions
      const uploadsDir = path.join(process.cwd(), "uploads/gallery");
      try {
        fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
      } catch (mkdirError) {
        console.error("Failed to create uploads directory:", mkdirError);
        return res.status(500).json({
          error: "Failed to create uploads directory",
          details: mkdirError.message,
        });
      }

      // Verify file was actually saved
      const fullFilePath = path.join(uploadsDir, req.file.filename);

      // Check file existence and permissions
      try {
        fs.accessSync(fullFilePath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (accessError) {
        console.error("File access error:", accessError);
        return res.status(500).json({
          error: "Cannot access uploaded file",
          details: accessError.message,
          filePath: fullFilePath,
        });
      }

      // Verify file stats
      try {
        const fileStats = fs.statSync(fullFilePath);
        console.log("Uploaded file stats:", {
          path: fullFilePath,
          size: fileStats.size,
          created: fileStats.birthtime,
          isFile: fileStats.isFile(),
        });

        // Additional size check
        if (fileStats.size === 0) {
          console.error("Uploaded file is empty");
          return res.status(400).json({
            error: "Uploaded file is empty",
            filePath: fullFilePath,
          });
        }
      } catch (statError) {
        console.error("File stat error:", statError);
        return res.status(500).json({
          error: "Failed to get file stats",
          details: statError.message,
          filePath: fullFilePath,
        });
      }

      // Generate public URL
      const publicUrl = `/uploads/gallery/${req.file.filename}`;

      // Attempt to read file to verify it's a valid image
      try {
        const imageBuffer = fs.readFileSync(fullFilePath);
        // You could add more sophisticated image validation here if needed
      } catch (readError) {
        console.error("Failed to read uploaded image:", readError);
        return res.status(500).json({
          error: "Failed to read uploaded image",
          details: readError.message,
        });
      }

      res.json({
        imageUrl: publicUrl,
        fullPath: fullFilePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
      });
    } catch (error) {
      console.error("Comprehensive Image Upload Error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      res.status(500).json({
        error: "Failed to upload image",
        details: error.message,
        stack: error.stack,
      });
    }
  }
);

// Video upload storage configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), "uploads/gallery");

    // Ensure uploads directory exists with full permissions
    try {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
    } catch (err) {
      console.error("Failed to create uploads directory:", err);
    }

    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const sanitizedOriginalName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, "_") // Replace special characters
      .toLowerCase();

    cb(null, `video-${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    // Detailed video type validation
    const allowedMimeTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/webm",
      "video/quicktime",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported video type: ${file.mimetype}. Allowed types: MP4, AVI, MOV, WEBM`
        ),
        false
      );
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 1, // Limit to single file upload
  },
});

// General video upload endpoint
app.post(
  "/api/upload/video",
  ensureAdmin,
  (req, res, next) => {
    // Log authentication details
    console.log("Video Upload Authentication Check:", {
      isAuthenticated: req.isAuthenticated(),
      user: req.user
        ? {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role,
          }
        : "No user",
    });

    // Ensure admin authentication
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Unauthorized",
        details: "Only admin users can upload videos",
      });
    }

    next();
  },
  videoUpload.single("video"),
  (req, res) => {
    try {
      console.log("Video Upload Request FULL Details:", {
        file: req.file
          ? {
              originalname: req.file.originalname,
              filename: req.file.filename,
              path: req.file.path,
              destination: req.file.destination,
              size: req.file.size,
              mimetype: req.file.mimetype,
            }
          : "No file",
        user: req.user
          ? {
              email: req.user.email,
              role: req.user.role,
              id: req.user._id,
            }
          : "No user",
        body: req.body,
      });

      if (!req.file) {
        console.error("No video file uploaded");
        return res.status(400).json({
          error: "No video file uploaded",
          details: "File was not processed by multer",
        });
      }

      // Ensure uploads directory exists with full permissions
      const uploadsDir = path.join(process.cwd(), "uploads/gallery");
      try {
        fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
      } catch (mkdirError) {
        console.error("Failed to create uploads directory:", mkdirError);
        return res.status(500).json({
          error: "Failed to create uploads directory",
          details: mkdirError.message,
        });
      }

      // Verify file was actually saved
      const fullFilePath = path.join(uploadsDir, req.file.filename);

      // Check file existence and permissions
      try {
        fs.accessSync(fullFilePath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (accessError) {
        console.error("File access error:", accessError);
        return res.status(500).json({
          error: "Cannot access uploaded video",
          details: accessError.message,
          filePath: fullFilePath,
        });
      }

      // Verify file stats
      try {
        const fileStats = fs.statSync(fullFilePath);
        console.log("Uploaded video stats:", {
          path: fullFilePath,
          size: fileStats.size,
          created: fileStats.birthtime,
          isFile: fileStats.isFile(),
        });

        // Additional size check
        if (fileStats.size === 0) {
          console.error("Uploaded video is empty");
          return res.status(400).json({
            error: "Uploaded video is empty",
            filePath: fullFilePath,
          });
        }
      } catch (statError) {
        console.error("Video stat error:", statError);
        return res.status(500).json({
          error: "Failed to get video stats",
          details: statError.message,
          filePath: fullFilePath,
        });
      }

      // Generate public URL
      const publicUrl = `/uploads/gallery/${req.file.filename}`;

      res.json({
        videoUrl: publicUrl,
        fullPath: fullFilePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
      });
    } catch (error) {
      console.error("Comprehensive Video Upload Error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      res.status(500).json({
        error: "Failed to upload video",
        details: error.message,
        stack: error.stack,
      });
    }
  }
);

// Multer setup for Land images
const landStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/lands"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});
const landUpload = multer({ storage: landStorage });

app.use(
  "/uploads/lands",
  express.static(path.join(process.cwd(), "uploads/lands"))
);

app.post(
  "/api/lands/upload-image",
  ensureAdmin,
  landUpload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: `/uploads/lands/${req.file.filename}` });
  }
);

// TEMPLES API ROUTES
app.get("/api/temples", async (req, res) => {
  try {
    const temples = await Temple.find().sort({ createdAt: -1 });
    res.json(temples);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch temples" });
  }
});

app.get("/api/temples/:id", async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id).populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    if (!temple) return res.status(404).json({ error: "Temple not found" });

    // If a user is logged in, check if they've liked the article
    let userLiked = false;
    if (req.user) {
      userLiked = temple.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }

    res.json({
      ...temple.toObject(),
      likes: temple.likes.length,
      userLiked,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch temple" });
  }
});

app.post("/api/temples", ensureAdmin, async (req, res) => {
  try {
    const temple = new Temple(req.body);
    await temple.save();
    res.status(201).json(temple);
  } catch (err) {
    res.status(500).json({ error: "Failed to create temple" });
  }
});

app.put("/api/temples/:id", ensureAdmin, async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!temple) return res.status(404).json({ error: "Temple not found" });
    res.json(temple);
  } catch (err) {
    res.status(500).json({ error: "Failed to update temple" });
  }
});

app.delete("/api/temples/:id", ensureAdmin, async (req, res) => {
  try {
    const temple = await Temple.findByIdAndDelete(req.params.id);
    if (!temple) return res.status(404).json({ error: "Temple not found" });
    res.json({ message: "Temple deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete temple" });
  }
});

// KINGS API ROUTES
app.get("/api/kings", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const kings = await King.find().sort({ createdAt: -1 });
    res.json(localizeCollection(kings, 'kings', lang));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch kings" });
  }
});

app.get("/api/kings/:id", async (req, res) => {
  try {
    const king = await King.findById(req.params.id).populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    if (!king) {
      return res.status(404).json({ error: "King not found" });
    }

    // If a user is logged in, check if they've liked the article
    let userLiked = false;
    if (req.user) {
      userLiked = king.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }

    res.json({
      ...king.toObject(),
      likes: king.likes.length,
      userLiked,
    });
  } catch (err) {
    console.error("Fetch king error:", err);
    res.status(500).json({ error: "Failed to fetch king" });
  }
});

app.post("/api/kings", ensureAdmin, async (req, res) => {
  try {
    const king = new King(req.body);
    await king.save();
    res.status(201).json(king);
  } catch (err) {
    res.status(500).json({ error: "Failed to create king" });
  }
});

app.put("/api/kings/:id", ensureAdmin, async (req, res) => {
  try {
    const king = await King.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!king) {
      return res.status(404).json({ error: "King not found" });
    }

    res.json(king);
  } catch (err) {
    console.error("Error updating king:", err);
    res.status(500).json({
      error: "Failed to update king",
      details: err.message,
    });
  }
});

app.delete("/api/kings/:id", ensureAdmin, async (req, res) => {
  try {
    const king = await King.findByIdAndDelete(req.params.id);
    if (!king) return res.status(404).json({ error: "King not found" });
    res.json({ message: "King deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete king" });
  }
});

// Like a king's article
app.post("/api/kings/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const king = await King.findById(req.params.id);
    if (!king) {
      return res.status(404).json({ error: "King not found" });
    }

    const userLikeIndex = king.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    if (userLikeIndex > -1) {
      // User already liked, so unlike
      king.likes.splice(userLikeIndex, 1);
    } else {
      // User hasn't liked, so like
      king.likes.push(req.user._id);
    }

    await king.save();

    res.json({
      likes: king.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

// Add a comment to a king's article
app.post("/api/kings/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const king = await King.findById(req.params.id);
    if (!king) {
      return res.status(404).json({ error: "King not found" });
    }

    const newComment = {
      user: req.user._id,
      content: req.body.content,
      createdAt: new Date(),
    };

    king.comments.push(newComment);
    await king.save();

    // Populate the comments with user details
    await king.populate("comments.user", "displayName");

    res.status(201).json({
      comments: king.comments,
    });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Remove a comment (admin only)
app.delete(
  "/api/kings/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const king = await King.findById(req.params.id);
      if (!king) {
        return res.status(404).json({ error: "King not found" });
      }

      // Remove the comment
      king.comments = king.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await king.save();

      // Populate the comments with user details
      await king.populate("comments.user", "displayName");

      res.json({
        comments: king.comments,
      });
    } catch (err) {
      console.error("Remove comment error:", err);
      res.status(500).json({ error: "Failed to remove comment" });
    }
  }
);

// Add a reply to a specific comment
app.post(
  "/api/kings/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const king = await King.findById(req.params.id);
      if (!king) {
        return res.status(404).json({ error: "King not found" });
      }

      // Find the specific comment
      const comment = king.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Create new reply
      const newReply = {
        user: req.user._id,
        content: req.body.content,
        createdAt: new Date(),
      };

      // Add reply to the comment
      comment.replies.push(newReply);
      await king.save();

      // Populate user details for the comment and its replies
      await king.populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);

      // Find the updated comment to return
      const updatedComment = king.comments.id(req.params.commentId);

      res.status(201).json({
        comment: updatedComment,
      });
    } catch (err) {
      console.error("Reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

// Remove a reply from a comment (admin only)
app.delete(
  "/api/kings/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const king = await King.findById(req.params.id);
      if (!king) {
        return res.status(404).json({ error: "King not found" });
      }

      // Find the specific comment
      const comment = king.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Remove the specific reply
      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await king.save();

      // Populate user details for the comment and its replies
      await king.populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);

      // Find the updated comment to return
      const updatedComment = king.comments.id(req.params.commentId);

      res.json({
        comment: updatedComment,
      });
    } catch (err) {
      console.error("Remove reply error:", err);
      res.status(500).json({ error: "Failed to remove reply" });
    }
  }
);

// LITERATURE API ROUTES
app.get("/api/literature", async (req, res) => {
  try {
    const literature = await Literature.find().sort({ createdAt: -1 });
    res.json(literature);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch literature" });
  }
});

app.get("/api/literature/:id", async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id).populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    if (!literature)
      return res.status(404).json({ error: "Literature not found" });

    // If a user is logged in, check if they've liked the article
    let userLiked = false;
    if (req.user) {
      userLiked = literature.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }

    res.json({
      ...literature.toObject(),
      likes: literature.likes.length,
      userLiked,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch literature" });
  }
});

app.post("/api/literature", ensureAdmin, async (req, res) => {
  try {
    const literature = new Literature(req.body);
    await literature.save();
    res.status(201).json(literature);
  } catch (err) {
    res.status(500).json({ error: "Failed to create literature" });
  }
});

app.put("/api/literature/:id", ensureAdmin, async (req, res) => {
  try {
    const literature = await Literature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!literature)
      return res.status(404).json({ error: "Literature not found" });
    res.json(literature);
  } catch (err) {
    res.status(500).json({ error: "Failed to update literature" });
  }
});

app.delete("/api/literature/:id", ensureAdmin, async (req, res) => {
  try {
    const literature = await Literature.findByIdAndDelete(req.params.id);
    if (!literature)
      return res.status(404).json({ error: "Literature not found" });
    res.json({ message: "Literature deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete literature" });
  }
});

// DANCE API ROUTES
app.get("/api/dance", async (req, res) => {
  try {
    const dance = await Dance.find().sort({ createdAt: -1 });
    res.json(dance);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dance" });
  }
});

app.get("/api/dance/:id", async (req, res) => {
  try {
    const dance = await Dance.findById(req.params.id).populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    if (!dance) return res.status(404).json({ error: "Dance not found" });

    // If a user is logged in, check if they've liked the article
    let userLiked = false;
    if (req.user) {
      userLiked = dance.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }

    res.json({
      ...dance.toObject(),
      likes: dance.likes.length,
      userLiked,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dance" });
  }
});

app.post("/api/dance", ensureAdmin, async (req, res) => {
  try {
    const dance = new Dance(req.body);
    await dance.save();
    res.status(201).json(dance);
  } catch (err) {
    res.status(500).json({ error: "Failed to create dance" });
  }
});

app.put("/api/dance/:id", ensureAdmin, async (req, res) => {
  try {
    const dance = await Dance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!dance) return res.status(404).json({ error: "Dance not found" });
    res.json(dance);
  } catch (err) {
    res.status(500).json({ error: "Failed to update dance" });
  }
});

app.delete("/api/dance/:id", ensureAdmin, async (req, res) => {
  try {
    const dance = await Dance.findByIdAndDelete(req.params.id);
    if (!dance) return res.status(404).json({ error: "Dance not found" });
    res.json({ message: "Dance deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete dance" });
  }
});

// Like a dance
app.post("/api/dance/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const dance = await Dance.findById(req.params.id);
    if (!dance) {
      return res.status(404).json({ error: "Dance not found" });
    }

    const userLikeIndex = dance.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    if (userLikeIndex > -1) {
      // User already liked, so unlike
      dance.likes.splice(userLikeIndex, 1);
    } else {
      // User hasn't liked, so like
      dance.likes.push(req.user._id);
    }

    await dance.save();

    res.json({
      likes: dance.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

// Add a comment to a dance
app.post("/api/dance/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const dance = await Dance.findById(req.params.id);
    if (!dance) {
      return res.status(404).json({ error: "Dance not found" });
    }

    const newComment = {
      user: req.user._id,
      content: req.body.content,
      createdAt: new Date(),
    };

    dance.comments.push(newComment);
    await dance.save();

    // Populate the comments with user details
    await dance.populate("comments.user", "displayName");

    res.status(201).json({
      comments: dance.comments,
    });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Add a reply to a specific comment
app.post(
  "/api/dance/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const dance = await Dance.findById(req.params.id);
      if (!dance) {
        return res.status(404).json({ error: "Dance not found" });
      }

      // Find the specific comment
      const comment = dance.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Create new reply
      const newReply = {
        user: req.user._id,
        content: req.body.content,
        createdAt: new Date(),
      };

      // Add reply to the comment
      comment.replies.push(newReply);
      await dance.save();

      // Populate user details for the comment and its replies
      await dance.populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);

      // Find the updated comment to return
      const updatedComment = dance.comments.id(req.params.commentId);

      res.status(201).json({
        comment: updatedComment,
      });
    } catch (err) {
      console.error("Reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

// Remove a comment (admin only)
app.delete(
  "/api/dance/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const dance = await Dance.findById(req.params.id);
      if (!dance) {
        return res.status(404).json({ error: "Dance not found" });
      }

      // Remove the comment
      dance.comments = dance.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await dance.save();

      // Populate the comments with user details
      await dance.populate("comments.user", "displayName");

      res.json({
        comments: dance.comments,
      });
    } catch (err) {
      console.error("Remove comment error:", err);
      res.status(500).json({ error: "Failed to remove comment" });
    }
  }
);

// Remove a reply from a comment (admin only)
app.delete(
  "/api/dance/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const dance = await Dance.findById(req.params.id);
      if (!dance) {
        return res.status(404).json({ error: "Dance not found" });
      }

      // Find the specific comment
      const comment = dance.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Remove the specific reply
      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await dance.save();

      // Populate user details for the comment and its replies
      await dance.populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);

      // Find the updated comment to return
      const updatedComment = dance.comments.id(req.params.commentId);

      res.json({
        comment: updatedComment,
      });
    } catch (err) {
      console.error("Remove reply error:", err);
      res.status(500).json({ error: "Failed to remove reply" });
    }
  }
);

// FOODS API ROUTES
app.get("/api/foods", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(localizeCollection(foods, 'foods', lang));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch foods" });
  }
});

app.get("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    if (!food) return res.status(404).json({ error: "Food not found" });

    // If a user is logged in, check if they've liked the article
    let userLiked = false;
    if (req.user) {
      userLiked = food.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }

    res.json({
      ...food.toObject(),
      likes: food.likes.length,
      userLiked,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch food" });
  }
});

app.post("/api/foods", ensureAdmin, async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ error: "Failed to create food" });
  }
});

app.put("/api/foods/:id", ensureAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) return res.status(404).json({ error: "Food not found" });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: "Failed to update food" });
  }
});

app.delete("/api/foods/:id", ensureAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ error: "Food not found" });
    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete food" });
  }
});

// FESTIVALS API ROUTES
app.get("/api/festivals", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const festivals = await Festival.find().sort({ createdAt: -1 });
    res.json(localizeCollection(festivals, 'festivals', lang));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch festivals" });
  }
});

app.get("/api/festivals/:id", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const festival = await Festival.findById(req.params.id).populate([
      { path: "comments.user", select: "displayName" },
      { path: "comments.replies.user", select: "displayName" },
    ]);
    if (!festival) return res.status(404).json({ error: "Festival not found" });
    let userLiked = false;
    if (req.user) {
      userLiked = festival.likes.some(likeId => likeId.toString() === req.user._id.toString());
    }
    const base = { ...festival.toObject(), likes: festival.likes.length, userLiked };
    res.json(localizeSingle(base, 'festivals', lang));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch festival" });
  }
});

app.post("/api/festivals", ensureAdmin, async (req, res) => {
  try {
    const festival = new Festival(req.body);
    await festival.save();
    res.status(201).json(festival);
  } catch (err) {
    res.status(500).json({ error: "Failed to create festival" });
  }
});

app.put("/api/festivals/:id", ensureAdmin, async (req, res) => {
  try {
    const festival = await Festival.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!festival) return res.status(404).json({ error: "Festival not found" });
    res.json(festival);
  } catch (err) {
    res.status(500).json({ error: "Failed to update festival" });
  }
});

app.delete("/api/festivals/:id", ensureAdmin, async (req, res) => {
  try {
    const festival = await Festival.findByIdAndDelete(req.params.id);
    if (!festival) return res.status(404).json({ error: "Festival not found" });
    res.json({ message: "Festival deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete festival" });
  }
});

// Ancient Science routes
app.get("/api/ancientscience", async (req, res) => {
  const sciences = await AncientScience.find();
  res.json(sciences);
});

app.get("/api/ancientscience/:id", async (req, res) => {
  try {
    const science = await AncientScience.findById(req.params.id).populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    if (!science)
      return res
        .status(404)
        .json({ error: "Ancient Science detail not found" });

    // If a user is logged in, check if they've liked the article
    let userLiked = false;
    if (req.user) {
      userLiked = science.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }

    res.json({
      ...science.toObject(),
      userLiked,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/ancientscience", ensureAdmin, async (req, res) => {
  try {
    const science = await AncientScience.create(req.body);
    res.status(201).json(science);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/ancientscience/:id", ensureAdmin, async (req, res) => {
  try {
    const science = await AncientScience.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!science)
      return res
        .status(404)
        .json({ error: "Ancient Science detail not found" });
    res.json(science);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/ancientscience/:id", ensureAdmin, async (req, res) => {
  try {
    const science = await AncientScience.findByIdAndDelete(req.params.id);
    if (!science)
      return res
        .status(404)
        .json({ error: "Ancient Science detail not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Clothing routes (CRUD + likes + comments + replies + reactions)
app.get("/api/clothing", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const items = await Clothing.find().sort({ createdAt: -1 });
    // Optional localization: mirror other entities using localizeCollection if categories defined
    // For now, return raw bilingual docs
    res.json(items);
  } catch (err) {
    console.error("Clothing list error", err);
    res.status(500).json({ error: "Failed to fetch clothing list" });
  }
});

app.get("/api/clothing/:id", async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id).populate([
      { path: "comments.user", select: "displayName" },
      { path: "comments.replies.user", select: "displayName" },
    ]);
    if (!item) return res.status(404).json({ error: "Clothing not found" });
    let userLiked = false;
    if (req.user) {
      userLiked = item.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    }
    res.json({ ...item.toObject(), likes: item.likes.length, userLiked });
  } catch (err) {
    console.error("Clothing get error", err);
    res.status(500).json({ error: "Failed to fetch clothing item" });
  }
});

app.post("/api/clothing", ensureAdmin, async (req, res) => {
  try {
    const item = new Clothing(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error("Clothing create error", err);
    res.status(500).json({ error: "Failed to create clothing" });
  }
});

app.put("/api/clothing/:id", ensureAdmin, async (req, res) => {
  try {
    const updated = await Clothing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Clothing not found" });
    res.json(updated);
  } catch (err) {
    console.error("Clothing update error", err);
    res.status(500).json({ error: "Failed to update clothing" });
  }
});

app.delete("/api/clothing/:id", ensureAdmin, async (req, res) => {
  try {
    const deleted = await Clothing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Clothing not found" });
    res.json({ message: "Clothing deleted successfully" });
  } catch (err) {
    console.error("Clothing delete error", err);
    res.status(500).json({ error: "Failed to delete clothing" });
  }
});

// Like toggle
app.post("/api/clothing/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Clothing not found" });
    const idx = item.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );
    if (idx > -1) {
      item.likes.splice(idx, 1);
    } else {
      item.likes.push(req.user._id);
    }
    await item.save();
    res.json({ likes: item.likes.length, userLiked: idx === -1 });
  } catch (err) {
    console.error("Clothing like error", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

// Comments
app.post("/api/clothing/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Clothing not found" });
    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ error: "Comment content required" });
    }
    const comment = { user: req.user._id, content: req.body.content.trim() };
    item.comments.push(comment);
    await item.save();
    const populated = await Clothing.findById(req.params.id).populate(
      "comments.user",
      "displayName"
    );
    res.json({ comments: populated.comments });
  } catch (err) {
    console.error("Clothing comment error", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.delete(
  "/api/clothing/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const item = await Clothing.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Clothing not found" });
      item.comments = item.comments.filter(
        (c) => c._id.toString() !== req.params.commentId
      );
      await item.save();
      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error("Clothing delete comment error", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

// Replies
app.post(
  "/api/clothing/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const item = await Clothing.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Clothing not found" });
      const comment = item.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });
      if (!req.body.content || !req.body.content.trim()) {
        return res.status(400).json({ error: "Reply content required" });
      }
      comment.replies.push({ user: req.user._id, content: req.body.content.trim() });
      await item.save();
      const populated = await Clothing.findById(req.params.id).populate(
        "comments.user comments.replies.user",
        "displayName"
      );
      const updatedComment = populated.comments.id(req.params.commentId);
      res.json({ comment: updatedComment });
    } catch (err) {
      console.error("Clothing reply error", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/clothing/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const item = await Clothing.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Clothing not found" });
      const comment = item.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });
      comment.replies = comment.replies.filter(
        (r) => r._id.toString() !== req.params.replyId
      );
      await item.save();
      res.json({ message: "Reply deleted" });
    } catch (err) {
      console.error("Clothing delete reply error", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Reactions on comments
app.post(
  "/api/clothing/:id/comments/:commentId/reactions",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const { emoji } = req.body;
      if (!emoji) return res.status(400).json({ error: "Emoji required" });
      const item = await Clothing.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Clothing not found" });
      const comment = item.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });
      const existing = comment.reactions.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (existing) {
        existing.emoji = emoji; // update reaction
      } else {
        comment.reactions.push({ user: req.user._id, emoji });
      }
      await item.save();
      res.json({ reactions: comment.reactions });
    } catch (err) {
      console.error("Clothing reaction error", err);
      res.status(500).json({ error: "Failed to add reaction" });
    }
  }
);

// ===== LIKE AND COMMENT ROUTES FOR ALL COMPONENTS =====

// Temple likes and comments
app.post("/api/temples/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ error: "Temple not found" });
    }

    const userLikeIndex = temple.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    if (userLikeIndex > -1) {
      temple.likes.splice(userLikeIndex, 1);
    } else {
      temple.likes.push(req.user._id);
    }

    await temple.save();

    res.json({
      likes: temple.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Temple like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

app.post("/api/temples/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ error: "Temple not found" });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content,
    };

    temple.comments.push(comment);
    await temple.save();

    // Populate user info for the new comment
    const populatedTemple = await Temple.findById(req.params.id).populate(
      "comments.user",
      "displayName email"
    );

    res.json({ comments: populatedTemple.comments });
  } catch (err) {
    console.error("Temple comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.delete(
  "/api/temples/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const temple = await Temple.findById(req.params.id);
      if (!temple) {
        return res.status(404).json({ error: "Temple not found" });
      }

      temple.comments = temple.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await temple.save();
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete temple comment error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

app.post(
  "/api/temples/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const temple = await Temple.findById(req.params.id);
      if (!temple) {
        return res.status(404).json({ error: "Temple not found" });
      }

      const comment = temple.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      };

      comment.replies.push(reply);
      await temple.save();

      // Populate user info for the updated comment
      const populatedTemple = await Temple.findById(req.params.id).populate(
        "comments.user comments.replies.user",
        "displayName email"
      );
      const updatedComment = populatedTemple.comments.id(req.params.commentId);

      res.json({ comment: updatedComment });
    } catch (err) {
      console.error("Temple reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/temples/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const temple = await Temple.findById(req.params.id);
      if (!temple) {
        return res.status(404).json({ error: "Temple not found" });
      }

      const comment = temple.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await temple.save();
      res.json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Delete temple reply error:", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Literature likes and comments
app.post("/api/literature/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const literature = await Literature.findById(req.params.id);
    if (!literature) {
      return res.status(404).json({ error: "Literature not found" });
    }

    const userLikeIndex = literature.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    if (userLikeIndex > -1) {
      literature.likes.splice(userLikeIndex, 1);
    } else {
      literature.likes.push(req.user._id);
    }

    await literature.save();

    res.json({
      likes: literature.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Literature like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

app.post(
  "/api/literature/:id/comments",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const literature = await Literature.findById(req.params.id);
      if (!literature) {
        return res.status(404).json({ error: "Literature not found" });
      }

      const comment = {
        user: req.user._id,
        content: req.body.content,
      };

      literature.comments.push(comment);
      await literature.save();

      const populatedLiterature = await Literature.findById(
        req.params.id
      ).populate("comments.user", "displayName email");

      res.json({ comments: populatedLiterature.comments });
    } catch (err) {
      console.error("Literature comment error:", err);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);

app.delete(
  "/api/literature/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const literature = await Literature.findById(req.params.id);
      if (!literature) {
        return res.status(404).json({ error: "Literature not found" });
      }

      literature.comments = literature.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await literature.save();
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete literature comment error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

app.post(
  "/api/literature/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const literature = await Literature.findById(req.params.id);
      if (!literature) {
        return res.status(404).json({ error: "Literature not found" });
      }

      const comment = literature.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      };

      comment.replies.push(reply);
      await literature.save();

      const populatedLiterature = await Literature.findById(
        req.params.id
      ).populate("comments.user comments.replies.user", "displayName email");
      const updatedComment = populatedLiterature.comments.id(
        req.params.commentId
      );

      res.json({ comment: updatedComment });
    } catch (err) {
      console.error("Literature reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/literature/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const literature = await Literature.findById(req.params.id);
      if (!literature) {
        return res.status(404).json({ error: "Literature not found" });
      }

      const comment = literature.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await literature.save();
      res.json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Delete literature reply error:", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Festival likes and comments
app.post("/api/festivals/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ error: "Festival not found" });
    }

    const userLikeIndex = festival.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    if (userLikeIndex > -1) {
      festival.likes.splice(userLikeIndex, 1);
    } else {
      festival.likes.push(req.user._id);
    }

    await festival.save();

    res.json({
      likes: festival.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Festival like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

app.post(
  "/api/festivals/:id/comments",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const festival = await Festival.findById(req.params.id);
      if (!festival) {
        return res.status(404).json({ error: "Festival not found" });
      }

      const comment = {
        user: req.user._id,
        content: req.body.content,
      };

      festival.comments.push(comment);
      await festival.save();

      const populatedFestival = await Festival.findById(req.params.id).populate(
        "comments.user",
        "displayName email"
      );

      res.json({ comments: populatedFestival.comments });
    } catch (err) {
      console.error("Festival comment error:", err);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);

app.delete(
  "/api/festivals/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const festival = await Festival.findById(req.params.id);
      if (!festival) {
        return res.status(404).json({ error: "Festival not found" });
      }

      festival.comments = festival.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await festival.save();
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete festival comment error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

app.post(
  "/api/festivals/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const festival = await Festival.findById(req.params.id);
      if (!festival) {
        return res.status(404).json({ error: "Festival not found" });
      }

      const comment = festival.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      };

      comment.replies.push(reply);
      await festival.save();

      const populatedFestival = await Festival.findById(req.params.id).populate(
        "comments.user comments.replies.user",
        "displayName email"
      );
      const updatedComment = populatedFestival.comments.id(
        req.params.commentId
      );

      res.json({ comment: updatedComment });
    } catch (err) {
      console.error("Festival reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/festivals/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const festival = await Festival.findById(req.params.id);
      if (!festival) {
        return res.status(404).json({ error: "Festival not found" });
      }

      const comment = festival.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await festival.save();
      res.json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Delete festival reply error:", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Food likes and comments
app.post("/api/foods/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }

    const userLikeIndex = food.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    if (userLikeIndex > -1) {
      food.likes.splice(userLikeIndex, 1);
    } else {
      food.likes.push(req.user._id);
    }

    await food.save();

    res.json({
      likes: food.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Food like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

app.post("/api/foods/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content,
    };

    food.comments.push(comment);
    await food.save();

    const populatedFood = await Food.findById(req.params.id).populate(
      "comments.user",
      "displayName email"
    );

    res.json({ comments: populatedFood.comments });
  } catch (err) {
    console.error("Food comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.delete(
  "/api/foods/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) {
        return res.status(404).json({ error: "Food not found" });
      }

      food.comments = food.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await food.save();
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete food comment error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

app.post(
  "/api/foods/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) {
        return res.status(404).json({ error: "Food not found" });
      }

      const comment = food.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      };

      comment.replies.push(reply);
      await food.save();

      const populatedFood = await Food.findById(req.params.id).populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);

      res.json({ comments: populatedFood.comments });
    } catch (err) {
      console.error("Food reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/foods/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) {
        return res.status(404).json({ error: "Food not found" });
      }

      const comment = food.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await food.save();
      res.json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Delete food reply error:", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Clothing likes and comments
app.post("/api/clothing/:id/like", ensureAuthenticated, async (req, res) => {
  console.log("=== CLOTHING LIKE DEBUG ===");
  console.log("Request params:", req.params);
  console.log("Request user:", req.user);
  console.log("Request body:", req.body);

  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      console.log("Clothing not found");
      return res.status(404).json({ error: "Clothing not found" });
    }

    console.log("Found clothing:", clothing.name);
    console.log("Current likes:", clothing.likes);

    const userLikeIndex = clothing.likes.findIndex(
      (likeId) => likeId.toString() === req.user._id.toString()
    );

    console.log("User like index:", userLikeIndex);

    if (userLikeIndex > -1) {
      clothing.likes.splice(userLikeIndex, 1);
      console.log("Removed like");
    } else {
      clothing.likes.push(req.user._id);
      console.log("Added like");
    }

    await clothing.save();
    console.log("Saved clothing with likes:", clothing.likes.length);

    res.json({
      likes: clothing.likes.length,
      userLiked: userLikeIndex === -1,
    });
  } catch (err) {
    console.error("Clothing like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

app.post(
  "/api/clothing/:id/comments",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const clothing = await Clothing.findById(req.params.id);
      if (!clothing) {
        return res.status(404).json({ error: "Clothing not found" });
      }

      const comment = {
        user: req.user._id,
        content: req.body.content,
      };

      clothing.comments.push(comment);
      await clothing.save();

      const populatedClothing = await Clothing.findById(req.params.id).populate(
        "comments.user",
        "displayName email"
      );

      res.json({ comments: populatedClothing.comments });
    } catch (err) {
      console.error("Clothing comment error:", err);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);

app.delete(
  "/api/clothing/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const clothing = await Clothing.findById(req.params.id);
      if (!clothing) {
        return res.status(404).json({ error: "Clothing not found" });
      }

      clothing.comments = clothing.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await clothing.save();
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete clothing comment error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

app.post(
  "/api/clothing/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const clothing = await Clothing.findById(req.params.id);
      if (!clothing) {
        return res.status(404).json({ error: "Clothing not found" });
      }

      const comment = clothing.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      };

      comment.replies.push(reply);
      await clothing.save();

      const populatedClothing = await Clothing.findById(req.params.id).populate(
        [
          {
            path: "comments.user",
            select: "displayName",
          },
          {
            path: "comments.replies.user",
            select: "displayName",
          },
        ]
      );

      res.json({ comments: populatedClothing.comments });
    } catch (err) {
      console.error("Clothing reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/clothing/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const clothing = await Clothing.findById(req.params.id);
      if (!clothing) {
        return res.status(404).json({ error: "Clothing not found" });
      }

      const comment = clothing.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await clothing.save();
      res.json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Delete clothing reply error:", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Ancient Science likes and comments
app.post(
  "/api/ancientscience/:id/like",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const science = await AncientScience.findById(req.params.id);
      if (!science) {
        return res.status(404).json({ error: "Ancient Science not found" });
      }

      const userLikeIndex = science.likes.findIndex(
        (likeId) => likeId.toString() === req.user._id.toString()
      );

      if (userLikeIndex > -1) {
        science.likes.splice(userLikeIndex, 1);
      } else {
        science.likes.push(req.user._id);
      }

      await science.save();

      res.json({
        likes: science.likes.length,
        userLiked: userLikeIndex === -1,
      });
    } catch (err) {
      console.error("Ancient Science like error:", err);
      res.status(500).json({ error: "Failed to process like" });
    }
  }
);

app.post(
  "/api/ancientscience/:id/comments",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const science = await AncientScience.findById(req.params.id);
      if (!science) {
        return res.status(404).json({ error: "Ancient Science not found" });
      }

      const comment = {
        user: req.user._id,
        content: req.body.content,
      };

      science.comments.push(comment);
      await science.save();

      const populatedScience = await AncientScience.findById(
        req.params.id
      ).populate("comments.user", "displayName email");

      res.json({ comments: populatedScience.comments });
    } catch (err) {
      console.error("Ancient Science comment error:", err);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);

app.delete(
  "/api/ancientscience/:id/comments/:commentId",
  ensureAdmin,
  async (req, res) => {
    try {
      const science = await AncientScience.findById(req.params.id);
      if (!science) {
        return res.status(404).json({ error: "Ancient Science not found" });
      }

      science.comments = science.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );

      await science.save();
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Delete ancient science comment error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

app.post(
  "/api/ancientscience/:id/comments/:commentId/replies",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const science = await AncientScience.findById(req.params.id);
      if (!science) {
        return res.status(404).json({ error: "Ancient Science not found" });
      }

      const comment = science.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      };

      comment.replies.push(reply);
      await science.save();

      const populatedScience = await AncientScience.findById(
        req.params.id
      ).populate("comments.user comments.replies.user", "displayName email");
      const updatedComment = populatedScience.comments.id(req.params.commentId);

      res.json({ comment: updatedComment });
    } catch (err) {
      console.error("Ancient Science reply error:", err);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);

app.delete(
  "/api/ancientscience/:id/comments/:commentId/replies/:replyId",
  ensureAdmin,
  async (req, res) => {
    try {
      const science = await AncientScience.findById(req.params.id);
      if (!science) {
        return res.status(404).json({ error: "Ancient Science not found" });
      }

      const comment = science.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== req.params.replyId
      );

      await science.save();
      res.json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Delete ancient science reply error:", err);
      res.status(500).json({ error: "Failed to delete reply" });
    }
  }
);

// Serve uploaded files statically so the client can load /uploads/gallery/* URLs
app.use(
  "/uploads/gallery",
  express.static(path.join(process.cwd(), "uploads/gallery"))
);

// If a client build exists, serve it as static files and provide an SPA fallback.
const clientDist = path.join(process.cwd(), "..", "client", "dist");
const clientIndex = path.join(clientDist, "index.html");
if (fs.existsSync(clientIndex)) {
  console.log("Client build detected at:", clientDist, "— serving static client from Express.");
  app.use(express.static(clientDist));

  // Catch-all: return client index for unknown routes (SPA fallback).
  app.get('*', (req, res) => {
    // Allow API and uploads routes to function normally (they are defined above),
    // but if nothing matches, send the client index.html so the SPA router can handle it.
    res.sendFile(clientIndex);
  });
} else {
  console.log("No client build found at:", clientIndex);
}

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
});
