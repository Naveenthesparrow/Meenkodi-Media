import mongoose from "mongoose";
import dotenv from "dotenv";
import Article from "./models/Article.js";
import Gallery from "./models/Gallery.js";
import Event from "./models/Event.js";
import Resource from "./models/Resource.js";
import Land from "./models/Land.js";
import King from "./models/King.js";
import Temple from "./models/Temple.js";
import Dance from "./models/Dance.js";
import Food from "./models/Food.js";
import Festival from "./models/Festival.js";
import Clothing from "./models/Clothing.js";
import Literature from "./models/Literature.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkData() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    console.log("=== CURRENT DATABASE CONTENT ===");
    
    const articles = await Article.find({});
    console.log(`Articles: ${articles.length}`);
    articles.forEach(article => console.log(`- ${article.title} (Image: ${article.image || 'No image'})`));

    const gallery = await Gallery.find({});
    console.log(`\nGallery: ${gallery.length}`);
    gallery.forEach(item => console.log(`- ${item.title} (Image: ${item.imageUrl || 'No image'})`));

    const events = await Event.find({});
    console.log(`\nEvents: ${events.length}`);
    events.forEach(event => console.log(`- ${event.title} (Image: ${event.imageUrl || 'No image'})`));

    const resources = await Resource.find({});
    console.log(`\nResources: ${resources.length}`);
    resources.forEach(resource => console.log(`- ${resource.title}`));

    const lands = await Land.find({});
    console.log(`\nLands: ${lands.length}`);
    lands.forEach(land => console.log(`- ${land.name} (Image: ${land.image || 'No image'})`));

    const kings = await King.find({});
    console.log(`\nKings: ${kings.length}`);
    kings.forEach(king => console.log(`- ${king.name} (Image: ${king.image || 'No image'})`));

    const temples = await Temple.find({});
    console.log(`\nTemples: ${temples.length}`);
    temples.forEach(temple => console.log(`- ${temple.name} (Image: ${temple.image || 'No image'})`));

    const dances = await Dance.find({});
    console.log(`\nDances: ${dances.length}`);
    dances.forEach(dance => console.log(`- ${dance.name} (Image: ${dance.image || 'No image'})`));

    const foods = await Food.find({});
    console.log(`\nFoods: ${foods.length}`);
    foods.forEach(food => console.log(`- ${food.name} (Image: ${food.image || 'No image'})`));

    const festivals = await Festival.find({});
    console.log(`\nFestivals: ${festivals.length}`);
    festivals.forEach(festival => console.log(`- ${festival.name} (Image: ${festival.image || 'No image'})`));

    const clothing = await Clothing.find({});
    console.log(`\nClothing: ${clothing.length}`);
    clothing.forEach(item => console.log(`- ${item.name} (Image: ${item.image || 'No image'})`));

    const literature = await Literature.find({});
    console.log(`\nLiterature: ${literature.length}`);
    literature.forEach(lit => console.log(`- ${lit.title} (Image: ${lit.image || 'No image'})`));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkData();