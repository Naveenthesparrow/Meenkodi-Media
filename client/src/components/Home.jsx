import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Chip,
  Fade,
  Paper,
  IconButton,
  Modal,
  Tooltip,
  Snackbar,
  Button,
  Container,
  Dialog,
  DialogContent,
  Avatar,
  TextField,
  Stack,
  Zoom,
} from "@mui/material";
import OptimizedImage from "./common/OptimizedImage";
import DeferredSection from "./common/DeferredSection";
import SEO, { pageSEO } from "./common/SEO";
import KurnjiImage from "../assests/Kurnji.avif";
import MullaiImage from "../assests/mullai.avif";
import MaruthamImage from "../assests/marutham.avif";
import NeithalImage from "../assests/neithal.avif";
import PalaiImage from "../assests/palai.avif";
import {
  AutoAwesome,
  ArrowForward,
  Architecture,
  Landscape,
  Article,
  PhotoCamera,
  Event,
  MenuBook,
  Close,
  Star,
  LocationOn,
  ArchiveOutlined,
  SchoolOutlined,
  CelebrationOutlined,
  Instagram,
  Twitter,
  Facebook,
  Language as LanguageIcon,
  TrendingUp,
  Museum as MuseumIcon,
  Science as ScienceIcon,
  CollectionsBookmark,
  ScheduleOutlined,
  FormatQuoteRounded,
  YouTube,
  Email,
  Phone,
} from "@mui/icons-material";
import CourseSyllabusSlider from "./CourseSyllabusSlider";
import DirectorsSlider from "./DirectorsSlider";
import { useBilingualContent, createBilingualContent } from "../utils/bilingualContent";
import MeenkodiImage from "../assests/meenkodi.png";

