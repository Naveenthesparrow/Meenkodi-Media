import express from "express";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import mongoose from "mongoose";
import Article from "./models/Article.js";
import Gallery from "./models/Gallery.js";
import ResearchFolder from "./models/ResearchFolder.js";
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
// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";
import AncientScience from "./models/AncientScience.js";
import Clothing from "./models/Clothing.js";
import Dynasty from "./models/Dynasty.js";
import Poet from "./models/Poet.js";
import Director from "./models/Director.js";
import { localizeCollection, localizeSingle, resolveLang } from './translationMap.js';
import researchRoutes from './routes/research.js';
import directorsRoutes from './routes/directors.js';
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  buildPageHtml,
  buildHomeBodyHtml,
  buildArticlesBodyHtml,
  buildArticleDetailBodyHtml,
  buildGalleryBodyHtml,
  buildGalleryDetailBodyHtml,
  buildEventsBodyHtml,
  buildEventDetailBodyHtml,
  buildExploreBodyHtml,
  buildDetailBodyHtml,
  metaDescription,
  breadcrumbLd,
  articleLd,
  imageGalleryLd,
  collectionLd,
} from './prerender.js';
import { bilingualName, byLanguage } from './utils/text.js';
import { slugify } from './utils/slug.js';
import { generateAllSitemaps } from './scripts/generate-sitemap.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Express 4 doesn't catch errors thrown by async route handlers, and an
// unhandled rejection exits Node (e.g. GET /api/articles/abc -> CastError ->
// whole server down). Route every handler's rejected promise to next(err),
// which the error handler near app.listen turns into a JSON response.
const forwardAsyncErrors = (fn) => {
  // Leave error middleware (4 args) and mounted sub-apps/routers untouched
  if (typeof fn !== 'function' || fn.length > 3 || fn.handle) return fn;
  return function (req, res, next) {
    const result = fn.call(this, req, res, next);
    if (result && typeof result.catch === 'function') result.catch(next);
    return result;
  };
};
for (const method of ['get', 'post', 'put', 'patch', 'delete', 'all', 'use']) {
  const original = app[method].bind(app);
  app[method] = (...args) => {
    // app.get('setting') with a single argument reads a setting
    if (method === 'get' && args.length === 1) return original(...args);
    return original(...args.map((arg) => (Array.isArray(arg) ? arg.map(forwardAsyncErrors) : forwardAsyncErrors(arg))));
  };
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

app.set('trust proxy', 1);

app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://www.meenkodi.com",
  "https://meenkodi-media-fd.onrender.com",
  "https://meenkodi-media-layr.onrender.com",
  process.env.CLIENT_URL,
  process.env.BACKEND_URL
].filter(Boolean).map((o) => o.replace(/\/+$/, ''));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all localhost origins
      if (!isProduction) {
        try {
          const url = new URL(origin);
          if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return callback(null, true);
          }
        } catch (e) {
          // ignore
        }
      }

      // Allow configured origins explicitly
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // In production, allow your domains
      if (isProduction) {
        try {
          const url = new URL(origin);
          const hostname = url.hostname.toLowerCase();

          // Only our own hosts. (Any *.onrender.com was allowed before, which let
          // any site hosted on Render make logged-in requests as our users.)
          if (hostname === 'www.meenkodi.com' || hostname === 'meenkodi.com') {
            return callback(null, true);
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);


// Server-Side In-Memory Cache System for Ultra-Fast API Responses
const apiResponseCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const invalidateApiCache = (pattern) => {
  if (!pattern) {
    apiResponseCache.clear();
    return;
  }
  for (const key of apiResponseCache.keys()) {
    if (key.includes(pattern)) {
      apiResponseCache.delete(key);
    }
  }
};

app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/auth') || req.path === '/health') {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const pathParts = req.path.split('/').filter(Boolean);
      const invalidate = () => (pathParts.length > 0 ? invalidateApiCache(pathParts[0]) : invalidateApiCache());
      invalidate();
      // Invalidate again once the write has finished, so a GET that ran during
      // the write can't keep the old data cached
      res.on('finish', invalidate);
    }
    return next();
  }

  // This runs before session/passport, so login checks haven't happened yet.
  // Requests with a session cookie can return per-user or admin-only data
  // (profiles, user lists, drafts, userLiked flags): never cache or share them.
  if (/(?:^|;\s*)connect\.sid=/.test(req.headers.cookie || '')) {
    res.setHeader('Cache-Control', 'private, no-store');
    return next();
  }

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
  
  const cacheKey = `${req.originalUrl || req.url}_${req.headers['accept-language'] || ''}`;
  const cached = apiResponseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(cached.status).type(cached.contentType || 'application/json').send(cached.body);
  }

  const originalSend = res.send.bind(res);
  res.send = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      apiResponseCache.set(cacheKey, {
        body,
        status: res.statusCode,
        contentType: res.getHeader('Content-Type'),
        timestamp: Date.now()
      });
    }
    res.setHeader('X-Cache', 'MISS');
    return originalSend(body);
  };

  next();
});

// Redirect apex host to canonical www and optionally force HTTPS in production
app.use((req, res, next) => {
  try {
    const host = (req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
    // Redirect the apex domain to the canonical www host
    if (host === 'meenkodi.com') {
      return res.redirect(301, `https://www.meenkodi.com${req.originalUrl}`);
    }
    // If running in production behind a proxy, force https
    if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  } catch (e) {
    console.error('Redirect middleware error', e);
  }
  next();
});

// Health check endpoint for keep-alive services
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Serve robots.txt and sitemap.xml explicitly from the public folder (fallback + logging)
app.get('/robots.txt', (req, res) => {
  console.log('Serving robots.txt for', req.hostname, req.originalUrl);
  res.type('text/plain');
  res.sendFile(path.join(__dirname, '../client/public/robots.txt'), (err) => {
    if (err) {
      console.error('Failed to serve robots.txt', err);
      if (!res.headersSent) res.status(500).send('Server error');
    }
  });
});

// Sitemaps are generated live from the database (kept in memory for an hour),
// so new articles, Seeds folders, photos etc. reach Google without a redeploy.
const SITEMAP_TTL_MS = 60 * 60 * 1000;
const sitemapCache = { at: 0, files: null, pending: null };
function getSitemaps({ force = false } = {}) {
  if (!force && sitemapCache.files && Date.now() - sitemapCache.at < SITEMAP_TTL_MS) {
    return Promise.resolve(sitemapCache.files);
  }
  if (!sitemapCache.pending) {
    const files = {};
    sitemapCache.pending = generateAllSitemaps({ output: (name, xml) => { files[name] = xml; } })
      .then(() => {
        sitemapCache.files = files;
        sitemapCache.at = Date.now();
        return files;
      })
      .finally(() => { sitemapCache.pending = null; });
  }
  return sitemapCache.pending;
}

app.get(/^\/sitemap(-[a-z]+)?\.xml$/, async (req, res) => {
  const name = req.path.slice(1);
  try {
    const xml = (await getSitemaps())[name];
    if (!xml) return res.status(404).type('text/plain').send('Sitemap not found');
    res.type('application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error(`[Sitemap] Failed to build ${name}:`, err.message);
    res.status(503).type('text/plain').send('Sitemap temporarily unavailable');
  }
});

// Serve static files from the client build directory
// Hashed build files in /assets never change, so browsers can keep them for a year
app.use("/assets", express.static(path.join(__dirname, "../client/dist/assets"), {
  maxAge: "1y",
  immutable: true,
}));
// index: false / redirect: false so page URLs ("/", "/gallery") reach the SSR
// routes below (page-specific title and link-preview tags) instead of the
// generic index.html or a /gallery -> /gallery/ redirect.
app.use(express.static(path.join(__dirname, "../client/dist"), { index: false, redirect: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("WARNING: No MONGO_URI or MONGODB_URI environment variable found!");
} else {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.error("Server will continue running but database operations will fail");
    });
}



import MongoStore from "connect-mongo";

// Session configuration

const sessionConfig = {
  // A fixed fallback secret would let anyone forge session cookies, so use a
  // random one when SESSION_SECRET is missing (sessions then reset on restart)
  secret: process.env.SESSION_SECRET || (() => {
    console.warn('⚠️ SESSION_SECRET is not set - using a random secret; logins will reset on every restart');
    return crypto.randomBytes(32).toString('hex');
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'none' : 'lax', // 'none' is required for cross-domain API requests in production
    path: '/',
  },
  name: "connect.sid",
  proxy: isProduction,
  rolling: false,
  unset: 'keep',
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day
  }),
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

// Session debugging middleware
app.use((req, res, next) => {
  // console.log("=== SESSION MIDDLEWARE DEBUG ==="); // Reduce log noise in prod
  // console.log("Session ID:", req.sessionID);
  next();
});

const rawBackendUrl = (process.env.BACKEND_URL || "http://localhost:5000").trim().replace(/\/+$/, "").replace(/(%20|\s)+$/, "");

passport.use(
  new GoogleStrategy(
    {
      clientID: (process.env.GOOGLE_CLIENT_ID || "").trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
      callbackURL: `${rawBackendUrl}/auth/google/callback`,
      // Explicitly set the scope here as well
      scope: ["profile", "email"],
      // Pass through the scope to the authorization URL
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Strategy callback - Profile:", profile.id);
        let user = await User.findOne({ googleId: profile.id });
        const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            role: superAdminEmail && profile.emails?.[0]?.value?.toLowerCase() === superAdminEmail
              ? "superadmin"
              : "user",
          });
          console.log("Created new user:", user._id);
        } else {
          if (superAdminEmail && user.email?.toLowerCase() === superAdminEmail && user.role !== "superadmin") {
            user.role = "superadmin";
            await user.save();
          }
          console.log("Found existing user:", user._id);
        }
        return done(null, user);
      } catch (err) {
        console.error("Google Strategy error:", err);
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
    // Treat deleted or stale session users as logged out instead of turning
    // the next auth check into a server error.
    done(null, user || false);
  } catch (err) {
    console.warn("Ignoring invalid session user:", err.message);
    done(null, false);
  }
});

// Normalize and trim trailing spaces in request URLs (handles path before query string)
app.use((req, res, next) => {
  if (req.url) {
    req.url = req.url.replace(/^([^?]*?)(?:%20|\s)+(\?.*)?$/, '$1$2');
  }
  next();
});

// Auth routes
app.get(
  ["/auth/google", "/auth/google/"],
  (req, res, next) => {
    console.log("Initiating Google OAuth flow...");
    console.log("Callback URL will be:", `${rawBackendUrl}/auth/google/callback`);
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: 'offline',
    prompt: 'consent'
  })
);

