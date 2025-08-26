import mongoose from "mongoose";
import dotenv from "dotenv";
import Article from "./models/Article.js";
import Gallery from "./models/Gallery.js";
import Event from "./models/Event.js";
import Resource from "./models/Resource.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const articles = [
  {
    title: "Sangam Literature: The Golden Age of Tamil Poetry",
    content:
      "Sangam literature is the earliest known literature of South India, composed between 300 BCE and 300 CE. It reflects the rich culture, values, and traditions of ancient Tamil society.",
    author: "Dr. Ilamparithi",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6e/Sangam_poetry.jpg",
  },
  {
    title: "Brihadeeswarar Temple: The Big Temple of Thanjavur",
    content:
      "Built by Raja Raja Chola I in the 11th century, this UNESCO World Heritage site is a marvel of Dravidian architecture.",
    author: "Kavitha S.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4a/Thanjavur_Brihadeeswara_Temple.jpg",
  },
];

const gallery = [
  {
    title: "Tanjore Painting",
    description:
      "A classical South Indian painting style, known for its rich colors and surface richness.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Tanjore_painting.jpg",
  },
  {
    title: "Madurai Meenakshi Temple",
    description:
      "A historic Hindu temple located on the southern bank of the Vaigai River in Madurai.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5d/Meenakshi_Amman_Temple.jpg",
  },
];

const events = [
  {
    title: "Pongal Festival",
    description: "A harvest festival celebrated by Tamils in January.",
    date: new Date("2024-01-15"),
    location: "Tamil Nadu, India",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Pongal_Festival.jpg",
  },
  {
    title: "Chithirai Thiruvizha",
    description:
      "Annual festival celebrated in Madurai, marking the celestial wedding of Meenakshi and Sundareswarar.",
    date: new Date("2024-04-23"),
    location: "Madurai, Tamil Nadu",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Chithirai_Festival.jpg",
  },
];

const resources = [
  {
    title: "Silappatikaram (Epic)",
    description: "One of the five great epics of Tamil literature.",
    link: "https://en.wikipedia.org/wiki/Silappatikaram",
    type: "Book",
  },
  {
    title: "Documentary: The Cholas",
    description:
      "A documentary on the Chola dynasty and their contributions to art and architecture.",
    link: "https://www.youtube.com/watch?v=example",
    type: "Video",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await Article.deleteMany({});
    await Gallery.deleteMany({});
    await Event.deleteMany({});
    await Resource.deleteMany({});

    await Article.insertMany(articles);
    await Gallery.insertMany(gallery);
    await Event.insertMany(events);
    await Resource.insertMany(resources);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
