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

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/failure`,
    session: true,
  }),
  (req, res) => {
    console.log("OAuth callback success, redirecting to client...");
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/google/callback`);
  }
);

app.get("/auth/user", (req, res) => {
  res.send(req.user || null);
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  });
});

app.get("/auth/failure", (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/failure`);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
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
  const articles = await Article.find();
  res.json(articles);
});
app.get("/api/articles/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  res.json(article);
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
  const gallery = await Gallery.find();
  res.json(gallery);
});
app.get("/api/gallery/:id", async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Gallery item not found" });
    res.json(item);
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
  const events = await Event.find();
  res.json(events);
});
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
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
  const resources = await Resource.find();
  res.json(resources);
});
app.get("/api/resources/:id", async (req, res) => {
  try {
    console.log("GET /api/resources/:id", req.params.id);
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      console.error("Resource not found", req.params.id);
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json(resource);
  } catch (err) {
    console.error("Error fetching resource", err);
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
  const lands = await Land.find();
  res.json(lands);
});
app.get("/api/lands/:id", async (req, res) => {
  const land = await Land.findById(req.params.id);
  res.json(land);
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

// General image upload storage
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/gallery"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-image" + ext);
  },
});

// General video upload storage
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/gallery"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-video" + ext);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image file!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
});

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Not a video file!"), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

// Serve uploaded files
app.use(
  "/uploads/gallery",
  express.static(path.join(process.cwd(), "uploads/gallery"))
);

// General image upload endpoint
app.post(
  "/api/upload/image",
  ensureAdmin,
  imageUpload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }
      res.json({ imageUrl: `/uploads/gallery/${req.file.filename}` });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// General video upload endpoint
app.post(
  "/api/upload/video",
  ensureAdmin,
  videoUpload.single("video"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
      }
      res.json({ videoUrl: `/uploads/gallery/${req.file.filename}` });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({ error: "Failed to upload video" });
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
    const temple = await Temple.findById(req.params.id);
    if (!temple) return res.status(404).json({ error: "Temple not found" });
    res.json(temple);
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
    const kings = await King.find().sort({ createdAt: -1 });
    res.json(kings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch kings" });
  }
});

app.get("/api/kings/:id", async (req, res) => {
  try {
    const king = await King.findById(req.params.id);
    if (!king) return res.status(404).json({ error: "King not found" });
    res.json(king);
  } catch (err) {
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
    });
    if (!king) return res.status(404).json({ error: "King not found" });
    res.json(king);
  } catch (err) {
    res.status(500).json({ error: "Failed to update king" });
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
    const literature = await Literature.findById(req.params.id);
    if (!literature)
      return res.status(404).json({ error: "Literature not found" });
    res.json(literature);
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
      { new: true }
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
    const dance = await Dance.findById(req.params.id);
    if (!dance) return res.status(404).json({ error: "Dance not found" });
    res.json(dance);
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

// FOODS API ROUTES
app.get("/api/foods", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch foods" });
  }
});

app.get("/api/foods/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ error: "Food not found" });
    res.json(food);
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
    const festivals = await Festival.find().sort({ createdAt: -1 });
    res.json(festivals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch festivals" });
  }
});

app.get("/api/festivals/:id", async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) return res.status(404).json({ error: "Festival not found" });
    res.json(festival);
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
    const science = await AncientScience.findById(req.params.id);
    if (!science)
      return res
        .status(404)
        .json({ error: "Ancient Science detail not found" });
    res.json(science);
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

// Clothing routes
app.get("/api/clothing", async (req, res) => {
  try {
    const clothing = await Clothing.find();
    res.json(clothing);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/clothing", async (req, res) => {
  try {
    const newClothing = new Clothing(req.body);
    await newClothing.save();
    res.status(201).json(newClothing);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/clothing/:id", async (req, res) => {
  try {
    console.log("Fetching clothing with ID:", req.params.id); // Debugging
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      console.log("Clothing not found for ID:", req.params.id); // Debugging
      return res.status(404).json({ error: "Clothing not found" });
    }
    res.json(clothing);
  } catch (err) {
    console.error("Error fetching clothing:", err); // Debugging
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/clothing/:id", async (req, res) => {
  try {
    const updatedClothing = await Clothing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClothing)
      return res.status(404).json({ error: "Clothing not found" });
    res.json(updatedClothing);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/clothing/:id", async (req, res) => {
  try {
    const deletedClothing = await Clothing.findByIdAndDelete(req.params.id);
    if (!deletedClothing)
      return res.status(404).json({ error: "Clothing not found" });
    res.json(deletedClothing);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