app.get(
  ["/auth/google/callback", "/auth/google/callback/"],
  (req, res, next) => {
    console.log("=== OAuth Callback Received ===");
    console.log("Query params:", req.query);

    // Check if there's an error from Google
    if (req.query.error) {
      console.error("OAuth Error from Google:", req.query.error);
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/?auth=failed`
      );
    }

    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.error("=== OAuth Authentication Error ===");
        console.error("Error:", err.message || err);
        return res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:5173"}/?auth=error`
        );
      }
      if (!user) {
        console.error("=== OAuth Failed: No User ===");
        console.error("Info:", info);
        return res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:5173"}/?auth=nouser`
        );
      }

      console.log("=== OAuth Success, logging in user ===");
      req.logIn(user, (err) => {
        if (err) {
          console.error("=== Session Login Error ===");
          console.error("Error:", err);
          return res.redirect(
            `${process.env.CLIENT_URL || "http://localhost:5173"}/?auth=session-error`
          );
        }
        console.log("=== User logged in successfully ===");
        next();
      });
    })(req, res, next);
  },
  (req, res) => {
    console.log("=== OAuth callback success ===");
    console.log("Is Authenticated:", req.isAuthenticated());

    // Ensure session is saved before redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:5173"}/?auth=session-error`
        );
      }

      console.log("Session saved, redirecting to client home...");
      // Redirect to HOME, not back to auth callback!
      res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/`
      );
    });
  }
);

app.get("/auth/user", (req, res) => {
  console.log("=== AUTH USER REQUEST ===");
  console.log("Is Authenticated:", req.isAuthenticated());

  if (req.user) {
    const { _id, googleId, displayName, email, role, photo } = req.user;
    console.log("✓ Sending user data:", displayName, role);
    res.json({ _id, googleId, displayName, email, role, photo });
  } else {
    console.log("✗ No user found in request, sending 401");
    // Check if session exists but user is missing
    if (req.session && !req.user) {
    }
    res.status(401).json(null);
  }
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  });
});

// Debug endpoint to check OAuth configuration
app.get("/auth/config-check", (req, res) => {
  res.json({
    hasClientID: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    backendURL: process.env.BACKEND_URL,
    clientURL: process.env.CLIENT_URL,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get("/auth/failure", (req, res) => {
  res.redirect(
    `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/failure`
  );
});

function ensureAuthenticated(req, res, next) {
  console.log("=== ENSURE AUTHENTICATED DEBUG ===");
  console.log("Is Authenticated:", req.isAuthenticated());

  if (req.isAuthenticated()) {
    console.log("User is authenticated, proceeding");
    return next();
  }

  console.log("User is NOT authenticated, sending 401");
  res.status(401).send("Not authenticated");
}

// Cloudinary and Multer setup for research folder covers

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

// Research folder cover photo storage
const researchStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "meenkodi_research_covers", // Folder in Cloudinary for research covers
    allowed_formats: ["jpg", "jpeg", "png", "webp", "bmp", "gif"],
    transformation: [{ width: 800, height: 600, crop: "fill" }], // Cover photo size
  },
});

const researchUpload = multer({
  storage: researchStorage,
  fileFilter: (req, file, cb) => {
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
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && ["admin", "superadmin"].includes(req.user.role)) return next();
  res.status(403).send("Admins only");
}

function ensureSuperAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "superadmin") return next();
  res.status(403).json({ error: "Super admin access required" });
}

// Like/unlike in one atomic MongoDB update. Reading the doc, changing the
// array in JS and saving it back lost likes when two people clicked at once.
// Returns { likes, liked } or null when the document doesn't exist.
async function toggleLike(Model, id, userId) {
  const unliked = await Model.findOneAndUpdate(
    { _id: id, likes: userId },
    { $pull: { likes: userId } },
    { new: true, projection: { likes: 1 } }
  ).lean();
  if (unliked) return { likes: unliked.likes || [], liked: false };

  const liked = await Model.findOneAndUpdate(
    { _id: id },
    { $addToSet: { likes: userId } },
    { new: true, projection: { likes: 1 } }
  ).lean();
  return liked ? { likes: liked.likes || [], liked: true } : null;
}

// Readable page URLs use slugs ("/explore/temples/meenakshi-amman-temple").
// Translate a slug in any API URL to the document id before the route runs,
// so every existing /api/.../:id route accepts both.
const isObjectIdString = (value) => /^[0-9a-f]{24}$/i.test(String(value));
const SLUG_MODELS = [
  ['/api/seedsandfootprints/folders/', ResearchFolder], ['/api/articles/', Article], ['/api/events/', Event],
  ['/api/gallery/', Gallery], ['/api/resources/', Resource], ['/api/temples/', Temple], ['/api/foods/', Food],
  ['/api/festivals/', Festival], ['/api/literature/', Literature], ['/api/dance/', Dance],
  ['/api/clothing/', Clothing], ['/api/ancientscience/', AncientScience],
];
async function resolveSlugParam(req, res, next, value, name) {
  try {
    if (!req.path.startsWith('/api/') || isObjectIdString(value)) return next();
    const entry = SLUG_MODELS.find(([prefix]) => req.path.startsWith(prefix));
    if (entry) {
      const doc = await entry[1].findOne({ slug: value }).select('_id').lean();
      if (doc) req.params[name] = String(doc._id);
    }
    next();
  } catch (err) {
    next(err);
  }
}
app.param('id', resolveSlugParam);
app.param('folderId', resolveSlugParam);

// Admin: regenerate all sitemaps from live DB data
app.post('/api/sitemap/refresh', ensureAdmin, async (req, res) => {
  try {
    console.log('[Sitemap] Refresh triggered by', req.user._id);
    const files = await getSitemaps({ force: true });
    res.json({ success: true, generated: Object.keys(files) });
  } catch (err) {
    console.error('[Sitemap] Refresh error:', err);
    res.status(500).json({ error: 'Sitemap generation failed', details: err.message });
  }
});

app.get("/api/admin/users", ensureSuperAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get("/api/user/profile", ensureAuthenticated, (req, res) => {
  res.json(req.user);
});

// Article routes
app.get("/api/articles/my-articles", ensureAuthenticated, async (req, res) => {
  try {
    const articles = await Article.find({
      authorId: req.user._id
    }).sort({ submittedAt: -1 });

    const enriched = articles.map((article) => {
      const obj = article.toObject();
      const likesCount = obj.likesCount ?? (obj.likes ? obj.likes.length : 0);
      return {
        ...obj,
        likesCount,
        userLiked: obj.likes ? obj.likes.some((id) => id.toString() === req.user._id.toString()) : false,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get("/api/articles", async (req, res) => {
  const lang = resolveLang(req);
  const { status } = req.query;

  let query = {};

  // Admins can see all articles, regular users only see published
  if (req.user && ['admin', 'superadmin'].includes(req.user.role)) {
    if (status) query.status = status;
  } else {
    query.status = 'published';
  }

  const articles = await Article.find(query).sort({ order: 1, likesCount: -1, createdAt: -1 });
  const isAdminUser = req.user && ['admin', 'superadmin'].includes(req.user.role);
  const enriched = articles.map((article) => {
    const obj = article.toObject();
    const likesCount = obj.likesCount ?? (obj.likes ? obj.likes.length : 0);
    const userLiked = req.user ? (obj.likes ? obj.likes.some((id) => id.toString() === req.user._id.toString()) : false) : false;
    return isAdminUser ? { ...obj, likesCount, userLiked } : { ...publicArticleFields(obj), likesCount, userLiked };
  });

  res.json(localizeCollection(enriched, 'articles', lang));
});

app.get("/api/articles/pending/count", ensureAdmin, async (req, res) => {
  const count = await Article.countDocuments({ status: 'pending' });
  res.json({ count });
});

app.put("/api/articles/order", ensureAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      }
    }));
    await Article.bulkWrite(bulkOps);
    res.json({ success: true });
  } catch (err) {
    console.error("Article order update error:", err);
    res.status(500).json({ error: "Failed to update article order" });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  const lang = resolveLang(req);
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found' });

  // Check permissions
  if (article.status !== 'published') {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!['admin', 'superadmin'].includes(req.user.role) && article.authorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  // Increment view count for published articles
  if (article.status === 'published') {
    article.viewCount = (article.viewCount || 0) + 1;
    await article.save();
  }

  const obj = article.toObject();
  const likesCount = obj.likesCount ?? (obj.likes ? obj.likes.length : 0);
  const userLiked = req.user ? (obj.likes ? obj.likes.some((id) => id.toString() === req.user._id.toString()) : false) : false;
  const isAdminUser = req.user && ['admin', 'superadmin'].includes(req.user.role);
  const visible = isAdminUser ? obj : publicArticleFields(obj);
  res.json(localizeSingle({ ...visible, likesCount, userLiked }, 'articles', lang));
});

// Like/Unlike article
app.post("/api/articles/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('status').lean();
    if (!article) return res.status(404).json({ error: 'Article not found' });

    if (article.status !== 'published') {
      return res.status(403).json({ error: 'Cannot like unpublished article' });
    }

    const result = await toggleLike(Article, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: 'Article not found' });
    // Keep the stored count in sync with the array, computed by MongoDB itself
    await Article.updateOne({ _id: req.params.id }, [{ $set: { likesCount: { $size: { $ifNull: ['$likes', []] } } } }]);

    res.json({ likesCount: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to process like' });
  }
});

// Public article responses: hide the author's email and the list of user ids who liked it
const publicArticleFields = ({ authorEmail, likes, ...rest }) => rest;

// Fields a user is allowed to set on their own article
const ARTICLE_CONTENT_FIELDS = ['title', 'content', 'author', 'image', 'imageLink', 'videoUrl', 'videoLink'];
const pickArticleContent = (body = {}) =>
  Object.fromEntries(ARTICLE_CONTENT_FIELDS.filter((key) => key in body).map((key) => [key, body[key]]));

app.post("/api/articles", ensureAuthenticated, async (req, res) => {
  try {
    const articleData = {
      ...pickArticleContent(req.body),
      authorId: req.user._id,
      authorName: req.user.displayName || req.user.email,
      authorEmail: req.user.email,
      status: ['admin', 'superadmin'].includes(req.user.role) ? 'published' : 'pending',
      submittedAt: new Date(),
    };

    if (['admin', 'superadmin'].includes(req.user.role)) {
      articleData.publishedAt = new Date();
      articleData.approvedBy = req.user._id;
    }

    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/articles/:id", ensureAuthenticated, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    // Check permissions: admin or article author
    if (!['admin', 'superadmin'].includes(req.user.role) && article.authorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Authors may only change the article's content; status, order, likes,
    // author etc. stay admin-only (otherwise an author could self-publish).
    const update = ['admin', 'superadmin'].includes(req.user.role)
      ? { ...req.body }
      : pickArticleContent(req.body);
    delete update.likes;
    delete update.likesCount;
    delete update.viewCount;

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { ...update, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json(updatedArticle);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/articles/:id/approve", ensureAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'published',
        publishedAt: new Date(),
        approvedBy: req.user._id,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/articles/:id/reject", ensureAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/articles/:id", ensureAuthenticated, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });

  // Check permissions
  if (!['admin', 'superadmin'].includes(req.user.role) && article.authorId?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Article.findByIdAndDelete(req.params.id);
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
    if (req.body?.isFolder && (req.body.order === undefined || req.body.order === null)) {
      const maxFolder = await Gallery.findOne({ isFolder: true }).sort({ order: -1 }).select('order');
      req.body.order = (maxFolder?.order ?? 0) + 1;
    }
    const item = await Gallery.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error("Gallery creation error:", err); // Log the full error
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/gallery/folder/:id", ensureAdmin, async (req, res) => {
  try {
    console.log("PUT /api/gallery/folder/:id", req.params.id, req.body);
    const folder = await Gallery.findById(req.params.id);
    if (!folder || !folder.isFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const oldEn = folder.customCategoryName?.en || '';
    const oldTa = folder.customCategoryName?.ta || '';

    const updated = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const newEn = updated.customCategoryName?.en || '';
    const newTa = updated.customCategoryName?.ta || '';

    if (oldEn !== newEn || oldTa !== newTa) {
      const orConditions = [];
      if (oldEn) orConditions.push({ "customCategoryName.en": oldEn });
      if (oldTa) orConditions.push({ "customCategoryName.ta": oldTa });

      if (orConditions.length > 0) {
        await Gallery.updateMany(
          { $or: orConditions, isFolder: { $ne: true } },
          { $set: { "customCategoryName.en": newEn, "customCategoryName.ta": newTa } }
        );
      }
    }

    res.json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/gallery/folders/order", ensureAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, isFolder: true },
        update: { $set: { order: index + 1 } },
      }
    }));

    if (bulkOps.length > 0) {
      await Gallery.bulkWrite(bulkOps);
    }

    res.json({ updated: bulkOps.length });
  } catch (err) {
    console.error("Folder order update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/gallery/photos/order", ensureAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, isFolder: { $ne: true } },
        update: { $set: { order: index + 1 } },
      }
    }));

    if (bulkOps.length > 0) {
      await Gallery.bulkWrite(bulkOps);
    }

    res.json({ updated: bulkOps.length });
  } catch (err) {
    console.error("Photo order update error:", err);
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


app.delete("/api/gallery/folder/:id", ensureAdmin, async (req, res) => {
  try {
    console.log("DELETE /api/gallery/folder/:id", req.params.id);
    const folder = await Gallery.findById(req.params.id);
    if (!folder || !folder.isFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const names = [];
    if (folder.customCategoryName?.en) names.push(folder.customCategoryName.en);
    if (folder.customCategoryName?.ta) names.push(folder.customCategoryName.ta);

    if (names.length === 0) {
      await folder.deleteOne();
      return res.json({ deletedFolderId: folder._id, deletedItems: 0 });
    }

    const orConditions = names.flatMap((name) => ([
      { "customCategoryName.en": name },
      { "customCategoryName.ta": name }
    ]));

    const deleteResult = await Gallery.deleteMany({
      $or: orConditions,
      _id: { $ne: folder._id },
      isFolder: { $ne: true }
    });

    await folder.deleteOne();

    res.json({ deletedFolderId: folder._id, deletedItems: deleteResult.deletedCount });
  } catch (err) {
    console.error("Delete folder error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/gallery/:id", ensureAdmin, async (req, res) => {
  console.log("DELETE /api/gallery/:id", req.params.id);
  const result = await Gallery.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: "Gallery item not found" });
  res.status(204).end();
});

// Research folders endpoints
app.get("/api/seedsandfootprints/folders", async (req, res) => {
  try {
    // The list page only needs each folder's photo count, not every photo
    // (sending all photos made this response ~2 MB). Count them in MongoDB.
    const folders = await ResearchFolder.aggregate([
      { $sort: { order: 1, createdAt: -1 } },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          coverPhoto: 1,
          order: 1,
          createdAt: 1,
          photoCount: { $size: { $ifNull: ["$photos", []] } },
        },
      },
    ]);
    res.json(folders.map(f => ({
      _id: f._id,
      slug: f.slug,
      name: f.name, // Return raw bilingual object
      nameRaw: f.name,
      description: f.description, // Return raw bilingual object
      coverPhoto: f.coverPhoto || null,
      photoCount: f.photoCount,
      order: f.order,
      createdAt: f.createdAt
    })));
  } catch (err) {
    console.error("Error fetching research folders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/seedsandfootprints/folders/:id', async (req, res) => {
  try {
    console.log('Fetching research folder with ID:', req.params.id);
    const lang = resolveLang(req);

    if (!req.params.id || req.params.id === 'undefined') {
      console.log('Invalid folder ID provided');
      return res.status(400).json({ error: 'Invalid folder ID' });
    }

    const folder = await ResearchFolder.findById(req.params.id);
    if (!folder) {
      console.log('Folder not found:', req.params.id);
      return res.status(404).json({ error: 'Folder not found' });
    }

    console.log('Found folder:', folder.name, 'photos count:', folder.photos?.length || 0);

    const response = {
      _id: folder._id,
      slug: folder.slug,
      name: folder.name, // Return raw bilingual object
      nameRaw: folder.name,
      description: folder.description, // Return raw bilingual object
      coverPhoto: folder.coverPhoto || null,
      order: folder.order,
      createdAt: folder.createdAt,
      photos: (folder.photos || []).map((p) => ({
        _id: p._id,
        url: p.url,
        videoLink: p.videoLink || '',
        caption: {
          en: p.caption?.en || '',
          ta: p.caption?.ta || ''
        },
        credit: p.credit || '',
        name: p.name || undefined,
        keywords: p.keywords || [],
        sourceLink: p.sourceLink || '',
        order: p.order ?? 0,
        createdAt: p.createdAt
      }))
    };

    console.log('Sending response with photos:', response.photos.length);
    res.json(response);
  } catch (err) {
    console.error('Error fetching research folder:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Attach a photo to a specific heritage collection (research folder)
// Image is optional to support metadata-only entries (caption, credit, name, keywords, sourceLink)
app.post('/api/seedsandfootprints/folders/:id/photos', ensureAdmin, async (req, res) => {
  try {
    console.log('Photo attachment request:', {
      folderId: req.params.id,
      body: req.body,
      user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
    });

    const { imageUrl, caption, credit, name, keywords, sourceLink, videoLink } = req.body || {};

    const folder = await ResearchFolder.findById(req.params.id);
    if (!folder) {
      console.log('Folder not found:', req.params.id);
      return res.status(404).json({ error: 'Folder not found' });
    }

    console.log('Found folder:', folder.name, 'existing photos:', folder.photos?.length || 0);

    const nextOrder = (folder.photos || []).length
      ? Math.max(...folder.photos.map((p) => p.order || 0)) + 1
      : 1;

    const photo = {
      url: imageUrl || '',
      videoLink: videoLink || '',
      caption: {
        en: caption?.en || '',
        ta: caption?.ta || ''
      },
      credit: credit || '',
      name: name || undefined,
      keywords: Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : []),
      sourceLink: sourceLink || '',
      order: nextOrder
    };

    console.log('Adding photo with data:', photo);

    folder.photos.push(photo);
    folder.updatedAt = new Date();
    await folder.save();

    console.log('Folder saved successfully, total photos now:', folder.photos.length);

    // Return the newly added photo plus a simple success flag
    const savedPhoto = folder.photos[folder.photos.length - 1];

    console.log('Returning saved photo:', savedPhoto);

    res.status(201).json({
      success: true,
      photo: {
        _id: savedPhoto._id,
        url: savedPhoto.url,
        videoLink: savedPhoto.videoLink,
        caption: savedPhoto.caption,
        credit: savedPhoto.credit,
        name: savedPhoto.name,
        keywords: savedPhoto.keywords,
        sourceLink: savedPhoto.sourceLink,
        order: savedPhoto.order,
        createdAt: savedPhoto.createdAt
      }
    });
  } catch (err) {
    console.error('Error adding photo to research folder:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk upload photos to a specific research folder
app.post('/api/seedsandfootprints/folders/:id/photos/bulk', ensureAdmin, async (req, res) => {
  try {
    console.log('Bulk photo upload request:', {
      folderId: req.params.id,
      body: req.body,
      user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
    });

    const { images } = req.body || {};

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required and must not be empty' });
    }

    const folder = await ResearchFolder.findById(req.params.id);
    if (!folder) {
      console.log('Folder not found:', req.params.id);
      return res.status(404).json({ error: 'Folder not found' });
    }

    console.log('Found folder:', folder.name, 'existing photos:', folder.photos?.length || 0);
    console.log('Bulk uploading', images.length, 'photos');

    let nextOrder = (folder.photos || []).length
      ? Math.max(...folder.photos.map((p) => p.order || 0)) + 1
      : 1;

    const addedPhotos = [];

    // Process each image
    for (const img of images) {
      const { imageUrl, caption, credit, name, keywords, sourceLink, videoLink } = img;

      const photo = {
        url: imageUrl || '',
        videoLink: videoLink || '',
        caption: {
          en: caption?.en || '',
          ta: caption?.ta || ''
        },
        credit: credit || '',
        name: name || undefined,
        keywords: Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : []),
        sourceLink: sourceLink || '',
        order: nextOrder++
      };

      folder.photos.push(photo);
      addedPhotos.push(folder.photos[folder.photos.length - 1]);
    }

    folder.updatedAt = new Date();
    await folder.save();

    console.log('Bulk upload successful, added', addedPhotos.length, 'photos. Total photos now:', folder.photos.length);

    res.status(201).json({
      success: true,
      count: addedPhotos.length,
      photos: addedPhotos.map(p => ({
        _id: p._id,
        url: p.url,
        videoLink: p.videoLink,
        caption: p.caption,
        credit: p.credit,
        name: p.name,
        keywords: p.keywords,
        sourceLink: p.sourceLink,
        order: p.order,
        createdAt: p.createdAt
      }))
    });
  } catch (err) {
    console.error('Error bulk uploading photos to research folder:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a photo's metadata or replace its image (admin only)
app.put('/api/seedsandfootprints/folders/:folderId/photos/:photoId', ensureAdmin, async (req, res, next) => {
  // "/photos/order" (reorder) is registered further down; let it handle that path
  if (req.params.photoId === 'order') return next('route');
  try {
    const { folderId, photoId } = req.params;
    const { imageUrl, caption, credit, name, keywords, sourceLink, videoLink } = req.body || {};

    const folder = await ResearchFolder.findById(folderId);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    const photo = folder.photos.id(photoId) || folder.photos.find(p => p._id?.toString() === photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Update fields only if provided
    if (typeof imageUrl === 'string') photo.url = imageUrl;

    if (caption) {
      if (caption.en !== undefined) photo.caption.en = caption.en;
      if (caption.ta !== undefined) photo.caption.ta = caption.ta;
    }

    if (name) {
      if (!photo.name) photo.name = { en: '', ta: '' };
      if (name.en !== undefined) photo.name.en = name.en;
      if (name.ta !== undefined) photo.name.ta = name.ta;
    }

    if (typeof credit !== 'undefined') photo.credit = credit || '';
    if (typeof keywords !== 'undefined') {
      photo.keywords = Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : []);
    }
    if (typeof sourceLink !== 'undefined') photo.sourceLink = sourceLink || '';
    if (typeof videoLink !== 'undefined') photo.videoLink = videoLink || '';

    folder.updatedAt = new Date();
    await folder.save();

    return res.json({ success: true, photo });
  } catch (err) {
    console.error('Error updating research photo:', err);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Delete a photo from a research folder (admin only)
app.delete('/api/seedsandfootprints/folders/:folderId/photos/:photoId', ensureAdmin, async (req, res) => {
  try {
    const { folderId, photoId } = req.params;
    const folder = await ResearchFolder.findById(folderId);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    const photo = folder.photos.id(photoId) || folder.photos.find(p => p._id?.toString() === photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Optionally delete the file from disk if stored locally under /uploads
    if (photo.url && photo.url.startsWith('/uploads/')) {
      try {
        // Only ever delete inside the uploads folder (block "/uploads/../index.js")
        const uploadsRoot = path.resolve(process.cwd(), 'uploads');
        const filePath = path.resolve(process.cwd(), photo.url.replace(/^\//, ''));
        if (filePath.startsWith(uploadsRoot + path.sep) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Failed to delete file from disk:', e.message);
      }
    }

    // Remove photo and save
    folder.photos = folder.photos.filter(p => p._id?.toString() !== photoId);
    folder.updatedAt = new Date();
    await folder.save();
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting research photo:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

app.post("/api/seedsandfootprints/folders", ensureAdmin, researchUpload.single('coverPhoto'), async (req, res) => {
  try {
    console.log('=== CREATE RESEARCH FOLDER REQUEST ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { nameEn, nameTa, descriptionEn, descriptionTa } = req.body;

    if (!nameEn && !nameTa) {
      console.log('Validation failed: No name provided');
      return res.status(400).json({ error: "Folder name required in at least one language" });
    }

    // Build the folder payload
    const payload = {
      name: {},
      description: {}
    };

    if (nameEn) payload.name.en = nameEn;
    if (nameTa) payload.name.ta = nameTa;
    if (descriptionEn) payload.description.en = descriptionEn;
    if (descriptionTa) payload.description.ta = descriptionTa;

    // Add cover photo if uploaded
    if (req.file) {
      console.log('Cover photo uploaded:', req.file.path);
      payload.coverPhoto = req.file.path; // Cloudinary URL
    } else {
      console.log('No cover photo uploaded');
    }

    // Set order
    if (payload.order === undefined || payload.order === null) {
      const max = await ResearchFolder.findOne().sort({ order: -1 }).select('order');
      payload.order = (max?.order ?? 0) + 1;
    }

    console.log('Creating folder with payload:', payload);
    const created = await ResearchFolder.create(payload);
    console.log('Folder created successfully:', created._id);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating research folder:", err);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// Update research folder

app.delete("/api/seedsandfootprints/folders/:id", ensureAdmin, async (req, res) => {
  try {
    const result = await ResearchFolder.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Folder not found" });
    res.status(204).end();
  } catch (err) {
    console.error("Error deleting research folder:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Reorder folders
app.put("/api/seedsandfootprints/folders/order", ensureAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      }
    }));

    if (bulkOps.length > 0) {
      await ResearchFolder.bulkWrite(bulkOps);
    }

    res.json({ updated: bulkOps.length });
  } catch (err) {
    console.error("Folder order update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Reorder photos within a folder
app.put("/api/seedsandfootprints/folders/:id/photos/order", ensureAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }

    const folder = await ResearchFolder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Update the order of each photo in the photos array
    orderedIds.forEach((photoId, index) => {
      const photo = folder.photos.find(p => p._id.toString() === photoId);
      if (photo) {
        photo.order = index + 1;
      }
    });

    await folder.save();
    res.json({ updated: orderedIds.length });
  } catch (err) {
    console.error("Photo order update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Directors & Heritage Specialists API routes
app.use('/api/directors', directorsRoutes);

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
app.put("/api/seedsandfootprints/folders/:id", ensureAdmin, researchUpload.single('coverPhoto'), async (req, res) => {
  try {
    console.log('=== UPDATE RESEARCH FOLDER REQUEST ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { nameEn, nameTa, descriptionEn, descriptionTa, removeCoverPhoto } = req.body;

    // Build the update payload using dot notation for bilingual fields to support partial updates
    const updatePayload = {};

    if (nameEn !== undefined) updatePayload['name.en'] = nameEn;
    if (nameTa !== undefined) updatePayload['name.ta'] = nameTa;

    if (descriptionEn !== undefined) updatePayload['description.en'] = descriptionEn;
    if (descriptionTa !== undefined) updatePayload['description.ta'] = descriptionTa;

    // Handle cover photo operations
    if (req.file) {
      // New cover photo uploaded
      console.log('New cover photo uploaded:', req.file.path);
      updatePayload.coverPhoto = req.file.path; // Cloudinary URL
    } else if (removeCoverPhoto === 'true') {
      // Remove existing cover photo
      console.log('Removing existing cover photo');
      updatePayload.coverPhoto = null;
    }

    console.log('Update payload:', updatePayload);

    const updated = await ResearchFolder.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Folder not found" });

    console.log('Folder updated successfully');
    res.json(updated);
  } catch (err) {
    console.error("Error updating research folder:", err);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
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
  const resources = await Resource.find().sort({ order: 1, createdAt: -1 });
  res.json(localizeCollection(resources, 'resources', lang));
});
app.get("/api/resources/:id", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    const obj = resource.toObject();
    const likesCount = obj.likes ? obj.likes.length : 0;
    const userLiked = req.user ? (obj.likes ? obj.likes.some((id) => id.toString() === req.user._id.toString()) : false) : false;
    res.json(localizeSingle({ ...obj, likesCount, userLiked }, 'resources', lang));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Like/Unlike Resource
app.post("/api/resources/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const result = await toggleLike(Resource, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Resource not found" });
    res.json({ likesCount: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});
// Book details from archive.org (free metadata API) for the admin "Fetch details"
// button: accepts an archive.org link (details/embed/download URL) or a bare identifier.
const parseArchiveId = (input) => {
  const value = String(input || '').trim();
  const fromUrl = value.match(/archive\.org\/(?:details|embed|download|stream)\/([A-Za-z0-9._-]+)/i);
  const id = fromUrl ? fromUrl[1] : value;
  return /^[A-Za-z0-9._-]{3,100}$/.test(id) ? id : null;
};
const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
};
app.get("/api/archive/lookup", ensureAdmin, async (req, res) => {
  const id = parseArchiveId(req.query.url);
  if (!id) return res.status(400).json({ error: "Paste an archive.org link like https://archive.org/details/your-book-id" });
  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(15000) });
    const data = response.ok ? await response.json() : null;
    if (!data || !data.metadata) return res.status(404).json({ error: `No archive.org item found for "${id}"` });
    const m = data.metadata;
    const first = (v) => (Array.isArray(v) ? v[0] : v) || '';
    // The original uploaded PDF (not archive.org's derived "_text.pdf" copy) if there is one
    const pdfs = (data.files || []).filter((f) => /\.pdf$/i.test(f.name));
    const pdf = pdfs.find((f) => f.source === 'original') || pdfs[0];
    res.json({
      archiveId: id,
      title: first(m.title),
      author: [].concat(m.creator || []).join(', '),
      language: first(m.language),
      year: first(m.date || m.year),
      description: String(first(m.description)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      pages: Number(m.imagecount) || null,
      ready: Boolean(pdf) || Number(m.imagecount) > 0, // false while archive.org is still processing
      cover: `https://archive.org/services/img/${id}`,
      downloadLink: pdf ? `https://archive.org/download/${id}/${encodeURIComponent(pdf.name)}` : '',
      pdfName: pdf ? pdf.name : '',
      pdfSize: pdf ? formatBytes(pdf.size) : '',
      embedUrl: `https://archive.org/embed/${id}`,
    });
  } catch (err) {
    console.error("archive.org lookup failed:", err.message);
    res.status(502).json({ error: "Could not reach archive.org, please try again" });
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
// Admin "Arrange order" on the books page (must be registered before /:id)
app.put("/api/resources/order", ensureAdmin, async (req, res) => {
  const { orderedIds } = req.body || {};
  if (!Array.isArray(orderedIds) || !orderedIds.every((id) => mongoose.isValidObjectId(id))) {
    return res.status(400).json({ error: "orderedIds must be an array of ids" });
  }
  await Resource.bulkWrite(orderedIds.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
  })));
  res.json({ success: true });
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
app.put("/api/admin/users/:id/role", ensureSuperAdmin, async (req, res) => {
  console.log("PUT /api/admin/users/:id/role", req.params.id, req.body);
  const { role } = req.body;
  if (!role || !["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  if (targetUser.role === "superadmin" || targetUser._id.equals(req.user._id)) {
    return res.status(403).json({ error: "The superadmin account cannot be changed" });
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
app.put("/api/admin/users/:id", ensureSuperAdmin, async (req, res) => {
  console.log("PUT /api/admin/users/:id", req.params.id, req.body);
  const { displayName, email } = req.body;
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  if (targetUser.role === "superadmin") {
    return res.status(403).json({ error: "The superadmin account cannot be changed" });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { displayName, email },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
// Delete user (admin only)
app.delete("/api/admin/users/:id", ensureSuperAdmin, async (req, res) => {
  console.log("DELETE /api/admin/users/:id", req.params.id);
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  if (targetUser.role === "superadmin") {
    return res.status(403).json({ error: "The superadmin account cannot be deleted" });
  }
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
  try {
    const lang = resolveLang(req);
    const { id } = req.params;
    let land;

    // Check if input is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      land = await Land.findById(id);
    } else {
      // Otherwise, search by 'type' (case-insensitive)
      // e.g. /api/lands/kurinji maps to type: "Kurinji"
      const escapedId = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      land = await Land.findOne({ type: { $regex: new RegExp(`^${escapedId}$`, "i") } });
    }

    if (!land) return res.status(404).json({ error: 'Land not found' });
    res.json(localizeSingle(land, 'lands', lang));
  } catch (err) {
    console.error("Error fetching land:", err);
    res.status(500).json({ error: "Server error" });
  }
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
// Lands are addressed by database id or by their name (e.g. "marutham"), like GET above
const landFilter = (id) =>
  mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { type: { $regex: new RegExp(`^${id.replace(/[^a-z]/gi, "")}$`, "i") } };

app.put("/api/lands/:id", ensureAdmin, async (req, res) => {
  try {
    const { _id, __v, ...update } = req.body || {};
    const land = await Land.findOneAndUpdate(landFilter(req.params.id), update, {
      new: true,
      runValidators: true,
    });
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json(land);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Error saving land:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/lands/:id", ensureAdmin, async (req, res) => {
  try {
    const result = await Land.findOneAndDelete(landFilter(req.params.id));
    if (!result) return res.status(404).json({ error: "Land not found" });
    res.status(204).end();
  } catch (err) {
    console.error("Error deleting land:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Multer setup for general file uploads
const createDirectories = () => {
  const directories = [
    "uploads/gallery",
    "uploads/articles",
    "uploads/events",
    "uploads/resources",
    "uploads/resources/pdf",
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "meenkodi_gallery", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp", "bmp", "gif"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }], // Optimize images
  },
});

const imageUpload = multer({
  storage: storage,
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
});

// General image upload endpoint
app.post(
  "/api/upload/image",
  ensureAuthenticated,
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

    // Ensure user authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "Unauthorized",
        details: "Only authenticated users can upload images",
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

      console.log("Image successfully uploaded to Cloudinary:", req.file.path);

      res.json({
        imageUrl: req.file.path,
        url: req.file.path,
        id: req.file.filename,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Image upload failed", details: error.message });
    }
  }
);

// Bulk image upload endpoint
app.post(
  "/api/upload/images/bulk",
  ensureAuthenticated,
  (req, res, next) => {
    // Log authentication details
    console.log("Bulk Image Upload Authentication Check:", {
      isAuthenticated: req.isAuthenticated(),
      user: req.user
        ? {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
        }
        : "No user",
    });

    // Ensure user authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "Unauthorized",
        details: "Only authenticated users can upload images",
      });
    }

    next();
  },
  imageUpload.array("images", 50), // Allow up to 50 images at once
  (req, res) => {
    try {
      console.log("Bulk Image Upload Request:", {
        filesCount: req.files ? req.files.length : 0,
        user: req.user
          ? {
            email: req.user.email,
            role: req.user.role,
            id: req.user._id,
          }
          : "No user",
      });

      if (!req.files || req.files.length === 0) {
        console.error("No files uploaded");
        return res.status(400).json({
          error: "No image files uploaded",
          details: "Files were not processed by multer",
        });
      }

      console.log("Bulk upload successful:", req.files.length, "images uploaded to Cloudinary");

      const uploadedImages = req.files.map(file => ({
        imageUrl: file.path,
        url: file.path,
        id: file.filename,
        originalName: file.originalname,
        size: file.size,
      }));

      res.json({
        success: true,
        count: uploadedImages.length,
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Bulk image upload error:", error);
      res.status(500).json({ error: "Bulk image upload failed", details: error.message });
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
    if (!req.isAuthenticated() || !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Unauthorized",
        details: "Only admin users can upload videos",
      });
    }

    next();
  },
  videoUpload.single("video"),
  async (req, res) => {
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

      // The file above is only a temp copy: Render's disk is wiped on restart, so
      // upload it to Cloudinary (chunked, videos can be large) and return that URL
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
          fullFilePath,
          { resource_type: "video", folder: "meenkodi_videos", chunk_size: 20 * 1024 * 1024 },
          (err, uploaded) => (err ? reject(err) : resolve(uploaded))
        );
      }).finally(() => cleanupFile(fullFilePath));

      res.json({
        videoUrl: result.secure_url,
        filename: result.public_id,
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
      });
    }
  }
);



// Multer disk storage for temp PDF files to avoid RAM overflow and crash on low-memory servers like Render
const tempPdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), "uploads/temp");
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (e) {
      console.error("Temp directory creation error:", e);
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const sanitizedOriginal = (file.originalname || "document.pdf")
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    cb(null, `temp-${Date.now()}-${sanitizedOriginal}`);
  }
});

const pdfUpload = multer({
  storage: tempPdfStorage,
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf") ||
      file.mimetype === "application/octet-stream";
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF format books are allowed"), false);
    }
  },
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB max limit
  },
});

