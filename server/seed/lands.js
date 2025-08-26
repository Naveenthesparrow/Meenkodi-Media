import mongoose from "mongoose";
import dotenv from "dotenv";
import Land from "../models/Land.js";
dotenv.config();

const lands = [
  {
    name: "Kurinji",
    type: "Kurinji",
    description:
      "Mountainous region, home to honey, wildflowers, and heroic love.",
    poetry: [
      "The hills echo with the songs of lovers and the call of the kurinji flower.",
    ],
    gods: ["Murugan"],
    flora: ["Kurinji flower", "Bamboo", "Sandalwood"],
    fauna: ["Elephant", "Peacock", "Monkey"],
    people: ["Hunters", "Tribal chiefs"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6e/Kurinji_Flower_Bloom.jpg",
  },
  {
    name: "Mullai",
    type: "Mullai",
    description:
      "Forested and pastoral land, symbolizing patience and waiting.",
    poetry: ["The jasmine scents the air as shepherds sing to their cattle."],
    gods: ["Mayon (Krishna)"],
    flora: ["Jasmine", "Tulsi", "Banyan"],
    fauna: ["Cow", "Deer", "Parrot"],
    people: ["Shepherds", "Cowherds"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Jasmine_flower.jpg",
  },
  {
    name: "Marutham",
    type: "Marutham",
    description:
      "Fertile agricultural plains, the land of prosperity and daily life.",
    poetry: ["The fields ripple with paddy and the songs of farmers."],
    gods: ["Indra"],
    flora: ["Paddy", "Sugarcane", "Banana"],
    fauna: ["Buffalo", "Fish", "Duck"],
    people: ["Farmers", "Landowners"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Paddy_Field_Tamil_Nadu.jpg",
  },
  {
    name: "Neithal",
    type: "Neithal",
    description: "Coastal land, home to the sea, salt, and longing.",
    poetry: ["Waves crash as fisherfolk mend their nets by the shore."],
    gods: ["Varunan"],
    flora: ["Palm", "Mangrove", "Seagrass"],
    fauna: ["Fish", "Crab", "Seagull"],
    people: ["Fisherfolk", "Salt-makers"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Fishing_boats_Tamil_Nadu.jpg",
  },
  {
    name: "Palai",
    type: "Palai",
    description:
      "Arid wasteland, symbol of hardship, separation, and endurance.",
    poetry: ["The sun beats down on the sand as travelers journey in hope."],
    gods: ["Korravai"],
    flora: ["Cactus", "Acacia", "Palmyra"],
    fauna: ["Tiger", "Snake", "Vulture"],
    people: ["Wayfarers", "Bandits"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Palmyra_tree_Tamil_Nadu.jpg",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Land.deleteMany();
  await Land.insertMany(lands);
  console.log("Seeded Five Lands");
  mongoose.disconnect();
}

seed();
