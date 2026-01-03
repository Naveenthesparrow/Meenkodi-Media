
import mongoose from "mongoose";
import dotenv from "dotenv";
import Land from "./models/Land.js";

dotenv.config();

const lands = [
    {
        type: "Kurinji",
        name: { en: "Kurinji", ta: "குறிஞ்சி" },
        description: {
            en: "Mountain highlands thriving on honey, hill tribes, and Murugan devotion. The rhythm of the parai echoes through slopes painted indigo every twelve years.",
            ta: "மலைத் தேனும் மலை மக்கள் வாழ்க்கையும் முருகன் பக்தியும் துடிக்கும் மலை நிலம். பன்னிரண்டு ஆண்டுகளுக்கு ஒருமுறை மலரும் குறிஞ்சி ஊதா நிறத்தில் நிலத்தை மறைக்கும்."
        },
        image: "/images/lands/Kurnji.avif",
        gods: ["Murugan"],
        people: ["Kuravar", "Kurathiyar"],
        poetry: [
            "<p><b>Mist-wrapped peaks where drums and lovers meet.</b></p>",
            "<p><i>மூடுபனிக் குன்றுகளில் முரசும் இணையும் காதலும்.</i></p>"
        ],
        flora: ["Kurinji", "Venkai", "Jackfruit"],
        fauna: ["Tiger", "Elephant", "Bear", "Parrot", "Peacock"]
    },
    {
        type: "Mullai",
        name: { en: "Mullai", ta: "முல்லை" },
        description: {
            en: "Pastoral forests of bamboo groves, cowherds, and Mayon’s flute. Evening lamps glow in leaf-thatched hamlets while stories of waiting kindle the hearth.",
            ta: "மூங்கில் காடும் மாட்டுக் காளைகளும் மாயோன் புலலும் பாடும் காட்டுப்புறை. மாராய்ச்சி சொற்களுடன் ஓலை கூரைகளில் விளக்குகள் ஜொலிக்கிறது."
        },
        image: "/images/lands/mullai.avif",
        gods: ["Mayon (Vishnu)"],
        people: ["Ayar", "Aaychiyar"],
        poetry: [
            "<p><b>Forest hearths where patient love awaits the hunter.</b></p>",
            "<p><i>காட்டுப்பன்னையில் வேட்டைக்காரனை காத்திருக்கும் அமைதியான காதல்.</i></p>"
        ],
        flora: ["Mullai", "Konrai"],
        fauna: ["Deer", "Rabbit", "Wild Cow"]
    },
    {
        type: "Marutham",
        name: { en: "Marutham", ta: "மருதம்" },
        description: {
            en: "Rice paddies, river ports, and vibrant marketplaces honoured by Indra. Love and humour bloom amidst bustling town squares and bardic debates.",
            ta: "அரிசித் தடங்கள், நதி துறைமுகங்கள், அலைமோதும் சந்தைகள் இந்திரன் அருளால் செழிக்கின்றன. கேளிக்கை வட்டாரங்களில் அன்பும் நகைச்சுவையும் மலர்கின்றன."
        },
        image: "/images/lands/marutham.avif",
        gods: ["Indran"],
        people: ["Uzhavar", "Uzhatthiyar"],
        poetry: [
            "<p><b>Fertile river plains where drums call farmers to dawn markets.</b></p>",
            "<p><i>நதிக் கரையின் செழிப்பில் மங்கலவாத்தியம் விவசாயிகளை விடியற்கால சந்தைக்கு அழைக்கிறது.</i></p>"
        ],
        flora: ["Marutham", "Lotus", "Water Lily"],
        fauna: ["Buffalo", "Otter", "Water Fowl"]
    },
    {
        type: "Neithal",
        name: { en: "Neithal", ta: "நெய்தல்" },
        description: {
            en: "Lagoons, salt pans, and ocean trade blessed by Varunan. Conch calls announce pearl dives while seafarers map constellations above tidal shrines.",
            ta: "குளங்கள், உப்பு பெருக்கு, கடல் வணிகம் வருணன் அருளால் செழிக்கின்றன. சங்கு ஒலி முத்து மூழ்கலை அறிவிக்க, கடல் பயணிகள் விண்மீன் வரைபடங்களை வாசிக்கின்றனர்."
        },
        image: "/images/lands/neithal.avif",
        gods: ["Varunan"],
        people: ["Parathar", "Parathiyar"],
        poetry: [
            "<p><b>Sea breeze ballads of fisher folk awaiting returning sails.</b></p>",
            "<p><i>திரும்பும் படகுகளை காத்திருக்கும் மீனவர்களின் கடற்காற்றுக் கவிதைகள்.</i></p>"
        ],
        flora: ["Punnai", "Thazhai"],
        fauna: ["Shark", "Crocodile", "Seagull"]
    },
    {
        type: "Palai",
        name: { en: "Palai", ta: "பாலை" },
        description: {
            en: "Arid heartlands born from drought-struck Mullai, guarded by Korravai. Caravan marches, heroic ballads, and drought rites move with the desert wind.",
            ta: "வறட்சியால் மாறிய முல்லை நிலம் பாலையானது; கொற்றவை காவல் காக்கும். கரவான் ஊர்வலங்கள், வீரப் பாடல்கள், வறட்சி வழிபாடுகள் பாலைவனக் காற்றோடு பயணிக்கின்றன."
        },
        image: "/images/lands/palai.avif",
        gods: ["Kotravai"],
        people: ["Maravar", "Eyinar"],
        poetry: [
            "<p><b>Sun-scarred trails where warriors seek valor and belonging.</b></p>",
            "<p><i>கதிரவன் காய்ந்த வழிகளில் வீரரும் தன் பொருளும் தேடும் பயணம்.</i></p>"
        ],
        flora: ["Palai", "Cactus"],
        fauna: ["Elephant (wild)", "Tiger", "Eagle"]
    }
];

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("MongoDB connected for seeding");

        // Clear existing lands
        await Land.deleteMany({});
        console.log("Cleared existing lands");

        // Insert new lands
        await Land.insertMany(lands);
        console.log("Seeded 5 lands successfully with High-Res images and content");

        mongoose.disconnect();
        console.log("Disconnected");
    })
    .catch((err) => {
        console.error("Seeding error:", err);
        mongoose.disconnect();
    });