const TEAM_DIRECTORS = [
  {
    name: { en: "Subramania Bharathi", ta: "சுப்பிரமணிய பாரதியார்" },
    title: { en: "National Poet of Tamil Nadu", ta: "தமிழ்நாட்டின் தேசிய கவிஞர்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Subramanya_Bharathi.jpg/250px-Subramanya_Bharathi.jpg",
    imagePosition: "center 20%"
  },
  {
    name: { en: "Kambar", ta: "கம்பர்" },
    title: { en: "Epic Poet • Kambaramayanam", ta: "காவிய கவிஞர் • கம்பராமாயணம்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Kambar.jpg?20120807204334",
    imagePosition: "center top"
  },
  {
    name: { en: "Thiruvalluvar", ta: "திருவள்ளுவர்" },
    title: { en: "Author of Thirukkural", ta: "திருக்குறள் ஆசிரியர்" },
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXR0EU2W1grbcin5-yghbPrNHdMq0wFccGwR71QRc0WB6ZXEzRbsbPeMdhDWQKgsVfTiGP-9ivpM27-cBXd8_vzzmuZ4JdQbsaWkBS6Dk6swOzSAQhIJ64V_QKG5drXTMrJB1wUgwssyQ/s1600/thiruvalluvar-779961.jpg",
    imagePosition: "50% 15%"
  },
  {
    name: { en: "Devaneyapavanar", ta: "தேவநேயப் பாவாணர்" },
    title: { en: "Tamil Scholar • Linguist", ta: "தமிழ் அறிஞர் • மொழியியலாளர்" },
    image: "https://static.hindutamil.in/hindu/uploads/news/2023/02/07/xlarge/940197.jpg",
    imagePosition: "center top"
  },
  {
    name: { en: "Avvaiyar", ta: "ஔவையார்" },
    title: { en: "Poet • Philosopher", ta: "கவிஞர் • தத்துவஞானி" },
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Statue_of_Avvaiyar_%28cropped%29.jpg",
    imagePosition: "center top"
  }
];

const TEAM_MUSEUM = [
  {
    name: { en: "Pandiya Dynasty", ta: "பாண்டிய வம்சம்" },
    title: { en: "Ancient Tamil Kingdom (600 BCE - 1650 CE)", ta: "பண்டைய தமிழ் அரசு (கி.மு. 600 - கி.பி. 1650)" },
    flag: "https://yt3.googleusercontent.com/ICLjJKZ0_mSIvsO-G00WfgpMWw6NWiNifNAFFW9jf7QhboKOaczaqyuFEVntaoWr7oQvFkf97A=s160-c-k-c0x00ffffff-no-rj"
  },
  {
    name: { en: "Chera Dynasty", ta: "சேர வம்சம்" },
    title: { en: "Western Tamil Kingdom (300 BCE - 1102 CE)", ta: "மேற்கு தமிழ் அரசு (கி.மு. 300 - கி.பி. 1102)" },
    flag: "https://m.media-amazon.com/images/I/616C23TXJZL.jpg"
  },
  {
    name: { en: "Chola Dynasty", ta: "சோழ வம்சம்" },
    title: { en: "Great Tamil Empire (300 BCE - 1279 CE)", ta: "மாபெரும் தமிழ் பேரரசு (கி.மு. 300 - கி.பி. 1279)" },
    flag: "https://ae01.alicdn.com/kf/H6f548d445be04d79a1b534aa2467d1e6u.jpg"
  },
  {
    name: { en: "Pallava Dynasty", ta: "பல்லவ வம்சம்" },
    title: { en: "Northern Tamil Kingdom (275 - 897 CE)", ta: "வடக்கு தமிழ் அரசு (கி.பி. 275 - 897)" },
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Simha_flag_of_Pallava_Kingdom.png"
  },
  {
    name: { en: "LTTE", ta: "தமிழீழ விடுதலைப் புலிகள்" },
    title: { en: "Liberation Tigers of Tamil Eelam", ta: "தமிழீழ விடுதலைப் புலிகள்" },
    flag: "https://upload.wikimedia.org/wikipedia/en/a/a6/Ltte_emblem.jpg"
  }
];

const LIBRARY_ARCHIVES_HEADING = {
  top: { en: 'Library &', ta: 'நூலகம் &' },
  bottom: { en: 'Archives', ta: 'காப்பகங்கள்' }
};

const LIBRARY_ARCHIVES_DESCRIPTION_SEGMENTS = [
  { text: { en: "Heritage Foundation's Library & Archives", ta: 'ஹெரிடேஜ் ஃபவுண்டேஷனின் நூலகம் & காப்பகங்கள்' }, highlight: true },
  { text: { en: ' is a heritage preservation center housing ', ta: ' ஒரு பாரம்பரிய பாதுகாப்பு மையமாக இருந்து ' }, highlight: false },
  { text: { en: 'rare manuscripts', ta: 'அரிய கைப்பிரதிகள்' }, highlight: true },
  { text: { en: ', ', ta: ', ' }, highlight: false },
  { text: { en: 'historic books', ta: 'வரலாற்றுப் புத்தகங்கள்' }, highlight: true },
  { text: { en: ', and ', ta: ', மற்றும் ' }, highlight: false },
  { text: { en: 'cultural collections', ta: 'பண்பாட்டு சேகரிப்புகள்' }, highlight: true },
  { text: { en: ' that bring history to life. Visit to experience history come alive -- ', ta: ' வரலாற்றை உயிரோடு காட்டுகின்றன. வரலாறு உயிர்ப்பெறும் அனுபவத்தைப் பெற வருக -- ' }, highlight: false },
  { text: { en: 'a legacy preserved for future generations.', ta: 'எதிர்தலைமுறைகளுக்காக காத்திருக்கும் பாரம்பரியப் பரிசு.' }, highlight: true }
];

const LIBRARY_ARCHIVES_CTA = { en: 'Know More', ta: 'மேலும் அறிக' };

const STATS_QUOTES = [
  createBilingualContent(
    '"We explore the glorious Tamil dynasties.',
    '"நாம் தமிழ் வம்சங்களை ஆராய்கிறோம்.'
  ),
  createBilingualContent(
    'We preserve southern Tamil civilization.',
    'நாம் தமிழர் நாகரிகத்தை பாதுகாக்கிறோம்.'
  ),
  createBilingualContent(
    'We celebrate the Meenkodi legacy."',
    'நாம் மீன்கொடி மரபை கொண்டாடுகிறோம்."'
  )
];


const SYLLABUS_ITEMS = [
  {
    number: "01",
    duration: { en: "12 weeks", ta: "12 வாரங்கள்" },
    title: {
      en: 'Certificate in "Dravidian Temple Architecture"',
      ta: '"திராவிடக் கோவில் கட்டிடம்" சான்றிதழ் பாடநெறி',
    },
    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f3b?auto=format&fit=crop&w=1600&q=80",
    route: "/explore/temples",
  },
  {
    number: "02",
    duration: { en: "10 days", ta: "10 நாட்கள்" },
    title: {
      en: 'Workshop on "Tamil Iconography & Bronze Casting"',
      ta: '"தமிழ் சிலைச் சின்னங்கள் & வெண்கல வடிவ" பட்டறை',
    },
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
    route: "/resources",
  },
  {
    number: "03",
    duration: { en: "7 days", ta: "7 நாட்கள்" },
    title: {
      en: 'Intensive "Sangam Literature & Society" Labs',
      ta: '"சங்க இலக்கியமும் சமூகமும்" தீவிர ஆய்வகங்கள்',
    },
    image: "https://images.unsplash.com/photo-1518780548940-4300a3220c8a?auto=format&fit=crop&w=1600&q=80",
    route: "/explore/literature",
  },
  {
    number: "04",
    duration: { en: "6 weeks", ta: "6 வாரங்கள்" },
    title: {
      en: 'Field School: "Tamil Heritage Documentation"',
      ta: 'களப்பள்ளி: "தமிழ் பாரம்பரிய ஆவணப்படுத்தல்"',
    },
    image: "https://images.unsplash.com/photo-1580742300482-79547dc9b6fe?auto=format&fit=crop&w=1600&q=80",
    route: "/explore",
  },
  {
    number: "05",
    duration: { en: "1 year", ta: "1 ஆண்டு" },
    title: {
      en: 'Advanced Diploma in "Tamil Performing Arts"',
      ta: '"தமிழ் நடிப்பு கலைகள்" மேம்பட்ட டிப்ளமோ',
    },
    image: "https://images.unsplash.com/photo-1470214304380-aadaedcfff84?auto=format&fit=crop&w=1600&q=80",
    route: "/explore/dance",
  },
];

const EXPLORE_CATEGORIES = [
  {
    number: "01",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Temples", ta: "கோவில்கள்" },
    image: "https://media.istockphoto.com/id/614963888/photo/madurai-temple.jpg?s=612x612&w=0&k=20&c=DsQA3jxKCY-nPESfzGsrd1EZlM5fIs8Xu1WyXQOcfHU=",
    route: "/explore/temples",
  },
  {
    number: "02",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Kings & Dynasties", ta: "மன்னர்கள் & வம்சங்கள்" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzL9j6_7co2VhJloM-_Lxni38D08fxujKZajssDcrRZ50cFmzy3LRhjkuTUMeeMzHkQwg&usqp=CAU",
    route: "/explore/kings",
  },
  {
    number: "03",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Literature", ta: "இலக்கியம்" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfa9g4jtZjDr5oXBFdUmQT-nKBP5ofsjIvQA&s",
    route: "/explore/literature",
  },
  {
    number: "04",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Dance & Performing Arts", ta: "நடனம் & கலைகள்" },
    image: "https://www.namasteindiatrip.org/wp-content/uploads/2022/09/Bharatanatyam-Dance-Tamil-Nadu.jpg",
    route: "/explore/dance",
  },
  {
    number: "05",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Foods & Cuisine", ta: "உணவுகள் & சமையல்" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2yQhkA7lizteWREN0TJMmCUG_uxdbsf6mxw&s",
    route: "/explore/foods",
  },
  {
    number: "06",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Festivals", ta: "திருவிழாக்கள்" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrGxfi3uEmEmPhPaWfeFndzCX6uQxYLwic_Q&s",
    route: "/explore/festivals",
  },
  {
    number: "07",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Traditional Clothing", ta: "பாரம்பரிய உடைகள்" },
    image: "https://png.pngtree.com/png-vector/20250609/ourmid/pngtree-south-indian-cartoon-couple-in-traditional-dress-vector-png-image_16493995.png",
    route: "/explore/clothing",
  },
  {
    number: "08",
    duration: { en: "Explore", ta: "ஆராயுங்கள்" },
    title: { en: "Ancient Science", ta: "பண்டைய அறிவியல்" },
    image: "https://static.wixstatic.com/media/9e7636_3819edac5c2c4e2f8bfd46fe5f853680~mv2.png/v1/fill/w_568,h_328,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9e7636_3819edac5c2c4e2f8bfd46fe5f853680~mv2.png",
    route: "/explore/ancientscience",
  },
];


const FACTS = [
  {
    title: { en: "Copper Plate Charters", ta: "செம்புத் தகடுகள் அறிவிப்புகள்" },
    description: {
      en: "Uthiramerur inscriptions detail sophisticated village self-governance systems from the Chola era.",
      ta: "சோழர்கால உத்திரமேரூர் கல்வெட்டுகள் கிராம சுயாட்சி அமைப்புகளை நுணுக்கமாக விவரிக்கின்றன."
    },
    source: { en: "Uthiramerur, 750 CE", ta: "உத்திரமேரூர், கி.பி. 750" }
  },
  {
    title: { en: "Maritime Sangam Trade", ta: "சங்ககால கடல்சார் வணிகம்" },
    description: {
      en: "Tamil merchants exchanged pearls, textiles, and spices with Rome and South-East Asia from Kaveripattinam.",
      ta: "காவேரிப்பட்டினத்தில் இருந்த தமிழர் வணிகர்கள் ரோமாவும் தென்கிழக்கு ஆசியாவும் சேர்ந்து முத்து, நெய்தல் மற்றும் சுவைகளைக் கடத்தியுள்ளனர்."
    },
    source: { en: "Pattinappalai, Sangam Literature", ta: "பட்டினப்பாலை, சங்க இலக்கியம்" }
  },
  {
    title: { en: "Chola Naval Engineering", ta: "சோழர் கடற்படை பொறியியல்" },
    description: {
      en: "Thanjavur inscriptions record specialised shipyards crafting ocean-ready vessels with copper-fastened hulls.",
      ta: "தஞ்சாவூர் கல்வெட்டுகள் செம்பால் இணைக்கப்பட்ட படகு கருக்கள் கொண்ட சிறப்பு கப்பல்களைத் தயாரித்த கப்பல் பணிமனைகளைப் பதிவு செய்கின்றன."
    },
    source: { en: "Thanjavur Big Temple Records", ta: "பெருவுடையார் கோயில் பதிவுகள்" }
  },
  {
    title: { en: "Palm-Leaf Manuscript Network", ta: "ஓலைச்சுவடி பரிமாற்ற வலை" },
    description: {
      en: "Jain and Saivite mutts circulated preserved palm-leaf manuscripts across Madurai, Kanchipuram, and Sri Lanka.",
      ta: "மதுரை, காஞ்சிப்புரம் மற்றும் இலங்கையை இணைத்து ஜைனரும் சைவ மதக்களும் ஓலைச்சுவடிகளை பரிமாறின."
    },
    source: { en: "Madurai Mutt Records", ta: "மதுரை மடப் பதிவுகள்" }
  }
];

const HERO_CONTENT = {
  tagline: createBilingualContent(
    "Stone Age to Modern Era • World's First Civilization",
    "கற்காலத்திலிருந்து நவீனயுகம் வரை • உலகின் முதல் நாகரிகம்"
  ),
  headline: createBilingualContent(
    "Tamil Heritage: The Pride of 5000+ Years",
    "தமிழர் பாரம்பரியம்: 5000+ ஆண்டுகளின் பெருமை"
  ),
  intro: createBilingualContent(
    "Trace Tamil civilization from Attirampakkam stone tools to Sangam ports and living classical arts—an unbroken 5000+ year continuum.",
    "அட்டிராம்பாக்கம் கற்கால கருவிகளிலிருந்து சங்க துறைமுகங்களும் உயிர்ப் பாரம்பரியக் கலைகளும் விரியும் 5000+ ஆண்டுக் தொடர்ச்சியை உணருங்கள்."
  ),
  detail: createBilingualContent(
    "Discover the Pandyas — the earliest kingdom of the southern land, and the roots of one of the world’s earliest civilizations. Learn who the Pandyans were, their capital Madurai, the Malla rulers, and the legends of Kumari Kandam. Explore the history, culture, and enduring legacy of Tamilakam’s people, beginning with the ancient Pandyas.",
    "தென் நிலத்தின் முதன்மையான இராச்சியமான பாண்டியர்களை அறியுங்கள் — உலகின் தொன்மையான நாகரிகங்களுள் ஒன்றின் வேர்களாகும். பாண்டியர்கள் யார், அவர்களின் தலைநகரம் மதுரை, மள்ளர் ஆட்சி, குமரி கண்டம் பற்றிய புராணங்கள் மற்றும் தமிழ் நாடு (தமிழகம்) மக்கள் வரலாறு, பண்பாடு மற்றும் பாரம்பரியத்தை ஆராயுங்கள்."
  ),
  cta: createBilingualContent(
    "Explore Tamil Heritage",
    "தமிழ் பாரம்பரியத்தை ஆராயுங்கள்"
  )
};

const FEATURED_TEMPLES = [
  {
    name: { en: "Brihadeeswarar Temple", ta: "பிரகதீஸ்வரர் கோவில்" },
    location: { en: "Thanjavur", ta: "தஞ்சாவூர்" },
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop",
    era: { en: "1010 CE • Chola", ta: "1010 • சோழர்கள்" },
    style: { en: "Granite Dravidian superstructure", ta: "கருங்கல் திராவிடக் கட்டிடம்" },
    feature: { en: "Granite vimana & bronze artistry", ta: "கருங்கல் விமானம் மற்றும் வெண்கலக் கலை" },
    highlights: [
      { en: "216-ft vimana sculpted from monolithic blocks", ta: "ஒற்றை கருங்கல்லில் செதுக்கப்பட்ட 216 அடி விமானம்" },
      { en: "UNESCO-listed Chola mural conservation labs", ta: "யுனெஸ்கோ அங்கீகாரமுடைய சோழர் சுவர் ஓவிய ஆய்வகம்" }
    ],
    insight: {
      en: "Daily ritual fire offerings still follow 11th-century liturgical manuals preserved on copper plates.",
      ta: "செம்புத் தகடுகளில் காப்புவிக்கப்பட்ட 11ஆவது நூற்றாண்டு வழிபாட்டு நூல்களைப் பின்பற்றி அனுதின தீபாராதனைகள் நடைபெறுகின்றன."
    },
    cta: { en: "Trace the Chola legacy", ta: "சோழ பரம்பரையைச் சேர்" },
    route: "/resources",
    description: {
      en: "Raja Raja Chola I’s masterpiece crowned with a 216-ft vimana carved from single granite blocks.",
      ta: "216 அடி உயர கருங்கல் விமானத்துடன் ராஜராஜ சோழரின் அற்புதக் கட்டிடம்."
    }
  },
  {
    name: { en: "Meenakshi Temple", ta: "மீனாட்சி கோவில்" },
    location: { en: "Madurai", ta: "மதுரை" },
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&h=600&fit=crop",
    era: { en: "16th CE • Nayak", ta: "16ம் நூற்றாண்டு • நாயக்கர்கள்" },
    style: { en: "Polychrome stucco Dravidian", ta: "பல நிறச் சிற்ப திராவிட வடிவம்" },
    feature: { en: "1,000-pillared mandapam", ta: "1,000 தூண் மண்டபம்" },
    highlights: [
      { en: "Celestial wedding pageantry during Chithirai festival", ta: "சித்திரைத் திருவிழாவில் தேவர்களுக்கும் மீனாட்சிக்கும் நடக்கும் கல்யாண ஊர்வலம்" },
      { en: "Hall of Thousand Pillars with playable stone drums", ta: "இசைமுரசுகளை ஒலிக்கச் செய்யும் ஆயிரம் தூண் மண்டபம்" }
    ],
    insight: {
      en: "Temple artisans repaint 33,000 narrative panels every 12 years in a community-led ritual.",
      ta: "33,000 புராணப் பலகைகளை ஒவ்வொரு 12 ஆண்டுகளுக்கும் ஒருமுறை சமூக முன்னிலையில் சிற்பிகள் மறுபுதுப்பிக்கின்றனர்."
    },
    cta: { en: "Immerse in Madurai", ta: "மதுரையில் மூழ்குதல்" },
    route: "/events",
    description: {
      en: "Vibrant stucco gopurams narrating celestial wedding legends and sacred tank rituals.",
      ta: "சூழ்நிலை புராணங்களை சிற்பங்களால் கூறும் வண்ணமய கோபுரங்களும் சுமார் புனித குளமும்."
    }
  },
  {
    name: { en: "Shore Temple", ta: "கடற்கரை கோவில்" },
    location: { en: "Mahabalipuram", ta: "மகாபலிபுரம்" },
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop",
    era: { en: "8th CE • Pallava", ta: "8ம் நூற்றாண்டு • பல்லவர்" },
    style: { en: "Granite pancharatha towers", ta: "கருங்கல் பஞ்சரத கோபுர வடிவம்" },
    feature: { en: "Granite twin shrines", ta: "கருங்கல் இரட்டை சன்னதிகள்" },
    highlights: [
      { en: "Marine erosion buffers built with ancient granite breakwaters", ta: "பண்டைய கருங்கல் அலைத் தடை அமைப்புகளால் கடல் கரையரிப்பு தடுப்பு" },
      { en: "Sunrise rituals aligned to Bay of Bengal horizon", ta: "கிழக்கு கடற்கரைக் கோட்டின் உதயக்கதிர்களுக்கு ஏற்ப கிழமை வழிபாடுகள்" }
    ],
    insight: {
      en: "Archaeologists uncovered a submerged temple cluster offshore after the 2004 tsunami.",
      ta: "2004 சுனாமிக்குப் பிறகு கடல் அடியில் மறைந்திருந்த கோவில்கள் தொகுதியை புவியியல் ஆய்வாளர்கள் கண்டறிந்தனர்."
    },
    cta: { en: "Walk the Pallava coast", ta: "பல்லவர் கடலோரம் நடைபோடு" },
    route: "/gallery",
    description: {
      en: "Mariner’s landmark etched with Narasimha panels, safeguarding coastal trade routes.",
      ta: "கரை காவலனாக விளங்கும் நரசிம்ம பலகைகள் கொண்ட கருங்கல் சன்னதிகள்."
    }
  }
];

const HERITAGE_CHRONICLES = [
  {
    name: { en: "Ajanta Caves", ta: "அஜந்தா குகைகள்" },
    era: { en: "2nd BCE Paintings", ta: "கி.மு. 2 ஆம் நூற்றாண்டு ஓவியங்கள்" },
    region: { en: "Aurangabad, Maharashtra", ta: "ஔரங்காபாத், மகாராஷ்டிரா" },
    summary: {
      en: "Buddhist monastic caves with vivid murals narrating Jataka tales and maritime trade.",
      ta: "ஜாதகக் கதைகள் மற்றும் கடல்சார் வர்த்தகத்தை விவரிக்கும் புத்த பிக்குவ்களின் ஓவிய குகைகள்."
    },
    image: "https://images.unsplash.com/photo-1631104490418-b31b1c9ff0a4?w=1000&h=700&fit=crop"
  },
  {
    name: { en: "Ellora Temples", ta: "எல்லோரா கோவில்கள்" },
    era: { en: "7th Century Rock-cut", ta: "7ம் நூற்றாண்டு வெட்டிக் கோவில்" },
    region: { en: "Verul, Maharashtra", ta: "வெரூல், மகாராஷ்டிரா" },
    summary: {
      en: "Kailasanatha complex showcasing Shaiva, Vaishnava, and Buddhist craftsmanship in one ridge.",
      ta: "சைவ, வைணவ, புத்த கலைநயத்தை ஒரே பரப்பில் ஒருங்கிணைக்கும் கையில் சநாதர் தொகுதி."
    },
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1000&h=700&fit=crop"
  },
  {
    name: { en: "Hampi Ruins", ta: "ஹம்பி இடிபாடுகள்" },
    era: { en: "14th Century Vijayanagara", ta: "14ம் நூற்றாண்டு விஜயநகரம்" },
    region: { en: "Karnataka, Tungabhadra", ta: "கர்நாடகா, துங்கபத்ரா" },
    summary: {
      en: "Granite mandapams, bazaar streets, and musical pillars narrating maritime Tamil trade links.",
      ta: "கிரானைட் மண்டபங்கள், சந்தைத் தெருக்கள், இசைக் கம்பங்கள் தமிழர் கடல்சார் வணிகத் தொடர்புகளை சங்கதிப்பவை."
    },
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1000&h=700&fit=crop"
  }
];

const FIVE_LANDS = [
  {
    key: 'kurinji',
    accent: '#C0C0C0',
    gradient: 'linear-gradient(135deg, rgba(192,192,192,0.10), rgba(211,211,211,0.15))',
    name: { en: 'Kurinji', ta: 'குறிஞ்சி' },
    poetic: {
      en: 'Mist-wrapped peaks where drums and lovers meet.',
      ta: 'மூடுபனிக் குன்றுகளில் முரசும் இணையும் காதலும்.'
    },
    description: {
      en: 'Mountain highlands thriving on honey, hill tribes, and Murugan devotion. The rhythm of the parai echoes through slopes painted indigo every twelve years.',
      ta: 'மலைத் தேனும் மலை மக்கள் வாழ்க்கையும் முருகன் பக்தியும் துடிக்கும் மலை நிலம். பன்னிரண்டு ஆண்டுகளுக்கு ஒருமுறை மலரும் குறிஞ்சி ஊதா நிறத்தில் நிலத்தை மறைக்கும்.'
    },
    tags: [
      { en: 'Mountain Highlands', ta: 'மலை நிலம்' },
      { en: 'Deity • Murugan', ta: 'தெய்வம் • முருகன்' },
      { en: 'Mood • Union', ta: 'உணர்வு • இணைவு' }
    ],
    highlights: [
      {
        en: 'Honey gatherers and warrior bards guard sacred passes with parai rhythms.',
        ta: 'புனிதக் குன்று வழிகளை காப்பவர்களாக தேன்வாங்கிகள், முரசுக் கவியர்கள் நிற்பர்.'
      },
      {
        en: 'Kurinji blossoms every twelve years turning the hills indigo—a celestial calendar for poets.',
        ta: 'பன்னிரண்டு ஆண்டுகளுக்கு ஒருமுறை மலரும் குறிஞ்சி மலர்கள் மலைகளை நீலநிறமாக்கி, கவிஞர்களுக்கு வானக் காலண்டராகிறது.'
      }
    ],
    cta: { en: 'Experience Kurinji Stories', ta: 'குறிஞ்சி நிலக் கதைகளை அறிய' },
    route: '/lands'
  },
  {
    key: 'mullai',
    accent: '#C0C0C0',
    gradient: 'linear-gradient(135deg, rgba(192,192,192,0.10), rgba(211,211,211,0.15))',
    name: { en: 'Mullai', ta: 'முல்லை' },
    poetic: {
      en: 'Forest hearths where patient love awaits the hunter.',
      ta: 'காட்டுப்பன்னையில் வேட்டைக்காரனை காத்திருக்கும் அமைதியான காதல்.'
    },
    description: {
      en: 'Pastoral forests of bamboo groves, cowherds, and Mayon’s flute. Evening lamps glow in leaf-thatched hamlets while stories of waiting kindle the hearth.',
      ta: 'மூங்கில் காடும் மாட்டுக் காளைகளும் மாயோன் புலலும் பாடும் காட்டுப்புறை. மாராய்ச்சி சொற்களுடன் ஓலை கூரைகளில் விளக்குகள் ஜொலிக்கிறது.'
    },
    tags: [
      { en: 'Forests & Pastures', ta: 'காடு & பசும்புல்' },
      { en: 'Deity • Mayon', ta: 'தெய்வம் • மாயோன்' },
      { en: 'Mood • Patience', ta: 'உணர்வு • காத்திருப்பு' }
    ],
    highlights: [
      {
        en: 'Ayar shepherds braid flowers into cattle horns for twilight festivals.',
        ta: 'ஆயர் மாட்டுத் தலையில் மலர்களை அலங்கரித்து மாலை விழாவை நடத்துவர்.'
      },
      {
        en: 'Folklore of Kannagi’s resilience travels through night-long story circles.',
        ta: 'கன்னகியின் மனவலிமை கதைகள் இரவெங்கும் சொல்லிக்கொண்டே அலைகின்றன.'
      }
    ],
    cta: { en: 'Walk the Mullai Trails', ta: 'முல்லை பாதையில் நட' },
    route: '/lands'
  },
  {
    key: 'marutham',
    accent: '#C0C0C0',
    gradient: 'linear-gradient(185deg, rgba(192,192,192,0.10), rgba(211,211,211,0.15))',
    name: { en: 'Marutham', ta: 'மருதம்' },
    poetic: {
      en: 'Fertile river plains where drums call farmers to dawn markets.',
      ta: 'நதிக் கரையின் செழிப்பில் மங்கலவாத்தியம் விவசாயிகளை விடியற்கால சந்தைக்கு அழைக்கிறது.'
    },
    description: {
      en: 'Rice paddies, river ports, and vibrant marketplaces honoured by Indra. Love and humour bloom amidst bustling town squares and bardic debates.',
      ta: 'அரிசித் தடங்கள், நதி துறைமுகங்கள், அலைமோதும் சந்தைகள் இந்திரன் அருளால் செழிக்கின்றன. கேளிக்கை வட்டாரங்களில் அன்பும் நகைச்சுவையும் மலர்கின்றன.'
    },
    tags: [
      { en: 'Fertile Plains', ta: 'செறிந்து வளமான புலம்' },
      { en: 'Deity • Indra', ta: 'தெய்வம் • இந்திரன்' },
      { en: 'Mood • Domestic Life', ta: 'உணர்வு • இல்லற வாழ்வு' }
    ],
    highlights: [
      {
        en: 'Marutham festivals stage pavai koothu theatre with satire and social reform.',
        ta: 'மருதம் திருவிழாக்களில் பாவைக்கூத்து நகைச்சுவையோடு சமூக சீர்திருத்தத்தைச் சொல்கிறது.'
      },
      {
        en: 'Flood-fed granaries nourish poets who compose on justice and governance.',
        ta: 'வெள்ளநீர் கொண்ட கூடங்கற்கள் நீதியும் ஆட்சியும் பாடும் பொதிகைகளைத் தாங்குகின்றன.'
      }
    ],
    cta: { en: 'Discover Marutham Life', ta: 'மருத நில வாழ்க்கையை காண' },
    route: '/lands'
  },
  {
    key: 'neithal',
    accent: '#C0C0C0',
    gradient: 'linear-gradient(185deg, rgba(192,192,192,0.10), rgba(211,211,211,0.15))',
    name: { en: 'Neithal', ta: 'நெய்தல்' },
    poetic: {
      en: 'Sea breeze ballads of fisher folk awaiting returning sails.',
      ta: 'திரும்பும் படகுகளை காத்திருக்கும் மீனவர்களின் கடற்காற்றுக் கவிதைகள்.'
    },
    description: {
      en: 'Lagoons, salt pans, and ocean trade blessed by Varunan. Conch calls announce pearl dives while seafarers map constellations above tidal shrines.',
      ta: 'குளங்கள், உப்பு பெருக்கு, கடல் வணிகம் வருணன் அருளால் செழிக்கின்றன. சங்கு ஒலி முத்து மூழ்கலை அறிவிக்க, கடல் பயணிகள் விண்மீன் வரைபடங்களை வாசிக்கின்றனர்.'
    },
    tags: [
      { en: 'Coast & Estuaries', ta: 'கடற்கரை & ஆற்றுத் துறை' },
      { en: 'Deity • Varunan', ta: 'தெய்வம் • வருணன்' },
      { en: 'Mood • Longing', ta: 'உணர்வு • ஏக்கம்' }
    ],
    highlights: [
      {
        en: 'Pearl fishers chant to steady breath before deep dives in the Gulf of Mannar.',
        ta: 'மன்னார் வளைகுடாவில் ஆழ்கடலில் இறங்குவதற்கு முன் முத்துப் பிடிப்பவர்கள் மந்திரங்களைப் பாடி மூச்சை முறைப்படுத்துவார்கள்.'
      },
      {
        en: 'Seaside sangams record arrivals from Rome, Lanka, and Southeast Asia.',
        ta: 'கடற்கரை சங்கங்கள் ரோமா, இலங்கை, தெற்காசிய வருகைகளை பதிவு செய்கின்றன.'
      }
    ],
    cta: { en: 'Sail the Neithal Coast', ta: 'நெய்தல் கடற்கரை வழி' },
    route: '/lands'
  },
  {
    key: 'palai',
    accent: '#C0C0C0',
    gradient: 'linear-gradient(185deg, rgba(192,192,192,0.10), rgba(211,211,211,0.15))',
    name: { en: 'Palai', ta: 'பாலை' },
    poetic: {
      en: 'Sun-scarred trails where warriors seek valor and belonging.',
      ta: 'கதிரவன் காய்ந்த வழிகளில் வீரரும் தன் பொருளும் தேடும் பயணம்.'
    },
    description: {
      en: 'Arid heartlands born from drought-struck Mullai, guarded by Korravai. Caravan marches, heroic ballads, and drought rites move with the desert wind.',
      ta: 'வறட்சியால் மாறிய முல்லை நிலம் பாலையானது; கொற்றவை காவல் காக்கும். கரவான் ஊர்வலங்கள், வீரப் பாடல்கள், வறட்சி வழிபாடுகள் பாலைவனக் காற்றோடு பயணிக்கின்றன.'
    },
    tags: [
      { en: 'Arid Heartlands', ta: 'வறண்ட உள்ளகம்' },
      { en: 'Deity • Korravai', ta: 'தெய்வம் • கொற்றவை' },
      { en: 'Mood • Quest', ta: 'உணர்வு • தேடல்' }
    ],
    highlights: [
      {
        en: 'Wayfarers map hidden wells and share drought lore at desert rest stones.',
        ta: 'பாலைவன விரைவு கற்களருகே மறைந்த கிணறுகளை அடையாளம் காட்டி வறட்சிக் கதைகளைப் பகிர்கிறார்கள்.'
      },
      {
        en: 'Warrior women perform ferocious kuthu dances before returning battalions.',
        ta: 'திரும்பும் படை அணிகள் முன் வீர பெண்கள் வீரம் குய்த்துக் குத்தாட்டத்தைக் காட்சிப்படுத்துகின்றனர்.'
      }
    ],
    cta: { en: 'Traverse the Palai Routes', ta: 'பாலை வழிகளை கட' },
    route: '/lands'
  }
];

const FEATURED_KURAL = {
  title: { en: 'Thirukkural of the Day', ta: 'இன்றைய திருக்குறள்' },
  coupletTamil: [
    'அனிச்சமும் அன்னத்தின் தூவியும் மாதர்',
    'அடிக்கு நெருஞ்சிப் பழம்.'
  ],
  meaning: {
    ta: 'அனிச்ச மலராயினும், அன்னப்பறவை இறகாயினும் இரண்டுமே நெருஞ்சிக் கல்லைப் போல குத்தக்கூடியவை போலக் காணப்படுகின்றன; என் காதலியின் காலடிகள் அதைவிட மென்மையாக உள்ளன.',
    en: 'Even the tender anicham bloom or the swan’s feather pricks like the nerunji thorn when compared to the softness of my beloved’s feet.'
  },
  translation: "The soft flower and the swan's down are like nettles to the feet of the fair."
};

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={counterRef}>{count.toLocaleString()}{suffix}</span>;
};

function getRandomFactIndex() {
  return Math.floor(Math.random() * FACTS.length);
}

export default function Home() {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const isTamil = (i18n.language || '').startsWith('ta');
  const statsQuoteFontSize = isTamil
    ? { xs: '1.5rem', sm: '2.1rem', md: '2.4rem' }
    : { xs: '1.8rem', sm: '2.5rem', md: '3rem' };
  const statsQuoteLineHeight = isTamil ? 1.2 : 1.3;
  const statsQuoteLetterSpacing = isTamil ? 0.4 : 0.1;
  const navigate = useNavigate();
  const [factIndex, setFactIndex] = useState(getRandomFactIndex());
  const [libraryBooksVisible, setLibraryBooksVisible] = useState(false);
  const [meenkodiSrc, setMeenkodiSrc] = useState(MeenkodiImage);
  const libraryRef = useRef(null);

  const heritageSteps = [
    {
      number: '01',
      title: t('home.timeline.cards.discovery.title'),
      description: t('home.timeline.cards.discovery.description'),
      action: () => navigate('/explore'),
      actionLabel: t('home.timeline.cards.discovery.cta')
    },
    {
      number: '02',
      title: t('home.timeline.cards.preservation.title'),
      description: t('home.timeline.cards.preservation.description'),
      action: () => navigate('/resources'),
      actionLabel: t('home.timeline.cards.preservation.cta')
    },
    {
      number: '03',
      title: t('home.timeline.cards.outreach.title'),
      description: t('home.timeline.cards.outreach.description'),
      action: () => navigate('/events'),
      actionLabel: t('home.timeline.cards.outreach.cta')
    }
  ];
  const collaborationPartners = [
    {
      name: "UNESCO Heritage Council",
      region: t('home.collaborations.partnerRegions.global'),
      focus: t('home.collaborations.partnerFocus.heritage')
    },
    {
      name: "Institute of Indology",
      region: t('home.collaborations.partnerRegions.india'),
      focus: t('home.collaborations.partnerFocus.research')
    },
    {
      name: "South Asia Conservation Lab",
      region: t('home.collaborations.partnerRegions.singapore'),
      focus: t('home.collaborations.partnerFocus.conservation')
    },
    {
      name: "Tamil Diaspora Cultural Forum",
      region: t('home.collaborations.partnerRegions.diaspora'),
      focus: t('home.collaborations.partnerFocus.programs')
    },
    {
      name: "Digital Heritage Collective",
      region: t('home.collaborations.partnerRegions.europe'),
      focus: t('home.collaborations.partnerFocus.digital')
    },
    {
      name: "World Oral Traditions Alliance",
      region: t('home.collaborations.partnerRegions.africa'),
      focus: t('home.collaborations.partnerFocus.community')
    }
  ];
  // recognitionHighlights removed along with the recognition section
  const contactSocials = [
    { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/the_meenkodi/" },
    { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/meeenkodi" },
    { Icon: YouTube, label: "YouTube", href: "https://www.youtube.com/@the_Meenkodi" },
    { Icon: Email, label: "Email", href: "mailto:themeenkodi@gmail.com" },
  ];
  const tinaiDisplayOrder = ['kurinji', 'mullai', 'marutham', 'neithal', 'palai'];
  const tinaiAreaMap = {
    kurinji: 'kurinji',
    mullai: 'mullai',
    marutham: 'marutham',
    neithal: 'neithal',
    palai: 'palai'
  };
  const defaultCardCta = t('home.collaborations.cardCta', { defaultValue: 'Learn More' });
  // missionPillars removed along with the mission section
  const signatureInitiatives = [
    {
      icon: <CollectionsBookmark sx={{ fontSize: 36, color: '#b61c1c' }} />,
      title: t('home.initiatives.library.title'),
      description: t('home.initiatives.library.description'),
      action: () => navigate('/resources'),
      actionLabel: t('home.initiatives.library.cta')
    },
    {
      icon: <MuseumIcon sx={{ fontSize: 36, color: '#b61c1c' }} />,
      title: t('home.initiatives.museum.title'),
      description: t('home.initiatives.museum.description'),
      action: () => navigate('/gallery'),
      actionLabel: t('home.initiatives.museum.cta')
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 36, color: '#b61c1c' }} />,
      title: t('home.initiatives.education.title'),
      description: t('home.initiatives.education.description'),
      action: () => navigate('/articles'),
      actionLabel: t('home.initiatives.education.cta')
    },
    {
      icon: <TrendingUp sx={{ fontSize: 36, color: '#b61c1c' }} />,
      title: t('home.initiatives.field.title'),
      description: t('home.initiatives.field.description'),
      action: () => navigate('/events'),
      actionLabel: t('home.initiatives.field.cta')
    }
  ];
  const communityActions = [
    {
      heading: t('home.community.engage.volunteer.title'),
      description: t('home.community.engage.volunteer.description'),
      action: () => navigate('/events'),
      actionLabel: t('home.community.engage.volunteer.cta')
    },
    {
      heading: t('home.community.engage.donate.title'),
      description: t('home.community.engage.donate.description'),
      action: () => navigate('/resources'),
      actionLabel: t('home.community.engage.donate.cta')
    }
  ];

  useEffect(() => {
    setFactIndex(getRandomFactIndex());
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLibraryBooksVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (libraryRef.current) {
      observer.observe(libraryRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const baseImage = new Image();
    baseImage.crossOrigin = 'anonymous';
    baseImage.src = MeenkodiImage;
    baseImage.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setMeenkodiSrc(MeenkodiImage);
        return;
      }
      ctx.drawImage(baseImage, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 245 && g > 245 && b > 245) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setMeenkodiSrc(canvas.toDataURL('image/png'));
    };
    baseImage.onerror = () => setMeenkodiSrc(MeenkodiImage);
  }, []);

  return (
    <Box sx={{ bgcolor: "#fff", color: "#111", fontFamily: "'Inter', 'Arial', sans-serif" }}>
      <SEO {...pageSEO.home} />

      {/* HERO SECTION removed as requested */}

      {/* OUR HERITAGE PROCESS */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: "#fdfcfa",
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: { xs: '140px', md: '200px' },
            background: 'linear-gradient(180deg, rgba(245,243,240,0.98) 0%, rgba(253,252,250,0.9) 40%, rgba(253,252,250,0) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 4, md: 6, lg: 8 }, position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 5, md: 8 },
              alignItems: 'center'
            }}
          >
            {/* Content Section - LEFT SIDE */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 58%' }, width: '100%' }}>
              <Stack spacing={{ xs: 3.5, md: 4.5 }}>
                <Box>
                  <Typography
                    variant="overline"
                    className="text-scan-animation"
                    data-text={getContent(HERO_CONTENT.tagline)}
                    sx={{
                      letterSpacing: 3,
                      fontSize: { xs: 10.5, md: 11.5 },
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#8B0000',
                      display: 'block',
                      mb: { xs: 3, md: 2 },
                      lineHeight: { xs: 2.8, sm: 2.2, md: 1.6 },
                      wordSpacing: { xs: '0.14em', md: '0.1em' }
                    }}
                  >
                    {getContent(HERO_CONTENT.tagline)}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2rem', sm: '2.4rem', md: '2.8rem' },
                      lineHeight: 1.2,
                      color: '#2c1810',
                      letterSpacing: '-0.02em',
                      mb: 1,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto'
                    }}
                  >
                    {getContent(HERO_CONTENT.headline)}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#5d4e37',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.08rem' },
                    textAlign: 'justify'
                  }}
                >
                  {getContent(HERO_CONTENT.intro)}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#7a6b5a',
                    lineHeight: 1.75,
                    fontSize: { xs: '0.92rem', md: '0.98rem' },
                    textAlign: 'justify'
                  }}
                >
                  {getContent(HERO_CONTENT.detail)}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/explore')}
                  sx={{
                    alignSelf: 'flex-start',
                    mt: 2,
                    borderRadius: '8px',
                    px: 4.5,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    borderWidth: 2,
                    background: 'linear-gradient(135deg, rgba(139,0,0,0.05) 0%, rgba(218,165,32,0.05) 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#daa520',
                      bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                      color: '#fff',
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                    }
                  }}
                >
                  {getContent(HERO_CONTENT.cta)}
                </Button>
              </Stack>
            </Box>

            {/* 3D Meenkodi Emblem - RIGHT SIDE */}
            <Box
              sx={{
                flex: { xs: '1 1 100%', md: '0 0 42%' },
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  width: { xs: '280px', sm: '320px', md: '380px', lg: '420px' },
                  height: { xs: '280px', sm: '320px', md: '380px', lg: '420px' },
                  position: 'relative',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  filter: 'drop-shadow(0 12px 30px rgba(139,0,0,0.25))',
                  transform: 'perspective(1200px) rotateY(-8deg) rotateX(3deg)',
                  bgcolor: 'transparent',
                  '&:hover': {
                    transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1.08)',
                    filter: 'drop-shadow(0 18px 40px rgba(139,0,0,0.35))'
                  }
                }}
              >
                <Box
                  component="img"
                  src={meenkodiSrc}
                  alt="Meenkodi - Twin Fish Emblem of Pandiya Dynasty"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    bgcolor: 'transparent'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Featured Thirukkural Card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          mt: { xs: 4, md: 6 },
          mb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '28px',
              p: { xs: 3.5, md: 5 },
              background: 'linear-gradient(140deg, rgba(255,248,238,0.96), rgba(255,232,210,0.96))',
              border: '1px solid rgba(210,140,70,0.22)',
              boxShadow: '0 32px 80px rgba(90,40,12,0.18)',
              display: 'grid',
              gap: { xs: 3, md: 4 },
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' },
              alignItems: 'stretch'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: '22px',
                p: { xs: 2.5, md: 3 },
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(210,140,70,0.2)',
                color: '#3b1c0a',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 2.2
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(140deg, rgba(255,230,200,0.65), rgba(255,245,235,0.95))',
                  p: { xs: 1.5, md: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 18px 32px rgba(120,60,20,0.18)'
                }}
              >
                <Box
                  component="img"
                  src="https://m.media-amazon.com/images/I/51ox-wC5UNL.jpg"
                  alt={i18n.language === 'ta' ? 'திருக்குறள் சிறப்பு பதிப்பு' : 'Thirukkural special edition cover'}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: { xs: 200, md: 240 },
                    objectFit: 'contain',
                    borderRadius: 2,
                    mixBlendMode: 'multiply',
                    filter: 'drop-shadow(0 16px 26px rgba(60,30,10,0.22))'
                  }}
                />
              </Box>
              {/* Removed Translation subtitle as requested */}
            </Paper>

            <Stack
              spacing={3}
              sx={{
                pl: { md: 2 },
                justifyContent: 'center',
                textAlign: { xs: 'center', md: 'left' },
                alignItems: { xs: 'center', md: 'flex-start' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <FormatQuoteRounded sx={{ fontSize: 42, color: '#8b4513' }} />
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: 5,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#8b4513'
                  }}
                >
                  {FEATURED_KURAL.title[i18n.language] || FEATURED_KURAL.title.en}
                </Typography>
              </Box>

              {/* Show only Tamil in Tamil mode, only English in English mode */}
              {/* Always show Tamil kural, and show meaning in Tamil or English based on language */}
              <>
                <Box>
                  {FEATURED_KURAL.coupletTamil.map((line, index) => (
                    <Typography
                      key={`featured-kural-line-${index}`}
                      variant="h5"
                      sx={{
                        fontFamily: "'Noto Serif Tamil', serif",
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        color: '#2c1810'
                      }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#5d4e37',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.05rem' }
                  }}
                >
                  {i18n.language === 'ta' ? FEATURED_KURAL.meaning.ta : FEATURED_KURAL.meaning.en}
                </Typography>
              </>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* ARCHAEOLOGY SPOTLIGHT */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 7, md: 10 } }}>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 3.5, sm: 5, md: 9, lg: 11 },
            py: { xs: 2, md: 3 },
            maxWidth: { lg: '1400px', xl: '1500px' }
          }}
        >
          <Grid
            container
            spacing={{ xs: 5, md: 8 }}
            alignItems="center"
            justifyContent={{ xs: 'center', md: 'center' }}
          >
            <Grid
              item
              xs={12}
              md={5.2}
              order={{ xs: 1, md: 2 }}
              sx={{
                display: 'flex',
                justifyContent: { md: 'center' },
                px: { xs: 0.5, md: 2 }
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))' },
                  gridTemplateRows: { xs: 'repeat(2, auto)' },
                  gap: { xs: 2, md: 2.4 },
                  maxWidth: 520,
                  mx: 'auto'
                }}
              >
                <Box
                  component="img"
                  src="https://www.tnpscthervupettagam.com/assets/home/media/general/original_image/c02.png"
                  alt="Tamil heritage researcher documenting palm leaf manuscripts"
                  loading="lazy"
                  sx={{
                    gridColumn: '1 / 2',
                    gridRow: '1 / span 2',
                    width: '100%',
                    height: { xs: 220, sm: 240, md: 340 },
                    objectFit: 'cover',
                    borderRadius: 4,
                    boxShadow: '0 20px 42px rgba(0,0,0,0.12)',
                    transition: 'transform 0.45s ease, box-shadow 0.45s ease',
                    transform: 'translateY(0)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 26px 48px rgba(0,0,0,0.18)'
                    }
                  }}
                />
                <Box
                  component="img"
                  src="https://ancienttamilcivilization.wordpress.com/wp-content/uploads/2015/03/final-attirampakkam.jpg"
                  alt="Conservator restoring iron-age relic"
                  loading="lazy"
                  sx={{
                    gridColumn: '2 / 3',
                    gridRow: '1 / 2',
                    width: '100%',
                    height: { xs: 175, sm: 195, md: 205 },
                    objectFit: 'cover',
                    borderRadius: 4,
                    boxShadow: '0 18px 36px rgba(0,0,0,0.12)',
                    transition: 'transform 0.45s ease, box-shadow 0.45s ease',
                    transform: 'translateY(0)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 24px 44px rgba(0,0,0,0.18)'
                    }
                  }}
                />
                <Box
                  component="img"
                  src="https://ichef.bbci.co.uk/news/480/cpsprodpb/f819/live/f053c790-e843-11ef-9e8a-870423bc5283.jpg.webp"
                  alt="Inscribed copper plate from Sangam era"
                  loading="lazy"
                  sx={{
                    gridColumn: '2 / 3',
                    gridRow: '2 / 3',
                    width: '100%',
                    height: { xs: 175, sm: 195, md: 205 },
                    objectFit: 'cover',
                    borderRadius: 4,
                    boxShadow: '0 18px 36px rgba(0,0,0,0.12)',
                    transition: 'transform 0.45s ease, box-shadow 0.45s ease',
                    transform: 'translateY(0)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 24px 44px rgba(0,0,0,0.18)'
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6.8}
              order={{ xs: 2, md: 1 }}
              sx={{
                display: 'flex',
                justifyContent: { md: 'center' },
                px: { xs: 0.5, md: 2 }
              }}
            >
              <Stack
                spacing={{ xs: 2.75, md: 3 }}
                sx={{
                  maxWidth: 560,
                  mx: { md: 'auto' }
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: 3,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#8b0000'
                    }}
                  >
                    {t('home.ironAge.overline')}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2.3rem', md: '2.7rem' },
                      color: '#2c1810',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {t('home.ironAge.title')}
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#5d4e37',
                    lineHeight: 1.68,
                    maxWidth: 510
                  }}
                >
                  {t('home.ironAge.description')}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#7a6b5a',
                    lineHeight: 1.65,
                    maxWidth: 480
                  }}
                >
                  {t('home.ironAge.callToAction')}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/explore')}
                  sx={{
                    alignSelf: 'flex-start',
                    borderRadius: '999px',
                    px: 3.8,
                    py: 1.1,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'none',
                    borderWidth: 2,
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    background: 'linear-gradient(135deg, rgba(139,0,0,0.05) 0%, rgba(218,165,32,0.05) 100%)',
                    '&:hover': {
                      borderColor: '#daa520',
                      color: '#fff',
                      bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('home.ironAge.button')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* EXPLORE CATEGORIES SLIDER */}
      <Box sx={{ bgcolor: "#0a0908", py: { xs: 10, md: 12 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="overline"
              sx={{
                color: "#daa520",
                letterSpacing: 3,
                fontWeight: 700,
                fontSize: "0.85rem",
                mb: 1,
                display: "block"
              }}
            >
              {i18n.language === 'ta' ? 'ஆராய்ந்து அறியுங்கள்' : 'DISCOVER HERITAGE'}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.3rem", md: "2.7rem" },
                background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: -0.5,
              }}
            >
              {i18n.language === 'ta' ? 'தமிழ் பாரம்பரியம்' : 'Explore Tamil Heritage'}
            </Typography>
          </Box>

          <DeferredSection fallback="none" rootMargin="200px">
            <CourseSyllabusSlider
              slides={EXPLORE_CATEGORIES}
              ctaLabel={i18n.language === 'ta' ? 'அனைத்தையும் ஆராயுங்கள்' : 'Explore All Categories'}
              ctaRoute="/explore"
            />
          </DeferredSection>
        </Container>
      </Box>

      {/* LIBRARY & ARCHIVES */}
      <Box ref={libraryRef} sx={{ bgcolor: '#fff', py: { xs: 10, md: 13 }, overflow: 'hidden' }}>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1.5, sm: 5, md: 8, lg: 10 },
            maxWidth: { lg: '1280px', xl: '1380px' }
          }}
        >
          <Stack spacing={{ xs: 7, md: 9 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 4, md: 5 }}
              justifyContent="space-between"
              alignItems={{ xs: 'center', md: 'center' }}
            >
              <Zoom in={libraryBooksVisible} timeout={800} style={{ transitionDelay: '100ms' }}>
                <Box
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/ta/9/95/Mee_ye_paa.jpg"
                  alt="Museums Archaeology and Culture book cover"
                  loading="lazy"
                  onClick={(e) => { e.stopPropagation(); navigate('/resources'); }}
                  sx={{
                    width: { xs: '70%', sm: '60%', md: '40%' },
                    maxWidth: 380,
                    boxShadow: '0 28px 56px rgba(0,0,0,0.24)',
                    transition: 'transform 0.5s ease',
                    transform: 'translateY(0)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                />
              </Zoom>
              <Stack
                spacing={1.8}
                sx={{
                  alignItems: { xs: 'center', md: 'flex-start' },
                  textAlign: { xs: 'center', md: 'left' },
                  flex: 1,
                  pl: { md: 4 }
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: i18n.language === 'ta'
                      ? '"Tiro Tamil", "Noto Serif Tamil", "Hind Madurai", serif'
                      : '"Tangerine", "Great Vibes", "Allura", "Playfair Display", cursive',
                    fontSize: {
                      xs: i18n.language === 'ta' ? '3.2rem' : '3.6rem',
                      sm: i18n.language === 'ta' ? '3.6rem' : '4.2rem',
                      md: i18n.language === 'ta' ? '3.8rem' : '4.6rem'
                    },
                    fontWeight: i18n.language === 'ta' ? 600 : 700,
                    color: '#3c2b2b',
                    lineHeight: i18n.language === 'ta' ? 1.1 : 1.05,
                    letterSpacing: i18n.language === 'ta' ? 0.6 : 0.3,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                >
                  {(() => {
                  const topTxt = getContent(LIBRARY_ARCHIVES_HEADING.top) || '';
                  const left = topTxt.replace('&', '').trim();
                  return (
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-grid',
                        gridTemplateColumns: { xs: 'auto auto', md: 'auto min-content auto' },
                        gridTemplateRows: 'auto auto',
                        columnGap: { xs: 0.6, md: 2.2 },
                        alignItems: 'center',
                        transition: 'all 0.24s ease',
                        '&:hover .lib-amp': {
                          transform: 'translateY(-2px) scale(1.02)',
                          color: '#b61c1c'
                        },
                        '&:hover .lib-archives': {
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          gridColumn: '1 / 2',
                          gridRow: '1 / 2',
                          fontSize: { xs: '2.6rem', md: i18n.language === 'ta' ? '3.6rem' : '4.2rem' },
                          fontWeight: i18n.language === 'ta' ? 600 : 700,
                          lineHeight: 0.95
                        }}
                      >
                        {left}
                      </Box>

                      <Box
                        component="span"
                        className="lib-amp"
                        sx={{
                          gridColumn: { xs: '2 / 3', md: '2 / 3' },
                          gridRow: { xs: '1 / 3', md: '1 / 3' },
                          color: '#8B0000',
                          fontSize: { xs: '2.6rem', md: '3.6rem' },
                          fontWeight: 800,
                          alignSelf: 'center',
                          transform: 'none',
                          ml: { xs: 0, md: 0 },
                          transition: 'all 0.28s ease'
                        }}
                        aria-hidden
                      >
                        &
                      </Box>

                      <Box
                        component="span"
                        className="lib-archives"
                        sx={{
                          gridColumn: { xs: '2 / 3', md: '3 / 4' },
                          gridRow: '2 / 3',
                          justifySelf: 'start',
                          mt: { xs: 0.2, md: 0.6 },
                          ml: { xs: 0.6, md: 0.8 },
                          fontSize: { xs: '2.4rem', md: i18n.language === 'ta' ? '3.6rem' : '4rem' },
                          lineHeight: 0.95,
                          transition: 'all 0.28s ease'
                        }}
                      >
                        {getContent(LIBRARY_ARCHIVES_HEADING.bottom)}
                      </Box>
                    </Box>
                  );
                })()}
                </Typography>
                <Box
                  sx={{
                    width: { xs: '52%', sm: '44%', md: '88%' },
                    borderBottom: '1.5px solid rgba(60,43,43,0.5)',
                    alignSelf: { xs: 'center', md: 'stretch' }
                  }}
                />
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 6, md: 7 }}
              justifyContent="space-between"
              alignItems={{ xs: 'center', md: 'flex-start' }}
              onClick={() => navigate('/resources')}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/resources'); }}
              sx={{ cursor: 'pointer' }}
            >
              <Stack
                spacing={3}
                sx={{
                  maxWidth: { xs: 540, md: 580 },
                  textAlign: { xs: 'center', md: 'left' },
                  alignItems: { xs: 'center', md: 'flex-start' }
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#5d4e37',
                    lineHeight: 1.85,
                    fontSize: { xs: '1.06rem', md: '1.12rem' }
                  }}
                >
                  {LIBRARY_ARCHIVES_DESCRIPTION_SEGMENTS.map((segment, idx) => (
                    <Box
                      key={`library-desc-${idx}`}
                      component="span"
                      sx={{
                        fontWeight: segment.highlight ? 700 : 400,
                        color: segment.highlight ? '#8b4513' : 'inherit'
                      }}
                    >
                      {getContent(segment.text)}
                    </Box>
                  ))}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={(e) => { e.stopPropagation(); navigate('/resources'); }}
                  sx={{
                    alignSelf: { xs: 'center', md: 'flex-start' },
                    borderRadius: '999px',
                    px: 4.6,
                    py: 1.1,
                    fontWeight: 700,
                    letterSpacing: 0.7,
                    textTransform: 'none',
                    borderWidth: 2,
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    background: 'linear-gradient(135deg, rgba(139,0,0,0.05) 0%, rgba(218,165,32,0.05) 100%)',
                    '&:hover': {
                      borderColor: '#daa520',
                      color: '#fff',
                      bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {getContent(LIBRARY_ARCHIVES_CTA)}
                </Button>
              </Stack>
              <Zoom in={libraryBooksVisible} timeout={800} style={{ transitionDelay: '300ms' }}>
                <Box
                  component="img"
                  src="https://www.harappa.com/sites/default/files/images/the-indus-robinson.jpg"
                  alt="The Indus civilization book cover"
                  loading="lazy"
                  onClick={(e) => { e.stopPropagation(); navigate('/resources'); }}
                  sx={{
                    width: { xs: '72%', sm: '60%', md: '38%' },
                    maxWidth: 370,
                    boxShadow: '0 28px 56px rgba(0,0,0,0.24)',
                    transition: 'transform 0.5s ease',
                    transform: 'translateY(0)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                />
              </Zoom>
            </Stack>
          </Stack>
        </Container>
      </Box>


      {/* STATISTICS SECTION */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: "#000", color: "#fff", overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          {STATS_QUOTES.map((quote, index) => (
            <Typography
              key={`stats-quote-${index}`}
              variant="h2"
              align="center"
              sx={{
                fontWeight: 700,
                mb: index === STATS_QUOTES.length - 1 ? 6 : 1.5,
                fontSize: statsQuoteFontSize,
                color: "#fff",
                lineHeight: statsQuoteLineHeight,
                letterSpacing: statsQuoteLetterSpacing,
                fontStyle: "italic",
                whiteSpace: { xs: 'normal', md: 'nowrap' },
                wordBreak: { xs: 'break-word', md: 'normal' }
              }}
            >
              {getContent(quote)}
            </Typography>
          ))}
          <Grid container spacing={4} justifyContent="center">
            <Grid container spacing={4} justifyContent="center" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                      color: "#DAA520",
                      lineHeight: 1
                    }}
                  >
                    <AnimatedCounter end={850} suffix="k+" />
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "#999", fontSize: { xs: "0.75rem", md: "1rem" }, textTransform: "uppercase", letterSpacing: { xs: 0.5, md: 1 }, whiteSpace: { xs: "normal", md: "nowrap" } }}>
                    {t('home.stats.artifacts')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center", py: 2 }}><Typography variant="h1" sx={{
                  fontWeight: 900, mb: 1, fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  color: "#DAA520",
                  lineHeight: 1
                }}
                >
                  <AnimatedCounter end={380} suffix="+" />
                </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "#999", fontSize: { xs: "0.75rem", md: "1rem" }, textTransform: "uppercase", letterSpacing: { xs: 0.5, md: 1 }, whiteSpace: { xs: "normal", md: "nowrap" } }}>
                    {t('home.stats.manuscripts')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center", py: 2 }}><Typography variant="h1" sx={{
                  fontWeight: 900, mb: 1, fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  color: "#DAA520",
                  lineHeight: 1
                }}
                >
                  <AnimatedCounter end={65} suffix="+" />
                </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "#999", fontSize: { xs: "0.75rem", md: "1rem" }, textTransform: "uppercase", letterSpacing: { xs: 0.5, md: 1 }, whiteSpace: { xs: "normal", md: "nowrap" } }}>
                    {t('home.stats.temples')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center", py: 2 }}><Typography variant="h1" sx={{
                  fontWeight: 900, mb: 1, fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  color: "#DAA520",
                  lineHeight: 1
                }}
                >
                  <AnimatedCounter end={150} suffix="+" />
                </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "#999", fontSize: { xs: "0.75rem", md: "1rem" }, textTransform: "uppercase", letterSpacing: { xs: 0.5, md: 1 }, whiteSpace: { xs: "normal", md: "nowrap" } }}>
                    {t('home.stats.scholars')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* Five Lands Atlas */}
      <DeferredSection fallback="skeleton" rootMargin="300px">
        <Box
          sx={{
            bgcolor: '#fff',
            py: { xs: 7, md: 10 }
          }}
        >

          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 3.5, sm: 5, md: 9, lg: 11 },
              py: { xs: 2, md: 3 },
              maxWidth: { lg: '1400px', xl: '1500px' }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 3,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#8b0000'
                }}
              >
                {i18n.language === 'ta' ? 'தமிழின் திணைகள் வரைபடம்' : 'Tamil Tinai Atlas'}
              </Typography>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.3rem', md: '2.7rem' },
                  color: '#1f130c',
                  letterSpacing: '-0.01em',
                  mt: 1
                }}
              >
                {i18n.language === 'ta'
                  ? 'தமிழரின் ஐந்து திணைகள்'
                  : 'Five Lands of Tamil Heritage'}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: 560,
                  mx: 'auto',
                  mt: 2,
                  color: 'rgba(31,19,12,0.8)',
                  lineHeight: 1.68
                }}
              >
                {i18n.language === 'ta'
                  ? 'தமிழரின் அடையாளத்தை வடிவமைக்கும் பண்டைய ஐந்து திணைகளைச் சுற்றி இயங்கும் உயிர்த்துடிப்பு கொண்ட சுற்றுச்சுழல் காட்சி.'
                  : 'An immersive atlas of the classical eco-cultural tinai regions. Explore how landscape, deity, mood, and livelihoods cycle to keep Tamil heritage living and interlinked.'}
              </Typography>
            </Box>

            <Box>
              {/* Remove SVG paths */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: { xs: 5, md: 6 }
                }}
              >
                {/* Kurinji - TOP LEFT */}
                {(() => {
                  const land = FIVE_LANDS.find((item) => item.key === 'kurinji');
                  if (!land) return null;
                  const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'kurinji');
                  return (
                    <Paper
                      key="five-lands-card-kurinji"
                      elevation={0}
                      sx={{
                        alignSelf: { xs: 'stretch', md: 'flex-start' },
                        width: { xs: '100%', md: '85%' },
                        ml: { md: 0 },
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${land.accent}40`,
                        boxShadow: `0 16px 48px ${land.accent}25`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 24px 64px ${land.accent}35`,
                          borderColor: `${land.accent}60`
                        }
                      }}
                    >
                      {/* Image Section - Left Side */}
                      <Box sx={{
                        width: { xs: '100%', md: '40%' },
                        height: { xs: 280, md: 420 },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <OptimizedImage
                          src={KurnjiImage}
                          alt="Kurinji Landscape"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          skeletonSx={{ bgcolor: `${land.accent}15` }}
                        />
                      </Box>

                      {/* Content Section - Right Side */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: '60%' },
                          p: { xs: 4, md: 5 },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          bgcolor: '#fff',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Badge */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#8b4513',
                            letterSpacing: 2.5,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>

                        {/* Title */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#2c1810',
                            letterSpacing: '-0.02em',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>

                        {/* Poetic Quote */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: 'italic',
                            color: '#8b4513',
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            lineHeight: 1.7,
                            fontWeight: 500
                          }}
                        >
                          {getContent(land.poetic)}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#5d4e37',
                            lineHeight: 1.75,
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}
                        >
                          {getContent(land.description)}
                        </Typography>

                        {/* CTA Button */}
                        <Button
                          variant="outlined"
                          endIcon={<ArrowForward fontSize="small" />}
                          onClick={() => navigate(land.route)}
                          sx={{
                            alignSelf: 'flex-start',
                            mt: 1,
                            borderRadius: '999px',
                            px: 3.5,
                            py: 1.2,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            letterSpacing: 0.5,
                            textTransform: 'none',
                            borderColor: '#8B0000',
                            color: '#8B0000',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#daa520',
                              bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                              color: '#fff',
                              transform: 'translateX(5px)',
                              boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {getContent(land.cta)}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })()}

                {/* Mullai - RIGHT */}
                {(() => {
                  const land = FIVE_LANDS.find((item) => item.key === 'mullai');
                  if (!land) return null;
                  const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'mullai');
                  return (
                    <Paper
                      key="five-lands-card-mullai"
                      elevation={0}
                      sx={{
                        alignSelf: { xs: 'stretch', md: 'flex-end' },
                        width: { xs: '100%', md: '85%' },
                        mr: { md: 0 },
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${land.accent}40`,
                        boxShadow: `0 16px 48px ${land.accent}25`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 24px 64px ${land.accent}35`,
                          borderColor: `${land.accent}60`
                        }
                      }}
                    >
                      {/* Content Section - Left Side */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: '60%' },
                          p: { xs: 4, md: 5 },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          bgcolor: '#fff',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Badge */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#8b4513',
                            letterSpacing: 2.5,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>

                        {/* Title */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#2c1810',
                            letterSpacing: '-0.02em',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>

                        {/* Poetic Quote */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: 'italic',
                            color: '#8b4513',
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            lineHeight: 1.7,
                            fontWeight: 500
                          }}
                        >
                          {getContent(land.poetic)}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#5d4e37',
                            lineHeight: 1.75,
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}
                        >
                          {getContent(land.description)}
                        </Typography>

                        {/* CTA Button */}
                        <Button
                          variant="outlined"
                          endIcon={<ArrowForward fontSize="small" />}
                          onClick={() => navigate(land.route)}
                          sx={{
                            alignSelf: 'flex-start',
                            mt: 1,
                            borderRadius: '999px',
                            px: 3.5,
                            py: 1.2,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            letterSpacing: 0.5,
                            textTransform: 'none',
                            borderColor: '#8B0000',
                            color: '#8B0000',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#daa520',
                              bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                              color: '#fff',
                              transform: 'translateX(5px)',
                              boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {getContent(land.cta)}
                        </Button>
                      </Box>

                      {/* Image Section - Right Side */}
                      <Box sx={{
                        width: { xs: '100%', md: '40%' },
                        height: { xs: 280, md: 420 },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <OptimizedImage
                          src={MullaiImage}
                          alt="Mullai Landscape"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          skeletonSx={{ bgcolor: `${land.accent}15` }}
                        />
                      </Box>
                    </Paper>
                  );
                })()}

                {/* Marutham - LEFT */}
                {(() => {
                  const land = FIVE_LANDS.find((item) => item.key === 'marutham');
                  if (!land) return null;
                  const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'marutham');
                  return (
                    <Paper
                      key="five-lands-card-marutham"
                      elevation={0}
                      sx={{
                        alignSelf: { xs: 'stretch', md: 'flex-start' },
                        width: { xs: '100%', md: '85%' },
                        ml: { md: 0 },
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${land.accent}40`,
                        boxShadow: `0 16px 48px ${land.accent}25`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 24px 64px ${land.accent}35`,
                          borderColor: `${land.accent}60`
                        }
                      }}
                    >
                      {/* Image Section - Left Side */}
                      <Box sx={{
                        width: { xs: '100%', md: '40%' },
                        height: { xs: 280, md: 420 },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <OptimizedImage
                          src={MaruthamImage}
                          alt="Marutham Landscape"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          skeletonSx={{ bgcolor: `${land.accent}15` }}
                        />
                      </Box>

                      {/* Content Section - Right Side */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: '60%' },
                          p: { xs: 4, md: 5 },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          bgcolor: '#fff',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Badge */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#8b4513',
                            letterSpacing: 2.5,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>

                        {/* Title */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#2c1810',
                            letterSpacing: '-0.02em',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>

                        {/* Poetic Quote */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: 'italic',
                            color: '#8b4513',
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            lineHeight: 1.7,
                            fontWeight: 500
                          }}
                        >
                          {getContent(land.poetic)}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#5d4e37',
                            lineHeight: 1.75,
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}
                        >
                          {getContent(land.description)}
                        </Typography>

                        {/* CTA Button */}
                        <Button
                          variant="outlined"
                          endIcon={<ArrowForward fontSize="small" />}
                          onClick={() => navigate(land.route)}
                          sx={{
                            alignSelf: 'flex-start',
                            mt: 1,
                            borderRadius: '999px',
                            px: 3.5,
                            py: 1.2,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            letterSpacing: 0.5,
                            textTransform: 'none',
                            borderColor: '#8B0000',
                            color: '#8B0000',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#daa520',
                              bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                              color: '#fff',
                              transform: 'translateX(5px)',
                              boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {getContent(land.cta)}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })()}

                {/* Neithal - RIGHT */}
                {(() => {
                  const land = FIVE_LANDS.find((item) => item.key === 'neithal');
                  if (!land) return null;
                  const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'neithal');
                  return (
                    <Paper
                      key="five-lands-card-neithal"
                      elevation={0}
                      sx={{
                        alignSelf: { xs: 'stretch', md: 'flex-end' },
                        width: { xs: '100%', md: '85%' },
                        mr: { md: 0 },
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${land.accent}40`,
                        boxShadow: `0 16px 48px ${land.accent}25`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 24px 64px ${land.accent}35`,
                          borderColor: `${land.accent}60`
                        }
                      }}
                    >
                      {/* Content Section - Left Side */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: '60%' },
                          p: { xs: 4, md: 5 },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          bgcolor: '#fff',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Badge */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#8b4513',
                            letterSpacing: 2.5,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>

                        {/* Title */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#2c1810',
                            letterSpacing: '-0.02em',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>

                        {/* Poetic Quote */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: 'italic',
                            color: '#8b4513',
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            lineHeight: 1.7,
                            fontWeight: 500
                          }}
                        >
                          {getContent(land.poetic)}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#5d4e37',
                            lineHeight: 1.75,
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}
                        >
                          {getContent(land.description)}
                        </Typography>

                        {/* CTA Button */}
                        <Button
                          variant="outlined"
                          endIcon={<ArrowForward fontSize="small" />}
                          onClick={() => navigate(land.route)}
                          sx={{
                            alignSelf: 'flex-start',
                            mt: 1,
                            borderRadius: '999px',
                            px: 3.5,
                            py: 1.2,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            letterSpacing: 0.5,
                            textTransform: 'none',
                            borderColor: '#8B0000',
                            color: '#8B0000',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#daa520',
                              bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                              color: '#fff',
                              transform: 'translateX(5px)',
                              boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {getContent(land.cta)}
                        </Button>
                      </Box>

                      {/* Image Section - Right Side */}
                      <Box sx={{
                        width: { xs: '100%', md: '40%' },
                        height: { xs: 280, md: 420 },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <OptimizedImage
                          src={NeithalImage}
                          alt="Neithal Landscape"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          skeletonSx={{ bgcolor: `${land.accent}15` }}
                        />
                      </Box>
                    </Paper>
                  );
                })()}

                {/* Palai - LEFT */}
                {(() => {
                  const land = FIVE_LANDS.find((item) => item.key === 'palai');
                  if (!land) return null;
                  const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'palai');
                  return (
                    <Paper
                      key="five-lands-card-palai"
                      elevation={0}
                      sx={{
                        alignSelf: { xs: 'stretch', md: 'flex-start' },
                        width: { xs: '100%', md: '85%' },
                        ml: { md: 0 },
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${land.accent}40`,
                        boxShadow: `0 16px 48px ${land.accent}25`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 24px 64px ${land.accent}35`,
                          borderColor: `${land.accent}60`
                        }
                      }}
                    >
                      {/* Image Section - Left Side */}
                      <Box sx={{
                        width: { xs: '100%', md: '40%' },
                        height: { xs: 280, md: 420 },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <OptimizedImage
                          src={PalaiImage}
                          alt="Palai Landscape"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          skeletonSx={{ bgcolor: `${land.accent}15` }}
                        />
                      </Box>

                      {/* Content Section - Right Side */}
                      <Box
                        sx={{
                          width: { xs: '100%', md: '60%' },
                          p: { xs: 4, md: 5 },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          bgcolor: '#fff',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Badge */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#8b4513',
                            letterSpacing: 2.5,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>

                        {/* Title */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#2c1810',
                            letterSpacing: '-0.02em',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>

                        {/* Poetic Quote */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: 'italic',
                            color: '#8b4513',
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            lineHeight: 1.7,
                            fontWeight: 500
                          }}
                        >
                          {getContent(land.poetic)}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#5d4e37',
                            lineHeight: 1.75,
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}
                        >
                          {getContent(land.description)}
                        </Typography>

                        {/* CTA Button */}
                        <Button
                          variant="outlined"
                          endIcon={<ArrowForward fontSize="small" />}
                          onClick={() => navigate(land.route)}
                          sx={{
                            alignSelf: 'flex-start',
                            mt: 1,
                            borderRadius: '999px',
                            px: 3.5,
                            py: 1.2,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            letterSpacing: 0.5,
                            textTransform: 'none',
                            borderColor: '#8B0000',
                            color: '#8B0000',
                            borderWidth: 2,
                            '&:hover': {
                              borderColor: '#daa520',
                              bgcolor: 'linear-gradient(135deg, #8b0000 0%, #daa520 100%)',
                              color: '#fff',
                              transform: 'translateX(5px)',
                              boxShadow: '0 6px 20px rgba(139,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {getContent(land.cta)}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })()}
              </Box>
            </Box>
          </Container>
        </Box>
      </DeferredSection>

      {/* MUSEUM ARCHIVES TEAM */}
      <DeferredSection fallback="skeleton" rootMargin="300px">
        <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "#0A0908", overflow: 'hidden' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 4, md: 6, lg: 8 } }}>
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "1.6rem", md: "2rem" },
                color: "#DAA520",
                letterSpacing: "-0.01em"
              }}
            >
              {t('home.team.museum.title')}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                mb: 1.5,
                color: "#ccc",
                maxWidth: 700,
                mx: "auto",
                fontSize: { xs: "0.9rem", md: "0.95rem" },
                lineHeight: 1.5
              }}
            >
              {t('home.team.museum.subtitle')}
            </Typography>
            <Divider sx={{ width: 60, height: 3, bgcolor: "#8B0000", mx: "auto", mb: 4, borderRadius: 2 }} />

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} justifyContent="center">
              {/* Top row: 4 dynasties */}
              {[0, 1, 2, 3].map(idx => (
                <Grid item xs={12} sm={6} md={3} key={TEAM_MUSEUM[idx].name.en} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card
                    elevation={0}
                    sx={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      mt: 6,
                      mb: 6,
                      overflow: "hidden",
                      bgcolor: "#111",
                      borderRadius: 3,
                      p: 2.5,
                      textAlign: 'center',
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        bgcolor: "#8B0000",
                        transform: "scaleX(0)",
                        transition: "transform 0.4s ease"
                      },
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: "0 20px 60px rgba(139,0,0,0.4)",
                        bgcolor: "#222",
                        borderColor: "#8B0000",
                        "&::before": {
                          transform: "scaleX(1)"
                        }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        border: "2px solid #daa520",
                        bgcolor: "#fff",
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 12px 32px rgba(218,165,32,0.5)"
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={TEAM_MUSEUM[idx].flag}
                        alt={TEAM_MUSEUM[idx].name[i18n.language] || TEAM_MUSEUM[idx].name.en}
                        loading="lazy"
                        sx={{
                          width: "85%",
                          height: "85%",
                          objectFit: "contain"
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "#daa520", fontSize: { xs: "0.9rem", md: "0.95rem" }, lineHeight: 1.2 }}>
                      {TEAM_MUSEUM[idx].name[i18n.language] || TEAM_MUSEUM[idx].name.en}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc", fontWeight: 500, fontSize: "0.8rem", lineHeight: 1.4, px: 0.5 }}>
                      {TEAM_MUSEUM[idx].title[i18n.language] || TEAM_MUSEUM[idx].title.en}
                    </Typography>
                  </Card>
                </Grid>
              ))}
              {/* Bottom row: LTTE centered */}
              <Grid item xs={12} sm={8} md={4} sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 0.5, md: -1 } }}>
                <Card
                  elevation={0}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: { xs: 1, md: -2 },
                    mb: 3,
                    overflow: "hidden",
                    bgcolor: "#111",
                    borderRadius: 3,
                    p: 2.5,
                    textAlign: 'center',
                    "&:hover": {
                      transform: "translateY(-12px)",
                      boxShadow: "0 20px 60px rgba(139,0,0,0.4)",
                      bgcolor: "#222",
                      borderColor: "#8B0000"
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      border: "2px solid #daa520",
                      bgcolor: "#fff",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 12px 32px rgba(218,165,32,0.5)"
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={TEAM_MUSEUM[4].flag}
                      alt={TEAM_MUSEUM[4].name[i18n.language] || TEAM_MUSEUM[4].name.en}
                      loading="lazy"
                      sx={{
                        width: "85%",
                        height: "85%",
                        objectFit: "contain"
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "#daa520", fontSize: { xs: "0.9rem", md: "0.95rem" }, lineHeight: 1.2 }}>
                    {TEAM_MUSEUM[4].name[i18n.language] || TEAM_MUSEUM[4].name.en}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc", fontWeight: 500, fontSize: "0.8rem", lineHeight: 1.4, px: 0.5 }}>
                    {TEAM_MUSEUM[4].title[i18n.language] || TEAM_MUSEUM[4].title.en}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </DeferredSection>


      {/* COLLABORATIONS SECTION removed as requested */}


      {/* RECOGNITION SECTION removed as requested */}


      {/* WHAT WE DO SECTION removed as requested */}


      {/* DIRECTORS & HERITAGE SPECIALISTS */}
      <DeferredSection fallback="skeleton" rootMargin="300px">
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#fff" }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 5, lg: 6, xl: 8 } }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem", lg: "2.8rem" },
                color: "#000",
                letterSpacing: "-0.02em"
              }}
            >
              {t('home.team.directors.title')}
            </Typography>
            <Divider sx={{ width: 60, height: 3, bgcolor: "#8B0000", mx: "auto", mb: 6, borderRadius: 2 }} />

            <DirectorsSlider directors={TEAM_DIRECTORS} />
          </Container>
        </Box>
      </DeferredSection>

      {/* CONTACT SECTION removed as requested */}
    </Box >
  )
}