// Helper for Cloudinary or Disk upload fallback
function uploadToCloudinaryOrDisk(req, res, tempFilePath, uniqueFilename, sizeBytes, sizeFormatted) {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log("GridFS failed/skipped: Uploading directly to Cloudinary via file path...", uniqueFilename);
    cloudinary.uploader.upload(
      tempFilePath,
      {
        folder: "meenkodi_pdf_books",
        resource_type: "auto",
        public_id: uniqueFilename,
      },
      (cloudinaryErr, result) => {
        cleanupFile(tempFilePath);
        if (cloudinaryErr) {
          console.error("Cloudinary PDF upload error:", cloudinaryErr);
          return res.status(500).json({ error: "Cloud upload failed", details: cloudinaryErr.message });
        }

        const pdfUrl = result.secure_url || result.url;
        console.log("✓ PDF Book uploaded to Cloudinary successfully:", pdfUrl, sizeFormatted);

        return res.json({
          url: pdfUrl,
          downloadLink: pdfUrl,
          filename: result.public_id,
          originalName: req.file.originalname,
          size: sizeBytes,
          pdfSize: sizeFormatted,
          pdfName: req.file.originalname,
        });
      }
    );
  } else {
    // If not using Cloudinary, copy from temp to final local upload path
    try {
      const uploadsDir = path.join(process.cwd(), "uploads/resources/pdf");
      fs.mkdirSync(uploadsDir, { recursive: true });
      const finalPath = path.join(uploadsDir, uniqueFilename);
      fs.copyFileSync(tempFilePath, finalPath);
      cleanupFile(tempFilePath);

      const pdfUrl = `/uploads/resources/pdf/${uniqueFilename}`;
      console.log("✓ PDF Book saved to local disk fallback:", pdfUrl);

      return res.json({
        url: pdfUrl,
        downloadLink: pdfUrl,
        filename: uniqueFilename,
        originalName: req.file.originalname,
        size: sizeBytes,
        pdfSize: sizeFormatted,
        pdfName: req.file.originalname,
      });
    } catch (err) {
      cleanupFile(tempFilePath);
      console.error("Disk copy error:", err);
      return res.status(500).json({ error: "Failed to save PDF file locally", details: err.message });
    }
  }
}

