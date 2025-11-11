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

// Comprehensive Tamil Heritage Data with Image URLs
const landsData = [
  {
    name: "Kurinji",
    type: "Kurinji",
    description: "குளிர்ச்சியுள்ள மலை நிலம்; பன்னிரண்டு ஆண்டுக்கு ஒருமுறை மலரும் குறிஞ்சி மலர் தனிச்சிறப்பு கொண்டது.",
    poetry: [
      "குறிஞ்சி மலர்கள் பன்னிரு ஆண்டுக்கு ஒருமுறை மலரும்",
      "மலைவாழ் மக்களின் வாழ்க்கை முறை"
    ],
    gods: ["முருகன்", "குறிஞ்சி தேவி"],
    flora: ["குறிஞ்சி மலர்", "சந்தன மரம்", "தேக்கு"],
    fauna: ["யானை", "கரடி", "மான்"],
    people: ["குறவர்", "மலையர்"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Neelakurinji_flowers_in_Munnar.jpg/800px-Neelakurinji_flowers_in_Munnar.jpg"
  },
  {
    name: "Mullai",
    type: "Mullai",
    description: "மேய்ச்சல் மற்றும் காட்டு வளம் நிறைந்த பசுமை நிலம்; மாட்டுப் பராமரிப்பிற்கு பெயர் பெற்ற பகுதி.",
    poetry: [
      "முல்லை நிலத்தின் இயற்கை அழகு",
      "ஆயர்களின் வாழ்க்கை முறை"
    ],
    gods: ["மாயோன் (கிருஷ்ணன்)", "பலராமன்"],
    flora: ["முல்லை", "மருதமரம்", "வேப்ப மரம்"],
    fauna: ["பசு", "எருமை", "மான்"],
    people: ["ஆயர்", "இடையர்"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Jasmine_flowers.jpg/800px-Jasmine_flowers.jpg"
  },
  {
    name: "Marutham",
    type: "Marutham",
    description: "நதிக் கரை வளம் மிகுந்த உழவு நிலம்; உழவும் குடியிருப்பும் செழிக்க ஏற்ற மத்திய நிலப்பகுதி.",
    poetry: [
      "மருத நிலத்தின் வளமான வாழ்க்கை",
      "விவசாயிகளின் முயற்சி"
    ],
    gods: ["இந்திரன்", "வருணன்"],
    flora: ["நெல்", "கரும்பு", "மருதமரம்"],
    fauna: ["நீர்க்காக்கை", "மீன்", "தவளை"],
    people: ["உழவர்", "வணிகர்"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Rice_fields_in_Tamil_Nadu.jpg/800px-Rice_fields_in_Tamil_Nadu.jpg"
  },
  {
    name: "Neithal",
    type: "Neithal",
    description: "கடற்கரை மணற்பரப்புகள், மீன்வளம், கடற்பரிவர்த்தனை வளர்ச்சி கொண்ட நீத்தல் நிலம்.",
    poetry: [
      "நெய்தல் நிலத்தின் கடல் அழகு",
      "மீனவர்களின் வீர பாரம்பரியம்"
    ],
    gods: ["வருணன்", "கடல் தேவி"],
    flora: ["நெய்தல் பூ", "புன்னை மரம்", "தென்னை"],
    fauna: ["மீன்கள்", "நண்டு", "கடல் பறவைகள்"],
    people: ["பரவர்", "நுளையர்"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Marina_Beach_Chennai.jpg/800px-Marina_Beach_Chennai.jpg"
  },
  {
    name: "Palai",
    type: "Palai",
    description: "வறண்ட பாலை நிலம்; துன்பமும் பிரிவும் குறிக்கும் திரையென தமிழ் இலக்கியத்தில் விளங்கும் பகுதி.",
    poetry: [
      "பாலை நிலத்தின் வறட்சி",
      "பிரிவின் வேதனை"
    ],
    gods: ["கொற்றவை", "துர்க்கை"],
    flora: ["முள்ளு செடிகள்", "பாலைமரம்"],
    fauna: ["சிங்கம்", "புலி", "கழுகு"],
    people: ["மறவர்", "கள்வர்"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Desert_landscape_Tamil_Nadu.jpg/800px-Desert_landscape_Tamil_Nadu.jpg"
  }
];

const kingsData = [
  {
    name: "ராஜராஜ சோழன் (Raja Raja Chola I)",
    dynasty: "சோழர் வம்சம்",
    period: "985-1014 CE",
    capital: "தஞ்சாவூர்",
    achievements: "பெரிய கோயில் கட்டியவர், கடல் கடந்த படைகள் நடத்தியவர்",
    description: "சோழ பேரரசின் மிகப்பெரிய அரசர்களில் ஒருவர். தஞ்சாவூரில் பிரகதீஸ்வரர் கோயிலைக் கட்டினார்.",
    content: "ராஜராஜ சோழன் தமிழக வரலாற்றில் ஒரு முக்கிய நபராக கருதப்படுகிறார். அவரது ஆட்சிக் காலத்தில் சோழ பேரரசு உச்சநிலையை அடைந்தது.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Raja_Raja_Chola_statue.jpg/400px-Raja_Raja_Chola_statue.jpg",
    contentSections: [
      {
        subtitle: "ஆரம்பகால வாழ்க்கை",
        content: "அருண்மொழிவர்மன் என்ற பெயருடன் பிறந்தார்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Thanjavur_Brihadeeswara_Temple.jpg/400px-Thanjavur_Brihadeeswara_Temple.jpg"
      }
    ]
  },
  {
    name: "ராஜேந்திர சோழன் (Rajendra Chola I)",
    dynasty: "சோழர் வம்சம்",
    period: "1014-1044 CE",
    capital: "கங்கைகொண்ட சோழபுரம்",
    achievements: "கங்கை நதி வரை படையெடுத்த வீர மன்னன்",
    description: "ராஜராஜ சோழனின் மகன். வடக்கே கங்கை நதி வரை படையெடுத்து வெற்றி பெற்றார்.",
    content: "கடல் கடந்த படைகளால் தென்கிழக்கு ஆசிய நாடுகளை வென்ற வீர மன்னன். கங்கைகொண்ட சோழபுரம் என்ற புதிய தலைநகரை நிறுவினார்.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Rajendra_Chola_statue.jpg/400px-Rajendra_Chola_statue.jpg",
    contentSections: [
      {
        subtitle: "வெற்றிகள்",
        content: "வடக்கே கங்கை நதி வரை படையெடுத்து வென்ற வீர மன்னன்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Gangaikonda_Cholapuram_temple.jpg/400px-Gangaikonda_Cholapuram_temple.jpg"
      }
    ]
  },
  {
    name: "கரிகால் சோழன் (Karikala Chola)",
    dynasty: "சோழர் வம்சம்",
    period: "190-120 BCE",
    capital: "உறையூர்",
    achievements: "கல்லணை கட்டிய மன்னன்",
    description: "பண்டைய சோழ மன்னன். காவேரி நதியில் கல்லணை கட்டி நீர்ப்பாசன முறையை மேம்படுத்தினார்.",
    content: "தமிழகத்தின் மிகப் பழமையான பொறியியல் சாதனையான கல்லணையைக் கட்டிய மகத்தான மன்னன்.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Karikala_Chola_statue.jpg/400px-Karikala_Chola_statue.jpg",
    contentSections: [
      {
        subtitle: "பொறியியல் சாதனை",
        content: "காவேரி நதியில் கல்லணை கட்டி நீர்ப்பாசன முறையை மேம்படுத்தினார்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Grand_Anicut_Dam.jpg/400px-Grand_Anicut_Dam.jpg"
      }
    ]
  }
];

const templesData = [
  {
    name: "பிரகதீஸ்வரர் கோயில்",
    location: "தஞ்சாவூர்",
    built: "1010 CE",
    deity: "சிவன்",
    architecture: "திராவிட கட்டிடக்கலை",
    description: "ராஜராஜ சோழன் கட்டிய உலகப் பாரம்பரியச் சின்னம்",
    content: "சோழர் கால கட்டிடக் கலைச் சிறப்பு முழுமையாகப் பிரதிபலிக்கும் பெரும் விநாயம்",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Thanjavur_Brihadeeswara_Temple.jpg/800px-Thanjavur_Brihadeeswara_Temple.jpg",
    contentSections: [
      {
        subtitle: "வரலாறு",
        content: "கி.பி. 1010ல் ராஜராஜ சோழனால் கட்டப்பட்டது",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Brihadeeswarar_temple_tower.jpg/400px-Brihadeeswarar_temple_tower.jpg"
      }
    ]
  },
  {
    name: "மீனாக்ஷி அம்மன் கோயில்",
    location: "மதுரை",
    built: "1623-1655 CE",
    deity: "பார்வதி (மீனாக்ஷி) மற்றும் சிவன் (சுந்தரேஸ்வரர்)",
    architecture: "திராவிட கட்டிடக்கலை",
    description: "மதுரையின் பெருமை பெற்ற கோயில் வளாகம்",
    content: "14 கோபுரங்கள் நிமிர்ந்த காட்சியுடன் ஆயிரம் தூண் மண்டபச் சிறப்பை தாங்கும் திருக்கோயில்",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Meenakshi_Amman_Temple_towers.jpg/800px-Meenakshi_Amman_Temple_towers.jpg",
    contentSections: [
      {
        subtitle: "கோபுரங்கள்",
        content: "14 கோபுரங்கள் கொண்ட அற்புதமான கோயில்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Meenakshi_Temple_gopuram.jpg/400px-Meenakshi_Temple_gopuram.jpg"
      }
    ]
  }
];

const dancesData = [
  {
    name: "பரதநாட்டியம்",
    style: "கிளாசிக்கல்",
    origin: "தமிழ்நாடு",
    period: "2000 ஆண்டுகள் பழமையானது",
    description: "தமிழகத்தின் பாரம்பரிய நாட்டிய வடிவம்",
    content: "இது உலகின் மிகப் பழமையான நாட்டிய வடிவங்களில் ஒன்றாகும். இதில் அடவு, நிருத்தம், நாட்டியம் ஆகிய மூன்று பகுதிகள் உள்ளன. நாதஸ்வரம், தவில், வீணை போன்ற இசைக்கருவிகள் பயன்படுத்தப்படுகின்றன.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bharatanatyam_dancer.jpg/400px-Bharatanatyam_dancer.jpg",
    contentSections: [
      {
        subtitle: "தொழில்நுட்பம்",
        content: "பரதநாட்டியத்தின் அடிப்படை நுட்பங்கள்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Classical_dance_mudra.jpg/400px-Classical_dance_mudra.jpg"
      }
    ]
  }
];

const foodsData = [
  {
    name: "சாம்பார்",
    region: "தமிழ்நாடு",
    type: "மிக்ஸ்ட் வெஜ்",
    ingredients: "துவரம் பருப்பு, காய்கறிகள், புளி, சாம்பார் பொடி",
    description: "தமிழ் உணவின் அடிப்படை குழம்பு வகை",
    significance: "தமிழர்களின் தினசரி உணவில் முக்கிய பங்கு வகிக்கும் சாம்பார்",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sambar_Tamil_food.jpg/400px-Sambar_Tamil_food.jpg",
    contentSections: [
      {
        subtitle: "செய்முறை",
        content: "பாரம்பரிய சாம்பார் செய்யும் முறை",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/South_Indian_thali.jpg/400px-South_Indian_thali.jpg"
      }
    ]
  },
  {
    name: "இட்லி",
    region: "தமிழ்நாடு",
    type: "வெஜிடேரியன்",
    ingredients: "அரிசி, உளுந்து, உப்பு",
    description: "நீராவியில் வேகவைக்கப்படும் மென்மையான உணவு",
    significance: "தமிழ் மக்களின் முக்கிய காலை உணவு",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Idli_sambar_chutney.jpg/400px-Idli_sambar_chutney.jpg"
  },
  {
    name: "தோசை",
    region: "தமிழ்நாடு",
    type: "வெஜிடேரியன்",
    ingredients: "அரிசி, உளுந்து, வெந்தயம்",
    description: "மாவை தவாவில் வார்த்து சுட்ட மொறுமொறுப்பான உணவு",
    significance: "தமிழகத்தின் பாரம்பரிய உணவு",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dosa_with_potato_curry.jpg/400px-Dosa_with_potato_curry.jpg"
  },
  {
    name: "பொங்கல்",
    region: "தமிழ்நாடு",
    type: "வெஜிடேரியன்",
    ingredients: "அரிசி, பாசிப்பருப்பு, நெய், மிளகு, சீரகம்",
    description: "அரிசியும் பருப்பும் சேர்த்து வெந்தயத்துடன் சமைத்த உணவு",
    significance: "திருவிழாக்களில் படைக்கும் நைவேத்தியம்",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ven_pongal.jpg/400px-Ven_pongal.jpg"
  },
  {
    name: "ரசம்",
    region: "தமிழ்நாடு",
    type: "வெஜிடேரியன்",
    ingredients: "தக்காளி, புளி, மிளகு, சீரகம், கொத்தமல்லி",
    description: "புளிப்பும் காரமும் கலந்த சூப் வகை",
    significance: "சாதத்துடன் கலந்து உண்ணும் குழம்பு",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/South_Indian_Rasam.jpg/400px-South_Indian_Rasam.jpg"
  },
  {
    name: "பாயசம்",
    region: "தமிழ்நாடு",
    type: "இனிப்பு",
    ingredients: "அரிசி, பால், சர்க்கரை, ஏலக்காய், முந்திரி",
    description: "பாலில் அரிசி வேகவைத்து சர்க்கரை சேர்த்த இனிப்பு",
    significance: "விழாக்காலங்களில் தயாரிக்கும் இனிப்பு வகை",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Rice_kheer_payasam.jpg/400px-Rice_kheer_payasam.jpg"
  }
];

const festivalsData = [
  {
    name: "பொங்கல்",
    period: "ஜனவரி 14-17",
    type: "அறுவடை திருவிழா",
    region: "தமிழ்நாடு",
    description: "தமிழர்களின் முக்கிய அறுவடை திருவிழா",
    significance: "நான்கு நாட்கள் கொண்டாடப்படும் பொங்கல் திருவிழா. நன்றி செலுத்தும் பண்டிகை.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pongal_Festival.jpg/400px-Pongal_Festival.jpg",
    contentSections: [
      {
        subtitle: "நான்கு வகை பொங்கல்",
        content: "போகி, தை பொங்கல், மாட்டுப் பொங்கல், காணும் பொங்கல்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Pongal_celebration.jpg/400px-Pongal_celebration.jpg"
      }
    ]
  },
  {
    name: "தீபாவளி",
    period: "அக்டோபர்-நவம்பர்",
    type: "ஒளி திருவிழா",
    region: "தமிழ்நாடு முழுவதும்",
    description: "தீமையின் மீது நன்மையின் வெற்றியைக் கொண்டாடும் திருவிழா",
    significance: "விளக்கேற்றி இருளை அகற்றும் ஒளித் திருவிழா",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Diwali_celebration_Tamil_Nadu.jpg/400px-Diwali_celebration_Tamil_Nadu.jpg",
    contentSections: [
      {
        subtitle: "பட்டாசு வெடிப்பு",
        content: "பாரம்பரியமாக பட்டாசு வெடித்து கொண்டாடப்படும் திருவிழா",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Diwali_fireworks.jpg/400px-Diwali_fireworks.jpg"
      }
    ]
  }
];

const clothingData = [
  {
    name: "கான்சீவரம் பட்டுப்புடவை",
    region: "காஞ்சிபுரம்",
    type: "பட்டு புடவை",
    material: "தூய பட்டு",
    description: "உலகப்புகழ் பெற்ற தமிழ் பாரம்பரிய உடை",
    significance: "கான்சீவரம் புடவைகள் தமிழ்ப் பண்பாட்டின் அடையாளம். கைத்தறி மற்றும் பட்டு நெசவு தொழில்நுட்பம் பயன்படுத்தப்படுகிறது. மாம்பழம், யானை, மயில் போன்ற வடிவங்கள் பயன்படுத்தப்படுகின்றன.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kanchipuram_silk_saree.jpg/400px-Kanchipuram_silk_saree.jpg",
    contentSections: [
      {
        subtitle: "நெசவு தொழில்நுட்பம்",
        content: "பாரம்பரிய கைத்தறி நெசவு முறைகள்",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Silk_weaving_loom.jpg/400px-Silk_weaving_loom.jpg"
      }
    ]
  }
];

const literatureData = [
  {
    title: "திருக்குறள்",
    author: "திருவள்ளுவர்",
    period: "கி.பி. 1-5ம் நூற்றாண்டு",
    genre: "நீதி நூல்",
    description: "உலகப்புகழ் பெற்ற தமிழ் இலக்கிய நூல்",
    content: "1330 குறள்களைக் கொண்ட அற நூல். மூன்று பாலாக பிரிக்கப்பட்டது: அறத்துப்பால், பொருட்பால், காமத்துப்பால்",
    language: "தமிழ்",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Thirukkural_manuscript.jpg/400px-Thirukkural_manuscript.jpg",
    contentSections: [
      {
        subtitle: "முதல் குறள்",
        content: "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Thiruvalluvar_statue.jpg/400px-Thiruvalluvar_statue.jpg"
      }
    ]
  }
];

const articlesData = [
  {
    title: "சங்க இலக்கியம்: தமிழ் கவிதையின் பொற்காலம்",
    content: "சங்க இலக்கியம் தென்னிந்தியத் தமிழின் தொன்மைச் செய்யுள் பெருவளம்; கி.மு. 300 முதல் கி.பி. 300 வரை உருவானது.",
    author: "டாக்டர் இளம்பரிதி",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sangam_poetry_manuscript.jpg/400px-Sangam_poetry_manuscript.jpg",
    categories: ["Literature", "History"],
    publishedDate: new Date("2024-01-15")
  },
  {
    title: "பிரகதீஸ்வரர் கோயில்: தஞ்சாவூரின் பெரிய கோயில்",
    content: "11ம் நூற்றாண்டில் ராஜராஜ சோழன் கட்டிய இத்திருத்தலம் திராவிடக் கட்டிட வடிவின் உச்சத் திகழ்வு; உலகப் பாரம்பரியப் பட்டம் பெற்றது.",
    author: "கவிதா எஸ்.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Thanjavur_Brihadeeswara_Temple.jpg/400px-Thanjavur_Brihadeeswara_Temple.jpg",
    categories: ["Architecture", "Religion"],
    publishedDate: new Date("2024-02-20")
  }
];

const galleryData = [
  {
    title: "தஞ்சாவூர் ஓவியம்",
    description: "வளமான வண்ணங்களுக்கும் மேற்பரப்பு வளமைக்கும் பெயர்பெற்ற பாரம்பரிய தென்னிந்திய ஓவிய பாணி.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tanjore_painting_Krishna.jpg/400px-Tanjore_painting_Krishna.jpg",
    category: "Art",
    artist: "பாரம்பரிய கலைஞர்கள்",
    year: "17-18ம் நூற்றாண்டு"
  },
  {
    title: "மதுரை மீனாக்ஷி கோயில்",
    description: "மதுரையில் வைகை ஆற்றின் தெற்கு கரையில் அமைந்த ஒரு வரலாற்று சிறப்புமிக்க இந்து கோயில்.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Meenakshi_Amman_Temple_towers.jpg/400px-Meenakshi_Amman_Temple_towers.jpg",
    category: "Architecture",
    location: "மதுரை",
    period: "திராவிட"
  },
  {
    title: "பரதநாட்டிய கலைஞர்",
    description: "தமிழகத்தின் பாரம்பரிய நாட்டிய வடிவத்தை நிகழ்த்தும் கலைஞர்.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bharatanatyam_performance.jpg/400px-Bharatanatyam_performance.jpg",
    category: "Dance",
    artform: "பரதநாட்டியம்"
  }
];

const eventsData = [
  {
    title: "பொங்கல் திருவிழா",
    description: "ஜனவரியில் தமிழர்களால் கொண்டாடப்படும் அறுவடை திருவிழா.",
    date: new Date("2024-01-15"),
    location: "தமிழ்நாடு, இந்தியா",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Pongal_Festival_celebration.jpg/400px-Pongal_Festival_celebration.jpg",
  type: "பண்பாட்டுத் திருவிழா"
  },
  {
    title: "சித்திரை திருவிழா",
    description: "மதுரையில் கொண்டாடப்படும் வருடாந்திர திருவிழா, மீனாக்ஷி மற்றும் சுந்தரேஸ்வரரின் திருக்கல்யாணத்தைக் குறிக்கும்.",
    date: new Date("2024-04-23"),
    location: "மதுரை, தமிழ்நாடு",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Chithirai_Festival_procession.jpg/400px-Chithirai_Festival_procession.jpg",
  type: "ஆன்மிகத் திருவிழா"
  }
];

const resourcesData = [
  {
    title: "சிலப்பதிகாரம் (காவியம்)",
    description: "தமிழ் இலக்கியத்தின் ஐந்து பெரும் காவியங்களில் ஒன்று.",
    link: "https://ta.wikipedia.org/wiki/சிலப்பதிகாரம்",
    type: "Book",
    author: "இளங்கோ அடிகள்"
  },
  {
    title: "ஆவணப்படம்: சோழர்கள்",
    description: "சோழ வம்சம் மற்றும் கலை கட்டிடக்கலையில் அவர்களின் பங்களிப்பு பற்றிய ஆவணப்படம்.",
    link: "https://www.youtube.com/watch?v=tamil_cholas_documentary",
    type: "Video",
    duration: "45 minutes"
  }
];

async function restoreData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Clearing existing data...");
    await Article.deleteMany({});
    await Gallery.deleteMany({});
    await Event.deleteMany({});
    await Resource.deleteMany({});
    await Land.deleteMany({});
    await King.deleteMany({});
    await Temple.deleteMany({});
    await Dance.deleteMany({});
    await Food.deleteMany({});
    await Festival.deleteMany({});
    await Clothing.deleteMany({});
    await Literature.deleteMany({});

    console.log("Restoring Tamil Heritage data with images...");

    await Land.insertMany(landsData);
    console.log(`✓ Restored ${landsData.length} Lands with images`);

    await King.insertMany(kingsData);
    console.log(`✓ Restored ${kingsData.length} Kings with images`);

    await Temple.insertMany(templesData);
    console.log(`✓ Restored ${templesData.length} Temples with images`);

    await Dance.insertMany(dancesData);
    console.log(`✓ Restored ${dancesData.length} Dance forms with images`);

    await Food.insertMany(foodsData);
    console.log(`✓ Restored ${foodsData.length} Food items with images`);

    await Festival.insertMany(festivalsData);
    console.log(`✓ Restored ${festivalsData.length} Festivals with images`);

    await Clothing.insertMany(clothingData);
    console.log(`✓ Restored ${clothingData.length} Clothing items with images`);

    await Literature.insertMany(literatureData);
    console.log(`✓ Restored ${literatureData.length} Literature works with images`);

    await Article.insertMany(articlesData);
    console.log(`✓ Restored ${articlesData.length} Articles with images`);

    await Gallery.insertMany(galleryData);
    console.log(`✓ Restored ${galleryData.length} Gallery items with images`);

    await Event.insertMany(eventsData);
    console.log(`✓ Restored ${eventsData.length} Events with images`);

    await Resource.insertMany(resourcesData);
    console.log(`✓ Restored ${resourcesData.length} Resources`);

    console.log("\n🎉 Tamil Heritage database restored successfully with all images!");
    console.log("All your data including image URLs has been recovered!");

    process.exit(0);
  } catch (err) {
    console.error("Restoration error:", err);
    process.exit(1);
  }
}

restoreData();