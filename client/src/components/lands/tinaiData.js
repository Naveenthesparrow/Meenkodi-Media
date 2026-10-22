/*
 * The five tinai (ஐந்திணை) of Sangam poetry, each with its own colours,
 * an animated landscape drawn in SVG, and its classical attributes as set out
 * in Tolkappiyam: the season (பெரும்பொழுது), the time of day (சிறுபொழுது),
 * the love theme (உரிப்பொருள்) and the way of life.
 */

export const TINAI_ORDER = ["kurinji", "mullai", "marutham", "neithal", "palai"];

export const TINAI_THEMES = {
  kurinji: {
    ta: "குறிஞ்சி",
    en: "Kurinji",
    image: "/images/lands/Kurnji.avif",
    label: { en: "Mountains & hill slopes", ta: "மலையும் மலை சார்ந்த இடமும்" },
    accent: "#5B34A8",
    accent2: "#3E6FA8",
    ink: "#21163F",
    page: "#F3EFFA",
    paper: "#FBF9FF",
    facts: {
      season: { en: "Cold season & early dew", ta: "கூதிர், முன்பனி" },
      time: { en: "Midnight", ta: "யாமம்" },
      theme: { en: "Union of lovers", ta: "புணர்தல்" },
      life: { en: "Honey gathering, millet farming, hunting", ta: "தேன் எடுத்தல், தினை விதைத்தல், வேட்டை" },
    },
  },
  mullai: {
    ta: "முல்லை",
    en: "Mullai",
    image: "/images/lands/mullai.avif",
    label: { en: "Forests & pastures", ta: "காடும் காடு சார்ந்த இடமும்" },
    accent: "#2E6B3A",
    accent2: "#B9832B",
    ink: "#14301B",
    page: "#EEF5EC",
    paper: "#FAFDF9",
    facts: {
      season: { en: "Rainy season", ta: "கார்" },
      time: { en: "Evening", ta: "மாலை" },
      theme: { en: "Patient waiting", ta: "இருத்தல்" },
      life: { en: "Cattle herding, dry-land farming", ta: "ஆநிரை மேய்த்தல், வரகு விதைத்தல்" },
    },
  },
  marutham: {
    ta: "மருதம்",
    en: "Marutham",
    image: "/images/lands/marutham.avif",
    label: { en: "Fields & fertile river plains", ta: "வயலும் வயல் சார்ந்த இடமும்" },
    accent: "#4E7A1E",
    accent2: "#2E7BA6",
    ink: "#1F3110",
    page: "#F3F6E6",
    paper: "#FCFDF6",
    facts: {
      season: { en: "All six seasons", ta: "ஆறு பெரும்பொழுதும்" },
      time: { en: "Dawn", ta: "வைகறை" },
      theme: { en: "Lovers' quarrel", ta: "ஊடல்" },
      life: { en: "Rice cultivation", ta: "நெல் பயிரிடுதல்" },
    },
  },
  neithal: {
    ta: "நெய்தல்",
    en: "Neithal",
    image: "/images/lands/neithal.avif",
    label: { en: "Sea & seashore", ta: "கடலும் கடல் சார்ந்த இடமும்" },
    accent: "#0E6F9E",
    accent2: "#C99A45",
    ink: "#0B2C40",
    page: "#EAF3F7",
    paper: "#F9FCFE",
    facts: {
      season: { en: "All six seasons", ta: "ஆறு பெரும்பொழுதும்" },
      time: { en: "Sunset", ta: "எற்பாடு" },
      theme: { en: "Pining in separation", ta: "இரங்கல்" },
      life: { en: "Fishing, salt making", ta: "மீன் பிடித்தல், உப்பு விளைவித்தல்" },
    },
  },
  palai: {
    ta: "பாலை",
    en: "Palai",
    image: "/images/lands/palai.avif",
    label: { en: "Parched wasteland", ta: "மணலும் மணல் சார்ந்த இடமும்" },
    accent: "#A3501A",
    accent2: "#D9A441",
    ink: "#3A1C08",
    page: "#FBF1E4",
    paper: "#FFFBF5",
    facts: {
      season: { en: "Summer & late dew", ta: "இளவேனில், முதுவேனில், பின்பனி" },
      time: { en: "Midday", ta: "நண்பகல்" },
      theme: { en: "Separation", ta: "பிரிதல்" },
      life: { en: "Waylaying, cattle raids", ta: "வழிப்பறி, ஆநிரை கவர்தல்" },
    },
  },
};

export const FACT_LABELS = {
  season: { en: "Season", ta: "பெரும்பொழுது" },
  time: { en: "Time of day", ta: "சிறுபொழுது" },
  theme: { en: "Love theme", ta: "உரிப்பொருள்" },
  life: { en: "Way of life", ta: "தொழில்" },
};