// Utility to clean up temp files safely
function cleanupFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Failed to delete temp file:", filePath, e);
    }
  }
}

// Stream PDF directly from MongoDB Database GridFS with local disk caching
// Uploaded file names were stored as UTF-8 bytes read as Latin-1 ("à®à®¤à¯" instead
// of Tamil); turn such names back into the real text
function fixFileNameEncoding(name) {
  if (!name || !/[À-ÿ]/.test(name)) return name || '';
  const fixed = Buffer.from(name, 'latin1').toString('utf8');
  return fixed.includes('�') ? name : fixed;
}
const pickTitle = (field) => (!field ? '' : typeof field === 'string' ? field : (field.en || field.ta || ''));

app.get("/api/resources/pdf/:id", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(500).send("Database connection not ready");

    const fileIdStr = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(fileIdStr)) {
      return res.status(400).send("Invalid PDF ID format");
    }
    const fileId = new mongoose.Types.ObjectId(fileIdStr);

    // "Download PDF" button (?download=1): save the file instead of opening it in the browser
    if (req.query.download) {
      const resource = await Resource.findOne({ downloadLink: `/api/resources/pdf/${fileIdStr}` }).select('pdfName title').lean();
      const name = fixFileNameEncoding(resource?.pdfName) || `${pickTitle(resource?.title) || 'meenkodi-book'}.pdf`;
      res.attachment(name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`);
    }

    const cacheDir = path.join(process.cwd(), "uploads/pdf_cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const cachedFilePath = path.join(cacheDir, `${fileIdStr}.pdf`);

    // If cached locally, serve it instantly. res.sendFile handles HTTP Range requests natively!
    if (fs.existsSync(cachedFilePath)) {
      return res.sendFile(cachedFilePath);
    }

    // Otherwise, fetch metadata first
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "pdf_books" });
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send("PDF Book file not found in database");
    }

    // Unique per request, so two first-time downloads of the same PDF don't
    // write into the same temp file
    const tempFilePath = path.join(cacheDir, `${fileIdStr}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);

    // Download from GridFS to local temp file
    console.log(`Downloading PDF ${fileIdStr} from MongoDB Atlas to local cache...`);
    const downloadStream = bucket.openDownloadStream(fileId);
    const writeStream = fs.createWriteStream(tempFilePath);

    downloadStream.pipe(writeStream);

    downloadStream.on("error", (err) => {
      console.error("GridFS download error while caching:", err);
      cleanupFile(tempFilePath);
      if (!res.headersSent) {
        res.status(500).send("Error downloading file from database");
      }
    });

    writeStream.on("error", (err) => {
      console.error("Write stream error while caching:", err);
      cleanupFile(tempFilePath);
      if (!res.headersSent) {
        res.status(500).send("Error writing cache file");
      }
    });

    writeStream.on("finish", () => {
      try {
        fs.renameSync(tempFilePath, cachedFilePath);
        console.log(`✓ PDF ${fileIdStr} successfully cached to disk.`);
        // Serve the newly cached file
        res.sendFile(cachedFilePath);
      } catch (renameErr) {
        console.error("Failed to rename temp cache file:", renameErr);
        // Fallback: send the temp file if renaming failed
        res.sendFile(tempFilePath, (sendErr) => {
          cleanupFile(tempFilePath);
          if (sendErr && !res.headersSent) res.status(500).send("Error serving PDF");
        });
      }
    });

  } catch (err) {
    console.error("PDF streaming error:", err);
    res.status(500).send("Error streaming PDF from database");
  }
});

