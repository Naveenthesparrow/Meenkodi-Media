// Non-destructive translation helper for API responses
// Usage: import { localizeCollection, localizeSingle } from './translationMap.js';

export const translations = {
  lands: {
    Kurinji: { en_name: "Kurinji", en_description: "Cool mountainous eco-region; Kurinji flower blooms every 12 years." },
    Mullai: { en_name: "Mullai", en_description: "Pastoral / forest ecological zone with cattle culture." },
    Marutham: { en_name: "Marutham", en_description: "Fertile river valley suited for agriculture and settlement." },
    Neithal: { en_name: "Neithal", en_description: "Coastal belt with fishing and maritime exchange." },
    Palai: { en_name: "Palai", en_description: "Arid tract symbolizing hardship & separation in classical poetry." }
  },
  kings: {
    "ராஜராஜ சோழன் (Raja Raja Chola I)": {
      en_name: "Raja Raja Chola I",
      en_description: "Great Chola emperor; built Brihadisvara Temple.",
      achievements_en: "Built the Great Temple; naval expansion.",
      content_en: "His reign marked the early Chola imperial zenith."
    },
    "ராஜேந்திர சோழன் (Rajendra Chola I)": {
      en_name: "Rajendra Chola I",
      en_description: "Son of Raja Raja; northern expedition to the Ganges.",
      achievements_en: "Ganges campaign; overseas victories.",
      content_en: "Extended Chola influence into Southeast Asia."
    },
    "கரிகால் சோழன் (Karikala Chola)": {
      en_name: "Karikala Chola",
      en_description: "Ancient ruler famed for Kallanai (Grand Anicut).",
      achievements_en: "Constructed Kallanai dam.",
      content_en: "Pioneering irrigation supporting agrarian growth."
    }
  },
  temples: {
    "பிரகதீஸ்வரர் கோயில்": {
      en_name: "Brihadisvara Temple",
      en_description: "UNESCO Chola monument (1010 CE).",
      content_en: "Pinnacle of Chola Dravidian architecture with grand vimana."
    },
    "மீனாக்ஷி அம்மன் கோயில்": {
      en_name: "Meenakshi Amman Temple",
      en_description: "Madurai complex with 14 gopurams and thousand-pillared hall.",
      content_en: "Iconic Dravidian shrine of Meenakshi & Sundareswarar."
    }
  },
  dances: {
    "பரதநாட்டியம்": {
      en_name: "Bharatanatyam",
      en_description: "Classical Tamil dance of deep antiquity.",
      content_en: "Adavu, nritta & nritya; accompanied by nadaswaram, thavil, veena."
    }
  },
  foods: {
    "சாம்பார்": { en_name: "Sambar", en_description: "Tamarind-based lentil vegetable stew.", significance_en: "Daily staple." },
    "இட்லி": { en_name: "Idli", en_description: "Steamed fermented rice-lentil cakes.", significance_en: "Breakfast staple." },
    "தோசை": { en_name: "Dosa", en_description: "Crisp fermented rice-lentil crepe.", significance_en: "Traditional dish." },
    "பொங்கல்": { en_name: "Ven Pongal", en_description: "Rice & moong dal with ghee, pepper, cumin.", significance_en: "Festive offering." },
    "ரசம்": { en_name: "Rasam", en_description: "Pepper-cumin tangy broth.", significance_en: "Digestive with rice." },
    "பாயசம்": { en_name: "Payasam (Kheer)", en_description: "Sweet milk rice dessert.", significance_en: "Festive sweet." }
  },
  festivals: {
    "பொங்கல்": { en_name: "Pongal", en_description: "Four-day harvest festival.", significance_en: "Thanks to nature, cattle & Sun." },
    "தீபாவளி": { en_name: "Deepavali (Diwali)", en_description: "Festival of Lights.", significance_en: "Victory of good over evil." }
  },
  clothing: {
    "கான்சீவரம் பட்டுப்புடவை": { en_name: "Kanchipuram Silk Saree", en_description: "Handwoven pure silk with rich motifs.", significance_en: "Cultural identity & craftsmanship." }
  },
  literature: {
    "திருக்குறள்": { en_name: "Tirukkural", en_description: "1330 couplets on virtue, wealth, love.", genre_en: "Ethical classic." }
  },
  articles: {
    "சங்க இலக்கியம்: தமிழ் கவிதையின் பொற்காலம்": {
      en_title: "Sangam Literature: The Golden Age of Tamil Poetry",
      en_content: "Ancient Tamil corpus (300 BCE–300 CE)."
    },
    "பிரகதீஸ்வரர் கோயில்: தஞ்சாவூரின் பெரிய கோயில்": {
      en_title: "Brihadisvara Temple: The Great Temple of Thanjavur",
      en_content: "11th c. Chola masterwork; UNESCO heritage site."
    }
  },
  gallery: {
    "தஞ்சாவூர் ஓவியம்": { en_title: "Tanjore Painting", en_description: "Traditional relief-rich style." },
    "மதுரை மீனாக்ஷி கோயில்": { en_title: "Meenakshi Temple, Madurai", en_description: "Historic temple on Vaigai's south bank." },
    "பரதநாட்டிய கலைஞர்": { en_title: "Bharatanatyam Performer", en_description: "Performer of classical Tamil dance." }
  },
  events: {
    "பொங்கல் திருவிழா": { en_title: "Pongal Festival", en_description: "January harvest celebration.", type_en: "Cultural Festival" },
    "சித்திரை திருவிழா": { en_title: "Chithirai Festival", en_description: "Madurai festival of divine wedding.", type_en: "Religious Festival" }
  },
  resources: {
    "சிலப்பதிகாரம் (காவியம்)": { en_title: "Silappathikaram (Epic)", en_description: "One of five great Tamil epics." },
    "ஆவணப்படம்: சோழர்கள்": { en_title: "Documentary: The Cholas", en_description: "Film on dynasty & contributions." }
  }
};

function extractBaseKey(doc) {
  return doc.name || doc.title || '';
}

function buildLocalized(doc, type, lang) {
  if (lang !== 'en') return doc; // Tamil base returned as-is
  const key = extractBaseKey(doc);
  const entry = translations[type]?.[key];
  if (!entry) return doc;
  const clone = { ...doc };
  const translated = {};
  // Map common fields
  if (entry.en_name) translated.name = entry.en_name;
  if (entry.en_title) translated.title = entry.en_title;
  if (entry.en_description) translated.description = entry.en_description;
  if (entry.genre_en) translated.genre = entry.genre_en;
  if (entry.achievements_en) translated.achievements = entry.achievements_en;
  if (entry.content_en) translated.content = entry.content_en;
  if (entry.significance_en) translated.significance = entry.significance_en;
  if (entry.type_en) translated.type = entry.type_en;
  clone.translated = translated;
  return clone;
}

export function localizeCollection(docs, type, lang) {
  return docs.map(d => buildLocalized(d.toObject ? d.toObject() : d, type, lang));
}

export function localizeSingle(doc, type, lang) {
  return buildLocalized(doc.toObject ? doc.toObject() : doc, type, lang);
}

export function resolveLang(req) {
  const q = req.query.lang;
  if (q === 'en' || q === 'ta') return q;
  const hdr = (req.headers['accept-language'] || '').toLowerCase();
  if (hdr.startsWith('en')) return 'en';
  return 'ta';
}
