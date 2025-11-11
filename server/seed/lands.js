import mongoose from "mongoose";
import dotenv from "dotenv";
import Land from "../models/Land.js";
dotenv.config();

// Helper to build bilingual field
const bi = (en, ta) => ({ en, ta });

// Core five eco-regions (Tinai) with bilingual names & descriptions (pure Tamil, avoiding Sanskritized forms)
// Arrays (gods, flora, fauna, people, poetry) remain simple strings for now; can be extended later if needed.
const lands = [
  {
    type: "Kurinji",
    name: bi("Kurinji", "குறிஞ்சி"),
    description: bi(
      "Mountain tract of cool mists; kurinji flower and honey gatherers; theme of union love.",
      "மலை மூடிக் குளிர் தூறும் நிலம்; 12 ஆண்டுக்கு ஒருமுறை மலரும் குறிஞ்சி மலர், தேன்சேகரர்கள்; சேர்க்கை காதல் சூழல்."),
    poetry: [
      "மலையினில் குறிஞ்சி மலர் மலர்ந்த காலம் காதல் கீதம் ஒலிக்கும்",
      "The hills ring with love songs when the kurinji blooms"
    ],
    gods: ["Murugan"],
    flora: ["Kurinji flower", "Bamboo", "Sandalwood"],
    fauna: ["Elephant", "Peacock", "Monkey"],
    people: ["Kuravar", "Hill hunters"],
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Kurinji_Flower_Bloom.jpg",
  },
  {
    type: "Mullai",
    name: bi("Mullai", "முல்லை"),
    description: bi(
      "Pastoral forest zone of cattle herds; mood of patient waiting.",
      "மாடு மேய்க்கும் காடு சூழ்ந்த நிலம்; காத்திருக்கும் தன்மை, மென்மை உணர்ச்சி."),
    poetry: [
      "முல்லை மணம் காற்றில் நீளும்; காத்திருக்கும் கணவன் நினைவு",
      "Jasmine fragrance stretches while one waits in longing"
    ],
    gods: ["Mayon"],
    flora: ["Jasmine", "Banyan", "Tulsi"],
    fauna: ["Cow", "Deer", "Parrot"],
    people: ["Shepherds", "Cowherds"],
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Jasmine_flower.jpg",
  },
  {
    type: "Marutham",
    name: bi("Marutham", "மருதம்"),
    description: bi(
      "Fertile river-fed plains; agriculture, daily civic life, justice themes.",
      "பெருக்கெடும் ஆறு பாசனநிலம்; விவசாயம், நாளாந்த வாழ்வு, நீதி குறிப்பு."),
    poetry: [
      "நெல்வயல் அலை போல் அசைந்திடும்; உழவன் பாடல் ஓங்கி",
      "Paddy fields ripple like waves to the farmer's song"
    ],
    gods: ["Indra"],
    flora: ["Paddy", "Sugarcane", "Banana"],
    fauna: ["Buffalo", "Fish", "Duck"],
    people: ["Farmers", "Landowners"],
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Paddy_Field_Tamil_Nadu.jpg",
  },
  {
    type: "Neithal",
    name: bi("Neithal", "நெய்தல்"),
    description: bi(
      "Littoral coast: boats, salt pans, pearls; theme of longing and separation.",
      "கரையோரக் கடல் நிலம்; படகுகள், உப்பு காடுகள், முத்து; பிரிவு ஏக்கம் உணர்வு."),
    poetry: [
      "அலை விரிசல் கயிறு நனைக்கும்; மீனவன் வலை விரிக்கும்",
      "Waves fray the rope as the fisher casts his net"
    ],
    gods: ["Varunan"],
    flora: ["Palm", "Mangrove", "Seagrass"],
    fauna: ["Fish", "Crab", "Seagull"],
    people: ["Fisherfolk", "Salt workers"],
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Fishing_boats_Tamil_Nadu.jpg",
  },
  {
    type: "Palai",
    name: bi("Palai", "பாலை"),
    description: bi(
      "Arid transformed tract (from other zones); hardship, endurance, separation.",
      "மற்ற நிலம் வறண்டுப் மாற்றம் பெற்ற பகுதி; துன்பம், சகிப்புத்தன்மை, பிரிவு."),
    poetry: [
      "வெயில் தணியாது மணல் எரியும்; பயணி சோர்வும் தாகமும்",
      "Sun scorches sand; the traveller bears thirst and fatigue"
    ],
    gods: ["Korravai"],
    flora: ["Palmyra", "Acacia", "Cactus"],
    fauna: ["Tiger", "Snake", "Vulture"],
    people: ["Wayfarers", "Bandits"],
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Palmyra_tree_Tamil_Nadu.jpg",
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Land.deleteMany();
  await Land.insertMany(lands);
  console.log("Seeded bilingual Tinai lands (5 entries)");
  mongoose.disconnect();
}

seed();