// PDF upload endpoint for resources/books (Multi-tiered Storage)
app.post(
  "/api/upload/pdf",
  ensureAdmin,
  (req, res, next) => {
    if (!req.isAuthenticated() || !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized. Admin role required." });
    }
    next();
  },
  pdfUpload.single("pdf"),
  async (req, res) => {
    let tempFilePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      if (req.file.originalname) { req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8'); }
      tempFilePath = req.file.path;
      const sizeBytes = req.file.size || 0;
      const sizeFormatted = sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${(sizeBytes / 1024).toFixed(1)} KB`;

      const sanitizedOriginal = (req.file.originalname || "document.pdf")
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase();
      const uniqueFilename = `book-${Date.now()}-${sanitizedOriginal}`;

      // Method 1: MongoDB GridFS Storage (Permanent Cloud Database Storage)
      const db = mongoose.connection?.db;
      if (db) {
        try {
          const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "pdf_books" });
          const uploadStream = bucket.openUploadStream(uniqueFilename, {
            contentType: req.file.mimetype || "application/pdf",
            metadata: {
              originalName: req.file.originalname,
              uploadedBy: req.user._id,
            }
          });

          const readStream = fs.createReadStream(tempFilePath);

          // Fall back at most once, and keep the temp file: the fallback uploads
          // from it and cleans it up itself.
          let fellBack = false;
          const fallBack = () => {
            if (fellBack || res.headersSent) return;
            fellBack = true;
            readStream.destroy();
            uploadStream.abort().catch(() => {});
            return uploadToCloudinaryOrDisk(req, res, tempFilePath, uniqueFilename, sizeBytes, sizeFormatted);
          };

          readStream.on("error", (readErr) => {
            console.error("Read stream error, falling back to Cloudinary:", readErr);
            return fallBack();
          });

          uploadStream.on("finish", () => {
            if (fellBack) return;
            const fileId = uploadStream.id;
            const pdfUrl = `/api/resources/pdf/${fileId}`;
            console.log("✓ PDF Book stored in MongoDB Database GridFS successfully:", fileId, pdfUrl, sizeFormatted);
            cleanupFile(tempFilePath);
            return res.json({
              url: pdfUrl,
              downloadLink: pdfUrl,
              filename: uniqueFilename,
              fileId: fileId,
              originalName: req.file.originalname,
              size: sizeBytes,
              pdfSize: sizeFormatted,
              pdfName: req.file.originalname,
            });
          });

          uploadStream.on("error", (gridFsErr) => {
            console.error("GridFS stream error, falling back to Cloudinary:", gridFsErr);
            return fallBack();
          });

          readStream.pipe(uploadStream);
          return;
        } catch (gfsErr) {
          console.error("GridFS initialization error, falling back:", gfsErr);
        }
      }

      // Fallback if GridFS is not connected
      return uploadToCloudinaryOrDisk(req, res, tempFilePath, uniqueFilename, sizeBytes, sizeFormatted);

    } catch (error) {
      console.error("PDF upload root error:", error);
      cleanupFile(tempFilePath);
      res.status(500).json({ error: "Failed to upload PDF book", details: error.message });
    }
  }
);



// Multer setup for Land images: stored on Cloudinary (Render's disk is wiped on
// every restart). Images only; old /uploads/lands files are still served below.
const landUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "meenkodi_lands",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "bmp", "gif"],
      transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    },
  }),
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, GIF, WEBP, BMP`), false);
    }
  },
});

app.use(
  "/uploads/lands",
  (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(path.join(process.cwd(), "uploads/lands"))
);

app.post(
  "/api/lands/upload-image",
  ensureAdmin,
  landUpload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: req.file.path }); // Cloudinary URL
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
    const result = await toggleLike(King, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "King not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
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

// ================== DYNASTIES API ROUTES ==================
// Get all dynasties
app.get("/api/dynasties", async (req, res) => {
  try {
    const lang = resolveLang(req);
    const dynasties = await Dynasty.find().sort({ createdAt: -1 });
    res.json(localizeCollection(dynasties, 'dynasties', lang));
  } catch (err) {
    console.error("Get dynasties error:", err);
    res.status(500).json({ error: "Failed to fetch dynasties" });
  }
});

// Get single dynasty by ID or slug
app.get("/api/dynasties/:idOrSlug", async (req, res) => {
  try {
    console.log("=== DYNASTY REQUEST ===");
    console.log("Requested ID/Slug:", req.params.idOrSlug);

    let dynasty;

    // Try to find by MongoDB ID first
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Searching by MongoDB ID");
      dynasty = await Dynasty.findById(req.params.idOrSlug).populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);
    }

    // If not found, try to find by slug
    if (!dynasty) {
      console.log("Searching by slug:", req.params.idOrSlug);
      dynasty = await Dynasty.findOne({ slug: req.params.idOrSlug }).populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);
      console.log("Found by slug:", dynasty ? dynasty.name.en : "Not found");
    }

    if (!dynasty) {
      console.log("Dynasty not found for:", req.params.idOrSlug);
      return res.status(404).json({ error: "Dynasty not found" });
    }

    console.log("Dynasty found:", dynasty.name.en);

    // Check if user liked
    let userLiked = false;
    if (req.user) {
      userLiked = dynasty.likes.some(
        (like) => like.toString() === req.user._id.toString()
      );
    }

    res.json({ ...dynasty.toObject(), userLiked });
  } catch (err) {
    console.error("Get dynasty error:", err);
    res.status(500).json({ error: "Failed to fetch dynasty" });
  }
});

// Create new dynasty (admin only)
app.post("/api/dynasties", ensureAdmin, async (req, res) => {
  try {
    const newDynasty = new Dynasty(req.body);
    await newDynasty.save();
    res.status(201).json(newDynasty);
  } catch (err) {
    console.error("Create dynasty error:", err);
    res.status(500).json({ error: "Failed to create dynasty" });
  }
});

// Update dynasty (admin only)
app.put("/api/dynasties/:id", ensureAdmin, async (req, res) => {
  try {
    const dynasty = await Dynasty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!dynasty) return res.status(404).json({ error: "Dynasty not found" });
    res.json(dynasty);
  } catch (err) {
    console.error("Update dynasty error:", err);
    res.status(500).json({ error: "Failed to update dynasty" });
  }
});

// Delete dynasty (admin only)
app.delete("/api/dynasties/:id", ensureAdmin, async (req, res) => {
  try {
    const dynasty = await Dynasty.findByIdAndDelete(req.params.id);
    if (!dynasty) return res.status(404).json({ error: "Dynasty not found" });
    res.json({ message: "Dynasty deleted successfully" });
  } catch (err) {
    console.error("Delete dynasty error:", err);
    res.status(500).json({ error: "Failed to delete dynasty" });
  }
});

// Like/Unlike dynasty
app.post("/api/dynasties/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const result = await toggleLike(Dynasty, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Dynasty not found" });
    res.json({ likes: result.likes, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

// Add comment to dynasty
app.post("/api/dynasties/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    if (!dynasty) {
      return res.status(404).json({ error: "Dynasty not found" });
    }

    dynasty.comments.push({
      user: req.user._id,
      content: req.body.content,
    });

    await dynasty.save();
    await dynasty.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(dynasty);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Delete comment from dynasty
app.delete("/api/dynasties/:id/comments/:commentId", ensureAuthenticated, async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    if (!dynasty) {
      return res.status(404).json({ error: "Dynasty not found" });
    }

    const comment = dynasty.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    dynasty.comments.pull(req.params.commentId);
    await dynasty.save();
    await dynasty.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(dynasty);
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Add reply to comment
app.post("/api/dynasties/:id/comments/:commentId/replies", ensureAuthenticated, async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    if (!dynasty) {
      return res.status(404).json({ error: "Dynasty not found" });
    }

    const comment = dynasty.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.replies.push({
      user: req.user._id,
      content: req.body.content,
    });

    await dynasty.save();
    await dynasty.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(dynasty);
  } catch (err) {
    console.error("Add reply error:", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

// Delete reply from comment
app.delete("/api/dynasties/:id/comments/:commentId/replies/:replyId", ensureAuthenticated, async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    if (!dynasty) {
      return res.status(404).json({ error: "Dynasty not found" });
    }

    const comment = dynasty.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check if user owns the reply or is admin
    if (reply.user.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    comment.replies.pull(req.params.replyId);
    await dynasty.save();
    await dynasty.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(dynasty);
  } catch (err) {
    console.error("Delete reply error:", err);
    res.status(500).json({ error: "Failed to delete reply" });
  }
});

// ================== END DYNASTIES API ROUTES ==================

// ================== POETS API ROUTES ==================
// Get all poets
app.get("/api/poets", async (req, res) => {
  try {
    const poets = await Poet.find().sort({ createdAt: -1 });
    res.json(poets);
  } catch (err) {
    console.error("Get poets error:", err);
    res.status(500).json({ error: "Failed to fetch poets" });
  }
});

// Get single poet by ID or slug
app.get("/api/poets/:idOrSlug", async (req, res) => {
  try {
    let poet;

    // Try to find by MongoDB ID first
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      poet = await Poet.findById(req.params.idOrSlug).populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);
    }

    // If not found, try to find by slug
    if (!poet) {
      poet = await Poet.findOne({ slug: req.params.idOrSlug }).populate([
        {
          path: "comments.user",
          select: "displayName",
        },
        {
          path: "comments.replies.user",
          select: "displayName",
        },
      ]);
    }

    if (!poet) {
      return res.status(404).json({ error: "Poet not found" });
    }

    // Check if user liked
    let userLiked = false;
    if (req.user) {
      userLiked = poet.likes.some(
        (like) => like.toString() === req.user._id.toString()
      );
    }

    res.json({ ...poet.toObject(), userLiked });
  } catch (err) {
    console.error("Get poet error:", err);
    res.status(500).json({ error: "Failed to fetch poet" });
  }
});

// Create new poet (admin only)
app.post("/api/poets", ensureAdmin, async (req, res) => {
  try {
    const newPoet = new Poet(req.body);
    await newPoet.save();
    res.status(201).json(newPoet);
  } catch (err) {
    console.error("Create poet error:", err);
    res.status(500).json({ error: "Failed to create poet" });
  }
});

// Update poet (admin only)
app.put("/api/poets/:id", ensureAdmin, async (req, res) => {
  try {
    const poet = await Poet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!poet) return res.status(404).json({ error: "Poet not found" });
    res.json(poet);
  } catch (err) {
    console.error("Update poet error:", err);
    res.status(500).json({ error: "Failed to update poet" });
  }
});

// Delete poet (admin only)
app.delete("/api/poets/:id", ensureAdmin, async (req, res) => {
  try {
    const poet = await Poet.findByIdAndDelete(req.params.id);
    if (!poet) return res.status(404).json({ error: "Poet not found" });
    res.json({ message: "Poet deleted successfully" });
  } catch (err) {
    console.error("Delete poet error:", err);
    res.status(500).json({ error: "Failed to delete poet" });
  }
});

// Like/Unlike poet
app.post("/api/poets/:id/like", ensureAuthenticated, async (req, res) => {
  try {
    const result = await toggleLike(Poet, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Poet not found" });
    res.json({ likes: result.likes, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to process like" });
  }
});

// Add comment to poet
app.post("/api/poets/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const poet = await Poet.findById(req.params.id);
    if (!poet) {
      return res.status(404).json({ error: "Poet not found" });
    }

    poet.comments.push({
      user: req.user._id,
      content: req.body.content,
    });

    await poet.save();
    await poet.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(poet);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Delete comment from poet
app.delete("/api/poets/:id/comments/:commentId", ensureAuthenticated, async (req, res) => {
  try {
    const poet = await Poet.findById(req.params.id);
    if (!poet) {
      return res.status(404).json({ error: "Poet not found" });
    }

    const comment = poet.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    poet.comments.pull(req.params.commentId);
    await poet.save();
    await poet.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(poet);
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Add reply to comment
app.post("/api/poets/:id/comments/:commentId/replies", ensureAuthenticated, async (req, res) => {
  try {
    const poet = await Poet.findById(req.params.id);
    if (!poet) {
      return res.status(404).json({ error: "Poet not found" });
    }

    const comment = poet.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.replies.push({
      user: req.user._id,
      content: req.body.content,
    });

    await poet.save();
    await poet.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(poet);
  } catch (err) {
    console.error("Add reply error:", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

// Delete reply from comment
app.delete("/api/poets/:id/comments/:commentId/replies/:replyId", ensureAuthenticated, async (req, res) => {
  try {
    const poet = await Poet.findById(req.params.id);
    if (!poet) {
      return res.status(404).json({ error: "Poet not found" });
    }

    const comment = poet.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check if user owns the reply or is admin
    if (reply.user.toString() !== req.user._id.toString() && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    comment.replies.pull(req.params.replyId);
    await poet.save();
    await poet.populate([
      {
        path: "comments.user",
        select: "displayName",
      },
      {
        path: "comments.replies.user",
        select: "displayName",
      },
    ]);

    res.json(poet);
  } catch (err) {
    console.error("Delete reply error:", err);
    res.status(500).json({ error: "Failed to delete reply" });
  }
});
// ================== END POETS API ROUTES ==================

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
      return res
        .status(404)
        .json({ error: "Literature not found" });

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
      return res
        .status(404)
        .json({ error: "Literature not found" });
    res.json(literature);
  } catch (err) {
    res.status(500).json({ error: "Failed to update literature" });
  }
});

app.delete("/api/literature/:id", ensureAdmin, async (req, res) => {
  try {
    const literature = await Literature.findByIdAndDelete(req.params.id);
    if (!literature)
      return res
        .status(404)
        .json({ error: "Literature not found" });
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
    const result = await toggleLike(Dance, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Dance not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
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
    const result = await toggleLike(Clothing, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Clothing not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
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
    const result = await toggleLike(Temple, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Temple not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
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
    const result = await toggleLike(Literature, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Literature not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
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
    const result = await toggleLike(Festival, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Festival not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
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
    const result = await toggleLike(Food, req.params.id, req.user._id);
    if (!result) return res.status(404).json({ error: "Food not found" });
    res.json({ likes: result.likes.length, userLiked: result.liked });
  } catch (err) {
    console.error("Like error:", err);
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
      const result = await toggleLike(AncientScience, req.params.id, req.user._id);
      if (!result) return res.status(404).json({ error: "Ancient Science not found" });
      res.json({ likes: result.likes.length, userLiked: result.liked });
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

// Serve uploaded files statically with SEO-friendly headers
app.use(
  "/uploads/gallery",
  (req, res, next) => {
    // Add caching headers for images (1 year cache)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Add proper content type
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
      res.setHeader('Content-Type', 'image/' + req.path.split('.').pop().toLowerCase());
    }
    // Add CORS headers for image loading
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Help search engines understand this is an image
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(path.join(process.cwd(), "uploads/gallery"))
);

// Serve resource uploads (PDF books, covers) statically with CORS and PDF support
app.use(
  "/uploads/resources",
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.path.match(/\.pdf$/i)) {
      res.setHeader('Content-Type', 'application/pdf');
    }
    next();
  },
  express.static(path.join(process.cwd(), "uploads/resources"))
);

// Fallback static handler for all other uploads
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    next();
  },
  express.static(path.join(process.cwd(), "uploads"), { maxAge: '1d' })
);

// ─── Serve client build with SSR HTML injection ──────────────────────────────
// If a client build exists, serve it as static files and provide an SPA fallback.
// Use __dirname so this works regardless of working directory when the process starts.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const clientIndex = path.join(clientDist, 'index.html');

if (fs.existsSync(clientIndex)) {
  console.log('Client build detected at:', clientDist, '— serving static client with SSR injection from Express.');
  // Serve static assets (JS/CSS/images) with long-term immutable caching
  // (HTML pages are not served from here: index/redirect off, see the SSR routes)
  app.use(express.static(clientDist, { maxAge: '1y', immutable: true, index: false, redirect: false }));

  // Cache base HTML in production; re-read on every request in dev so edits are reflected
  let cachedBaseHtml = null;

  // In production www.meenkodi.com is the Render Static Site, which rewrites page
  // URLs to this server but serves /assets itself. This server's own client build
  // has different asset file names, so use the Static Site's index.html as the
  // template (refreshed every minute, so new frontend deploys are picked up).
  const STATIC_SITE_URL = (process.env.STATIC_SITE_URL || 'https://meenkodi-media-fd.onrender.com').replace(/\/+$/, '');
  let staticSiteBaseHtml = null;
  async function refreshStaticSiteBaseHtml() {
    try {
      // On Cloudflare Pages the template is served at /__template (see client/functions)
      const templateUrl = process.env.STATIC_TEMPLATE_URL || `${STATIC_SITE_URL}/index.html`;
      const response = await fetch(templateUrl, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) return;
      const html = await response.text();
      if (!html.includes('id="root"')) return;
      // Its build already injected the homepage's hidden SEO block; each page adds its own
      staticSiteBaseHtml = html.replace(/\s*<div id="ssr-content"[\s\S]*?<\/div>\s*(?=<\/body>)/, '\n');
    } catch (err) {
      console.warn('[SSR] Could not fetch Static Site index.html:', err.message);
    }
  }
  if (isProduction) {
    refreshStaticSiteBaseHtml();
    setInterval(refreshStaticSiteBaseHtml, 60 * 1000).unref();
  }

  function getBaseHtml() {
    if (isProduction && staticSiteBaseHtml) return staticSiteBaseHtml;
    if (!cachedBaseHtml || process.env.NODE_ENV !== 'production') {
      cachedBaseHtml = fs.readFileSync(clientIndex, 'utf8');
    }
    return cachedBaseHtml;
  }

  /** Shared helper: send SSR-injected HTML with error fallback */
  function sendSsr(res, opts) {
    try {
      const html = buildPageHtml(getBaseHtml(), opts);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      console.error('[SSR] Error building page HTML:', err);
      res.sendFile(clientIndex, (sendErr) => {
        if (sendErr && !res.headersSent) res.status(500).send('Server error');
      });
    }
  }

  const BASE_URL = 'https://www.meenkodi.com';

  // ── Homepage ──────────────────────────────────────────────────────────────
  app.get('/', async (req, res) => {
    try {
      const [recentArticles, recentEvents] = await Promise.all([
        Article.find({ status: 'published' })
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(8)
          .select('title slug content image authorName _id'),
        Event.find()
          .sort({ date: 1, createdAt: -1 })
          .limit(5)
          .select('title slug description date location imageUrl _id'),
      ]);
      sendSsr(res, {
        title: 'Meenkodi | Tamil Heritage | Pandiya, Chola, Chera Dynasties | Southerns History | தென்புலத்தார்',
        description: 'Meenkodi preserves and shares 5000+ years of Tamil civilization — history, temples, dynasties (Pandiya, Chola, Chera), cultural traditions, and archaeological discoveries. Explore the stories of the Southerns (தென்புலத்தார்).',
        canonicalUrl: `${BASE_URL}/`,
        bodyHtml: buildHomeBodyHtml({ recentArticles, recentEvents }),
      });
    } catch (err) {
      console.error('[SSR] Homepage error:', err);
      sendSsr(res, { canonicalUrl: `${BASE_URL}/`, bodyHtml: buildHomeBodyHtml() });
    }
  });

  // ── Shared helpers for page HTML ───────────────────────────────────────────
  // Names in every form people search: English (or Tamil in English letters) | Tamil,
  // whichever box the admin typed them into
  const pickText = (field) => bilingualName(field);
  // Descriptions in both languages when both exist
  const bothText = (field) => { const { en, ta } = byLanguage(field); return [en, ta].filter(Boolean).join(' — '); };
  const mainImage = (doc) => doc.coverPhoto || doc.imageUrl || doc.image || doc.imageLink || '';
  const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Pages are addressed by slug; old id links still resolve (and are redirected)
  const bySlugOrId = (Model) => (value) => (isObjectIdString(value)
    ? Model.findById(value).lean()
    : Model.findOne({ slug: value }).lean());
  const itemPath = (base, doc) => `${base}/${doc.slug || doc._id}`;
  /** Old id URL of an item that now has a slug -> 301 to the slug URL. Returns true if redirected. */
  const redirectToSlug = (req, res, base, doc, requested) => {
    if (!doc || !doc.slug || requested === doc.slug) return false;
    const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
    res.redirect(301, `${base}/${encodeURIComponent(doc.slug)}${query}`);
    return true;
  };

  // Keys that never hold readable text (ids, links, media, user data)
  const NON_TEXT_KEY = /^(_id|__v|id|slug|order|image|imageUrl|imageLink|imagePosition|url|link|downloadLink|videoUrl|videoLink|mapEmbed|media|banner|flag|createdAt|updatedAt|user|likes|comments)$/i;

  /** All readable text inside a field ({en, ta}, strings, arrays, nested objects), per language */
  function langTexts(value) {
    const out = { en: [], ta: [] };
    const walk = (v, depth) => {
      if (v == null || depth > 4 || v instanceof Date || v._bsontype) return;
      if (typeof v === 'string') {
        const s = v.trim();
        if (s && !/^https?:\/\//i.test(s)) out.en.push(s);
        return;
      }
      if (Array.isArray(v)) return v.forEach((item) => walk(item, depth + 1));
      if (typeof v === 'object') {
        if ('en' in v || 'ta' in v) {
          if (v.en) out.en.push(String(v.en));
          if (v.ta) out.ta.push(String(v.ta));
          return;
        }
        for (const [key, inner] of Object.entries(v)) {
          if (!NON_TEXT_KEY.test(key)) walk(inner, depth + 1);
        }
      }
    };
    walk(value, 0);
    return { en: out.en.join('\n\n'), ta: out.ta.join('\n\n') };
  }

  // Text parts shown on detail pages, in page order, with their headings
  const TEXT_FIELDS = [
    ['description', ''], ['summary', 'Summary'], ['content', ''], ['history', 'History'],
    ['significance', 'Significance'], ['ingredients', 'Ingredients'], ['recipe', 'Recipe'],
    ['biography', 'Biography'], ['majorWorks', 'Major works'], ['contributions', 'Contributions'],
    ['philosophy', 'Philosophy'], ['famousQuotes', 'Famous quotes'], ['achievements', 'Achievements'],
    ['architecture', 'Architecture'], ['culturalContributions', 'Cultural contributions'],
    ['tradeAndEconomy', 'Trade and economy'], ['militaryStrength', 'Military strength'],
    ['rulers', 'Rulers'], ['decline', 'Decline'], ['legacy', 'Legacy'], ['poetry', 'Poetry'],
    ['gods', 'Deities'], ['flora', 'Flora'], ['fauna', 'Fauna'], ['people', 'People'], ['awards', 'Awards'],
  ];
  const FACT_FIELDS = [
    ['tagline', 'Tagline'], ['location', 'Location'], ['deity', 'Deity'], ['period', 'Period'],
    ['dynasty', 'Dynasty'], ['builder', 'Built by'], ['capital', 'Capital'], ['region', 'Region'],
    ['territory', 'Territory'], ['language', 'Language'], ['religion', 'Religion'],
    ['birthPlace', 'Birth place'], ['field', 'Field'], ['scholar', 'Scholar'], ['author', 'Author'],
    ['category', 'Category'], ['style', 'Style'], ['origin', 'Origin'],
  ];

  function pageContent(doc) {
    const sections = TEXT_FIELDS
      .map(([key, heading]) => ({ heading, ...langTexts(doc[key]) }))
      .filter((s) => s.en || s.ta);
    for (const s of doc.contentSections || []) {
      sections.push({ heading: pickText(s.subtitle), ...langTexts(s.content), image: s.imageUrl });
    }
    const facts = FACT_FIELDS
      .map(([key, label]) => {
        const t = langTexts(doc[key]);
        return { label, value: [t.en, t.ta].filter(Boolean).join(' / ') };
      })
      .filter((f) => f.value);
    return { sections, facts };
  }

  // ── Articles list ─────────────────────────────────────────────────────────
  app.get('/articles', async (req, res) => {
    const canonicalUrl = `${BASE_URL}/articles`;
    const title = 'Articles on Tamil Heritage, History & Culture | Meenkodi';
    const description = 'Read in-depth articles on Tamil civilization, Pandiya dynasty, Sangam literature, temple architecture, and cultural traditions on Meenkodi.';
    try {
      const articles = await Article.find({ status: 'published' })
        .sort({ order: 1, publishedAt: -1, createdAt: -1 })
        .limit(100)
        .select('title slug content image authorName _id');
      const items = articles.map((a) => ({ href: itemPath('/articles', a), title: pickText(a.title) || 'Article' }));
      sendSsr(res, {
        title, description, canonicalUrl,
        bodyHtml: buildArticlesBodyHtml({ articles }),
        jsonLd: [collectionLd({ url: canonicalUrl, name: title, description, items }), breadcrumbLd([{ name: 'Articles', url: canonicalUrl }])],
      });
    } catch (err) {
      console.error('[SSR] Articles list error:', err);
      sendSsr(res, { canonicalUrl, bodyHtml: buildArticlesBodyHtml() });
    }
  });

  // ── Article detail ────────────────────────────────────────────────────────
  app.get('/articles/:id', async (req, res) => {
    let canonicalUrl = `${BASE_URL}/articles/${req.params.id}`;
    try {
      const article = await bySlugOrId(Article)(req.params.id);
      if (article && article.status === 'published') {
        if (redirectToSlug(req, res, '/articles', article, req.params.id)) return;
        if (article.slug) canonicalUrl = `${BASE_URL}/articles/${article.slug}`;
        const titleEn = bilingualName(article.title) || 'Tamil Heritage Article';
        const contentText = article.content && (article.content.en || article.content.ta);
        const descEn = metaDescription(contentText, 'Read this article on Meenkodi — Tamil heritage, history, and culture.');
        const image = article.image || article.imageLink;
        sendSsr(res, {
          title: `${titleEn} | Meenkodi Tamil Heritage`,
          description: descEn,
          canonicalUrl,
          image,
          type: 'article',
          bodyHtml: buildArticleDetailBodyHtml({ article }),
          jsonLd: [
            articleLd({ url: canonicalUrl, headline: titleEn, description: descEn, image, datePublished: article.publishedAt || article.createdAt, dateModified: article.updatedAt, authorName: article.authorName }),
            breadcrumbLd([{ name: 'Articles', url: `${BASE_URL}/articles` }, { name: titleEn, url: canonicalUrl }]),
          ],
        });
      } else {
        // Article not found or not published — fall back to articles list meta
        sendSsr(res, {
          title: 'Article | Meenkodi Tamil Heritage',
          description: 'Read articles on Tamil heritage on Meenkodi.',
          canonicalUrl,
          bodyHtml: '<main><h1>Article — Meenkodi Tamil Heritage</h1><p><a href="/articles">Browse all articles</a></p></main>',
          jsonLd: [],
        });
      }
    } catch (err) {
      console.error('[SSR] Article detail error:', err);
      sendSsr(res, { canonicalUrl, bodyHtml: '<main><h1>Article — Meenkodi Tamil Heritage</h1></main>', jsonLd: [] });
    }
  });

  async function getGalleryItemsByFolder(folderName) {
    if (!folderName) return getAllGalleryItems();
    // folderName comes from the URL; escape it so "(" etc. can't throw or be abused
    const queryRegex = new RegExp(escapeRegex(folderName), 'i');
    const items = await Gallery.find({
      isFolder: { $ne: true },
      $or: [
        { 'customCategoryName.en': queryRegex },
        { 'customCategoryName.ta': queryRegex },
        { category: queryRegex },
        { 'name.en': queryRegex },
        { 'name.ta': queryRegex },
        { keywords: queryRegex },
        { tags: queryRegex }
      ]
    }).sort({ order: 1, createdAt: -1 });

    return items.map(item => ({
      _id: item._id,
      slug: item.slug,
      name: pickText(item.name) || 'Gallery Item',
      imageUrl: item.imageUrl || '',
    }));
  }

  async function getAllGalleryItems() {
    const items = await Gallery.find({ isFolder: { $ne: true } })
      .sort({ order: 1, createdAt: -1 })
      .limit(200);

    return items.map(item => ({
      _id: item._id,
      slug: item.slug,
      name: pickText(item.name) || 'Gallery Item',
      imageUrl: item.imageUrl || '',
    }));
  }

  // ── Gallery list ──────────────────────────────────────────────────────────
  app.get('/gallery', async (req, res) => {
    const folder = req.query.folder;
    const items = folder
      ? await getGalleryItemsByFolder(folder)
      : await getAllGalleryItems();

    const title = folder
      ? `${folder} | Meenkodi Gallery`
      : 'Gallery — Tamil Heritage Photos, Kings, Temples & Culture | Meenkodi';
    const description = folder
      ? `Photos from ${folder} — Tamil heritage gallery on Meenkodi.`
      : 'Browse Tamil heritage photos: Pandiya and Chola kings, Dravidian temples, festivals and heritage sites on Meenkodi.';
    const canonicalUrl = `${BASE_URL}/gallery${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`;
    const photos = items.map(i => ({ url: i.imageUrl, caption: i.name }));
    sendSsr(res, {
      title,
      description,
      canonicalUrl,
      image: items.find(i => i.imageUrl)?.imageUrl,
      bodyHtml: buildDetailBodyHtml({
        heading: title,
        items: items.map(i => ({ href: itemPath('/gallery', i), title: i.name, image: i.imageUrl })),
      }),
      jsonLd: [
        imageGalleryLd({ url: canonicalUrl, name: title, description, photos }),
        breadcrumbLd([{ name: 'Gallery', url: `${BASE_URL}/gallery` }]),
      ],
    });
  });

  // ── Gallery folder pages (/gallery/folder/:folderSlug) ─────────────────────
  // Photos belong to a folder by their customCategoryName; links use the same
  // slugify() as the client. The old link format (it dropped Tamil letters) is
  // still accepted.
  const legacyFolderSlug = (str) => String(str || '').toLowerCase().trim().normalize('NFKD')
    .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  const folderKeys = (field) => {
    const names = typeof field === 'string' ? [field] : [field?.en, field?.ta];
    return names.filter(Boolean).flatMap((n) => [slugify(n), legacyFolderSlug(n)]).filter(Boolean);
  };

  app.get('/gallery/folder/:folderSlug', async (req, res) => {
    const wanted = String(req.params.folderSlug).toLowerCase();
    const all = await Gallery.find().sort({ order: 1, createdAt: -1 }).lean();
    const folder = all.find((i) => i.isFolder && folderKeys(i.customCategoryName || i.name).includes(wanted));
    const photos = all.filter((i) => !i.isFolder && i.customCategoryName && folderKeys(i.customCategoryName).includes(wanted));
    const nameField = folder ? (folder.customCategoryName || folder.name) : photos[0]?.customCategoryName;
    const folderName = pickText(nameField) || wanted;
    const canonicalUrl = `${BASE_URL}/gallery/folder/${slugify(byLanguage(nameField).en || byLanguage(nameField).ta) || wanted}`;
    const title = `${folderName} — ${photos.length} photo${photos.length === 1 ? '' : 's'} | Meenkodi Gallery`;
    const description = metaDescription(bothText(folder?.description),
      `${folderName}: ${photos.length} photos in the Meenkodi Tamil Heritage Gallery.`);
    const photoList = photos.map((p) => ({ url: p.imageUrl, caption: `${pickText(p.name)} — ${folderName}` }));
    sendSsr(res, {
      title,
      description,
      canonicalUrl,
      image: folder?.imageUrl || photos.find((p) => p.imageUrl)?.imageUrl,
      bodyHtml: buildDetailBodyHtml({
        heading: folderName,
        sections: folder?.description ? [{ ...byLanguage(folder.description) }] : [],
        items: photos.map((p) => ({ href: itemPath('/gallery', p), title: pickText(p.name), image: p.imageUrl })),
        backHref: '/gallery',
        backLabel: 'Gallery',
      }),
      jsonLd: [
        imageGalleryLd({ url: canonicalUrl, name: folderName, description, photos: photoList }),
        breadcrumbLd([{ name: 'Gallery', url: `${BASE_URL}/gallery` }, { name: folderName, url: canonicalUrl }]),
      ],
    });
  });

  // ── Gallery detail ────────────────────────────────────────────────────────
  app.get('/gallery/:id', async (req, res) => {
    let canonicalUrl = `${BASE_URL}/gallery/${req.params.id}`;
    try {
      const item = await bySlugOrId(Gallery)(req.params.id);
      if (item) {
        if (redirectToSlug(req, res, '/gallery', item, req.params.id)) return;
        if (item.slug) canonicalUrl = `${BASE_URL}/gallery/${item.slug}`;
        const nameEn = bilingualName(item.name) || 'Gallery Item';
        const seoTitleEn = bilingualName(item.seoTitle) || nameEn;
        const folderName = bilingualName(item.customCategoryName) || (item.category !== 'Other' ? item.category : '');
        const seoDescEn = bothText(item.seoDescription)
          || bothText(item.description)
          || `${nameEn} — photo${folderName ? ` from the ${folderName} collection` : ''} in the Meenkodi Tamil Heritage Gallery.`;
        sendSsr(res, {
          title: `${seoTitleEn} | Meenkodi Tamil Heritage Gallery`,
          description: seoDescEn.slice(0, 200),
          canonicalUrl,
          image: item.imageUrl,
          type: 'article',
          bodyHtml: buildGalleryDetailBodyHtml({ item }),
          jsonLd: [
            item.imageUrl ? {
              '@context': 'https://schema.org',
              '@type': 'ImageObject',
              contentUrl: item.imageUrl,
              url: canonicalUrl,
              name: seoTitleEn,
              description: seoDescEn.slice(0, 300),
            } : null,
            breadcrumbLd([{ name: 'Gallery', url: `${BASE_URL}/gallery` }, { name: seoTitleEn, url: canonicalUrl }]),
          ],
        });
      } else {
        sendSsr(res, {
          title: 'Gallery | Meenkodi Tamil Heritage',
          description: 'Explore our Tamil heritage photo gallery on Meenkodi.',
          canonicalUrl,
          bodyHtml: '<main><h1>Gallery — Meenkodi</h1><p><a href="/gallery">Back to gallery</a></p></main>',
          jsonLd: [],
        });
      }
    } catch (err) {
      console.error('[SSR] Gallery detail error:', err);
      sendSsr(res, { canonicalUrl, bodyHtml: '<main><h1>Gallery — Meenkodi Tamil Heritage</h1></main>', jsonLd: [] });
    }
  });

  // ── Events list ───────────────────────────────────────────────────────────
  app.get('/events', async (req, res) => {
    const canonicalUrl = `${BASE_URL}/events`;
    const title = 'Tamil Heritage Events & Workshops | Meenkodi';
    const description = 'Join upcoming Tamil heritage events, cultural workshops, and community gatherings celebrating 5000+ years of Tamil civilization, Pandiya dynasty history, and Sangam literature.';
    try {
      const events = await Event.find()
        .sort({ date: 1, createdAt: -1 })
        .limit(100)
        .select('title slug description date location imageUrl _id');
      const items = events.map((e) => ({ href: itemPath('/events', e), title: pickText(e.title) || 'Event' }));
      sendSsr(res, {
        title, description, canonicalUrl,
        bodyHtml: buildEventsBodyHtml({ events }),
        jsonLd: [collectionLd({ url: canonicalUrl, name: title, description, items }), breadcrumbLd([{ name: 'Events', url: canonicalUrl }])],
      });
    } catch (err) {
      console.error('[SSR] Events list error:', err);
      sendSsr(res, { canonicalUrl, bodyHtml: buildEventsBodyHtml() });
    }
  });

  // ── Event detail ──────────────────────────────────────────────────────────
  app.get('/events/:id', async (req, res) => {
    let canonicalUrl = `${BASE_URL}/events/${req.params.id}`;
    try {
      const event = await bySlugOrId(Event)(req.params.id);
      if (event) {
        if (redirectToSlug(req, res, '/events', event, req.params.id)) return;
        if (event.slug) canonicalUrl = `${BASE_URL}/events/${event.slug}`;
        const titleEn = bilingualName(event.title) || 'Tamil Heritage Event';
        const descEn = bothText(event.description)
          || `${titleEn} — Tamil heritage event on Meenkodi`;
        const locationName = pickText(event.location);
        sendSsr(res, {
          title: `${titleEn} | Meenkodi Events`,
          description: descEn.slice(0, 200),
          canonicalUrl,
          image: event.imageUrl,
          type: 'article',
          bodyHtml: buildEventDetailBodyHtml({ event }),
          jsonLd: [
            event.date ? {
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: titleEn,
              description: descEn.slice(0, 300),
              startDate: new Date(event.date).toISOString(),
              url: canonicalUrl,
              ...(event.imageUrl ? { image: [event.imageUrl] } : {}),
              ...(locationName ? { location: { '@type': 'Place', name: locationName, address: locationName } } : {}),
              organizer: { '@type': 'Organization', name: 'Meenkodi Tamil Heritage Foundation', url: BASE_URL },
            } : null,
            breadcrumbLd([{ name: 'Events', url: `${BASE_URL}/events` }, { name: titleEn, url: canonicalUrl }]),
          ],
        });
      } else {
        sendSsr(res, {
          title: 'Event | Meenkodi Tamil Heritage',
          description: 'Tamil heritage events on Meenkodi.',
          canonicalUrl,
          bodyHtml: '<main><h1>Event — Meenkodi Tamil Heritage</h1><p><a href="/events">Back to events</a></p></main>',
          jsonLd: [],
        });
      }
    } catch (err) {
      console.error('[SSR] Event detail error:', err);
      sendSsr(res, { canonicalUrl, bodyHtml: '<main><h1>Event — Meenkodi Tamil Heritage</h1></main>', jsonLd: [] });
    }
  });

  // ── Explore (static content) ──────────────────────────────────────────────
  app.get('/explore', (req, res) => {
    sendSsr(res, {
      title: 'Explore Tamil Heritage — Temples, Literature, Dance, Food & More | Meenkodi',
      description: 'Explore Tamil heritage across eight categories: Dravidian temples, Sangam literature, classical dance, traditional foods, festivals, clothing, ancient science, and the Five Tamil Lands.',
      canonicalUrl: `${BASE_URL}/explore`,
      bodyHtml: buildExploreBodyHtml(),
      jsonLd: [breadcrumbLd([{ name: 'Explore', url: `${BASE_URL}/explore` }])],
    });
  });

  // ── Content detail pages (full text, preview image and schema from the DB) ──
  const DETAIL_PAGES = [
    {
      path: '/seeds-and-footprints/folders/:id', find: bySlugOrId(ResearchFolder),
      section: 'Seeds & Footprints', back: '/seeds-and-footprints',
      image: (d) => d.coverPhoto || (d.photos || []).find((p) => p.url)?.url,
      photos: (d) => (d.photos || []).map((p) => ({ url: p.url, caption: pickText(p.caption) || pickText(p.name) || pickText(d.name) })),
    },
    { path: '/explore/temples/:id', find: bySlugOrId(Temple), section: 'Tamil Temples', back: '/explore/temples' },
    { path: '/explore/foods/:id', find: bySlugOrId(Food), section: 'Tamil Foods', back: '/explore/foods' },
    { path: '/explore/festivals/:id', find: bySlugOrId(Festival), section: 'Tamil Festivals', back: '/explore/festivals' },
    { path: '/explore/literature/:id', find: bySlugOrId(Literature), section: 'Tamil Literature', back: '/explore/literature', name: (d) => pickText(d.title) || pickText(d.name) },
    { path: '/explore/dance/:id', find: bySlugOrId(Dance), section: 'Tamil Dance', back: '/explore/dance' },
    { path: '/explore/clothing/:id', find: bySlugOrId(Clothing), section: 'Traditional Tamil Clothing', back: '/explore/clothing' },
    { path: '/explore/ancientscience/:id', find: bySlugOrId(AncientScience), section: 'Ancient Tamil Science', back: '/explore/ancientscience' },
    {
      path: '/explore/lands/:id', section: 'Five Tamil Lands', back: '/explore',
      find: (id) => (mongoose.isValidObjectId(id)
        ? Land.findById(id).lean()
        : Land.findOne({ type: { $regex: new RegExp(`^${escapeRegex(id)}$`, 'i') } }).lean()),
    },
    { path: '/dynasties/:id', find: (slug) => Dynasty.findOne({ slug }).lean(), section: 'Tamil Dynasties' },
    { path: '/poets/:id', find: (slug) => Poet.findOne({ slug }).lean(), section: 'Tamil Poets' },
    {
      path: '/resources/:id', find: bySlugOrId(Resource), section: 'Resources', back: '/resources', name: (d) => pickText(d.title),
      // Books: schema.org Book, linked to the archive.org copy when the book is hosted there
      ld: (d, { url, name, description, image }) => ({
        '@context': 'https://schema.org',
        '@type': 'Book',
        url,
        name,
        ...(description ? { description } : {}),
        ...(image ? { image } : {}),
        ...(pickText(d.author) ? { author: { '@type': 'Person', name: pickText(d.author) } } : {}),
        bookFormat: 'https://schema.org/EBook',
        ...(d.archiveId ? { sameAs: `https://archive.org/details/${d.archiveId}` } : {}),
        isAccessibleForFree: true,
        publisher: { '@type': 'Organization', name: 'Meenkodi Tamil Heritage Foundation', url: BASE_URL },
      }),
    },
  ];

  for (const page of DETAIL_PAGES) {
    app.get(page.path, async (req, res) => {
      let canonicalUrl = `${BASE_URL}${req.path.replace(/\/+$/, '')}`;
      let doc = null;
      try {
        doc = await page.find(req.params.id);
      } catch (err) {
        console.error(`[SSR] ${page.path} error:`, err);
      }
      if (!doc) {
        return sendSsr(res, { canonicalUrl, title: `${page.section} | Meenkodi Tamil Heritage`, jsonLd: [] });
      }
      const basePath = page.path.replace(/\/:id$/, '');
      if (redirectToSlug(req, res, basePath, doc, req.params.id)) return;
      if (doc.slug) canonicalUrl = `${BASE_URL}${basePath}/${doc.slug}`;
      const name = (page.name ? page.name(doc) : pickText(doc.name)) || page.section;
      const description = metaDescription(bothText(doc.description), `${name} — ${page.section} on Meenkodi, preserving 5000+ years of Tamil heritage.`);
      const image = page.image ? page.image(doc) : mainImage(doc);
      const photos = page.photos ? page.photos(doc) : [];
      const { sections, facts } = pageContent(doc);
      const trail = page.back
        ? [{ name: page.section, url: `${BASE_URL}${page.back}` }, { name, url: canonicalUrl }]
        : [{ name, url: canonicalUrl }];
      sendSsr(res, {
        title: `${name} | ${page.section} | Meenkodi`,
        description,
        canonicalUrl,
        image,
        type: 'article',
        bodyHtml: buildDetailBodyHtml({
          heading: name,
          image,
          facts,
          sections,
          photos,
          backHref: page.back,
          backLabel: page.section,
        }),
        jsonLd: [
          page.ld
            ? page.ld(doc, { url: canonicalUrl, name, description, image })
            : page.photos
              ? imageGalleryLd({ url: canonicalUrl, name, description, photos })
              : articleLd({ url: canonicalUrl, headline: name, description, image, datePublished: doc.createdAt, dateModified: doc.updatedAt }),
          breadcrumbLd(trail),
        ],
      });
    });
  }

  // ── Section list pages (with links to every item) ─────────────────────────
  const LIST_PAGES = [
    { path: '/seeds-and-footprints', title: 'Seeds & Footprints — Tamil Heritage Research Collections | Meenkodi', description: 'Photo collections tracing the seeds and footprints of Tamil people, Pallar and Mallar heritage across Tamil Nadu and the world.', name: 'Seeds & Footprints',
      list: async () => (await ResearchFolder.find().sort({ order: 1, createdAt: -1 }).select('name slug coverPhoto').lean())
        .map((f) => ({ href: itemPath('/seeds-and-footprints/folders', f), title: pickText(f.name), image: f.coverPhoto })) },
    { path: '/explore/temples', title: 'Tamil Temples & Dravidian Architecture | Meenkodi', description: 'Explore ancient Tamil temples and Dravidian architecture — history, legends and photos on Meenkodi.', name: 'Tamil Temples', model: Temple },
    { path: '/explore/foods', title: 'Traditional Tamil Foods & Cuisine | Meenkodi', description: 'Discover traditional Tamil foods, their history and cultural meaning on Meenkodi.', name: 'Tamil Foods', model: Food },
    { path: '/explore/festivals', title: 'Tamil Festivals & Celebrations | Meenkodi', description: 'Tamil festivals and celebrations — Pongal, Chithirai and more — with their history on Meenkodi.', name: 'Tamil Festivals', model: Festival },
    { path: '/explore/literature', title: 'Sangam & Tamil Literature | Meenkodi', description: 'Explore Sangam literature and classical Tamil works on Meenkodi.', name: 'Tamil Literature', model: Literature },
    { path: '/explore/dance', title: 'Tamil Dance & Performing Arts | Meenkodi', description: 'Classical and folk Tamil dance forms and performing arts on Meenkodi.', name: 'Tamil Dance', model: Dance },
    { path: '/explore/clothing', title: 'Traditional Tamil Clothing | Meenkodi', description: 'Traditional Tamil clothing and textiles through history on Meenkodi.', name: 'Traditional Tamil Clothing', model: Clothing },
    { path: '/explore/ancientscience', title: 'Ancient Tamil Science & Technology | Meenkodi', description: 'Ancient Tamil science, astronomy, medicine and technology on Meenkodi.', name: 'Ancient Tamil Science', model: AncientScience },
    { path: '/resources', title: 'Tamil Heritage Books & Resources | Meenkodi', description: 'Books, PDFs and research resources on Tamil history and heritage on Meenkodi.', name: 'Resources',
      list: async () => (await Resource.find().sort({ order: 1, createdAt: -1 }).select('title slug image').lean())
        .map((r) => ({ href: itemPath('/resources', r), title: pickText(r.title), image: r.image })) },
    { path: '/faq', title: 'FAQ — Tamil Heritage & Meenkodi | Frequently Asked Questions', description: 'Answers to common questions about Meenkodi and Tamil heritage.', name: 'FAQ' },
  ];
  for (const page of LIST_PAGES) {
    app.get(page.path, async (req, res) => {
      const canonicalUrl = `${BASE_URL}${page.path}`;
      let items = [];
      try {
        if (page.list) {
          items = await page.list();
        } else if (page.model) {
          items = (await page.model.find().sort({ createdAt: -1 }).select('name title slug image imageUrl imageLink').lean())
            .map((d) => ({ href: itemPath(page.path, d), title: pickText(d.name) || pickText(d.title), image: mainImage(d) }));
        }
      } catch (err) {
        console.error(`[SSR] ${page.path} list error:`, err);
      }
      items = items.filter((i) => i.title);
      sendSsr(res, {
        title: page.title,
        description: page.description,
        canonicalUrl,
        image: items.find((i) => i.image)?.image,
        bodyHtml: buildDetailBodyHtml({ heading: page.title, sections: [{ en: page.description }], items }),
        jsonLd: [
          items.length ? collectionLd({ url: canonicalUrl, name: page.title, description: page.description, items }) : null,
          breadcrumbLd([{ name: page.name, url: canonicalUrl }]),
        ],
      });
    });
  }

  // ── Generic SPA catch-all (for all other routes) ──────────────────────────
  // Injects canonical URL only — no DB fetch needed for uncovered routes
  app.get('*', (req, res, next) => {
    // Let missing API routes / upload files fall through to a 404 instead of hanging
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    try {
      const canonicalUrl = `${BASE_URL}${req.originalUrl || req.path}`;
      const html = buildPageHtml(getBaseHtml(), {
        canonicalUrl,
        title: '',
        description: '',
        bodyHtml: '',
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      console.error('[SSR] Catch-all error:', err);
      res.sendFile(clientIndex, (sendErr) => {
        if (sendErr && !res.headersSent) res.status(500).send('Server error');
      });
    }
  });

} else {
  console.log('No client build found at:', clientIndex, "— the Web Service will only serve API routes until you build the client.");
}

// Unknown /api routes: answer 404 instead of leaving the request hanging
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Final error handler: errors from routes (including async ones, see
// forwardAsyncErrors) end up here instead of crashing the process.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }
  if (err?.name === 'ValidationError' || err?.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  console.error('Unhandled route error:', req.method, req.originalUrl, err);
  res.status(500).json({ error: 'Server error' });
});

// Start the server immediately - don't wait for MongoDB
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ MongoDB URI configured: ${!!(process.env.MONGO_URI || process.env.MONGODB_URI)}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    // Mongoose 8 no longer accepts a callback here
    await mongoose.connection.close().catch(() => {});
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
