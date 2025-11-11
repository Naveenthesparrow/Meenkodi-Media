import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  // Fallback to local dev if not provided
  MONGO_URI = 'mongodb://127.0.0.1:27017/meenkodi';
  console.warn('⚠️  MONGO_URI not found in environment. Falling back to local MongoDB at mongodb://127.0.0.1:27017/meenkodi');
}

// Helper to make bilingual
const bi = (en, ta) => ({ en, ta });

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    const masked = MONGO_URI.replace(/:\/\/([^:@/]+)/, '://***');
    console.log(`✅ Connected to MongoDB: ${masked}\n`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB. Ensure MONGO_URI is set or local MongoDB is running.');
    console.error(err.message);
    process.exit(1);
  }

  // Use loose models so we can write bilingual fields regardless of existing schemas
  const mk = (name) => mongoose.model(name, new mongoose.Schema({}, { strict: false }), name.toLowerCase() + 's');

  const Event = mk('Event');
  const Temple = mk('Temple');
  const King = mk('King');
  const Literature = mk('Literature');
  const Dance = mk('Dance');
  const Food = mk('Food');
  const Festival = mk('Festival');
  const Clothing = mk('Clothing');
  const AncientScience = mk('AncientScience');
  const Resource = mk('Resource');
  const Gallery = mk('Gallery');
  const Article = mk('Article');

  // Data sets (concise but meaningful)
  const events = [
    {
      title: bi('Pongal Festival', 'பொங்கல் திருவிழா'),
      description: bi('Harvest festival celebrated by Tamils in January.', 'ஜனவரியில் தமிழர்களால் கொண்டாடப்படும் அறுவடை திருவிழா.'),
      location: bi('Tamil Nadu, India', 'தமிழ்நாடு, இந்தியா'),
      date: new Date('2024-01-15'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Pongal_Festival.jpg'
    },
    {
      title: bi('Chithirai Festival', 'சித்திரை திருவிழா'),
      description: bi('Annual festival in Madurai commemorating the wedding of Meenakshi and Sundareswarar.', 'மதுரையில் கொண்டாடப்படும் வருடாந்திர திருவிழா; மீனாக்ஷி மற்றும் சுந்தரேஸ்வரரின் திருக்கல்யாணத் திருவிழா.'),
      location: bi('Madurai, Tamil Nadu', 'மதுரை, தமிழ்நாடு'),
      date: new Date('2024-04-23'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Chithirai_Festival.jpg'
    },
    {
      title: bi('Deepavali', 'தீபாவளி'),
      description: bi('Festival of lights celebrating the victory of good over evil.', 'நன்மையின் தீமையின்மீது வெற்றியை கொண்டாடும் ஒளி திருவிழா.'),
      location: bi('Across Tamil Nadu', 'தமிழகமெங்கும்'),
      date: new Date('2024-11-01'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Diwali_Diyas.jpg'
    }
  ];

  const temples = [
    {
  name: bi('Meenakshi Amman Temple', 'மீனாட்சி அம்மன் கோயில்'),
  location: bi('Madurai', 'மதுரை'),
  deity: bi('Parvati (Meenakshi) & Shiva (Sundareswarar)', 'அருள்மிகு மீனாட்சி & சுந்தரேசுவரர்'),
      description: bi('Iconic Dravidian temple complex renowned for its gopurams.', 'தென்னிந்திய திராவிடக் கோயில் கலை நயத்திற்குப் பெயர் பெற்ற கோயில்.'),
      significance: bi('Major pilgrimage center of Tamil Nadu.', 'தமிழகத்தின் முக்கிய தீர்த்தஸ்தலம்.'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Meenakshi_Amman_Temple.jpg'
    },
    {
  name: bi('Brihadeeswara Temple', 'பெருவுடையார் கோயில்'),
      location: bi('Thanjavur', 'தஞ்சாவூர்'),
      deity: bi('Shiva', 'சிவன்'),
      description: bi('UNESCO World Heritage temple built by Raja Raja Chola I.', 'ராஜராஜ சோழன் கட்டிய யுனெஸ்கோ உலக பாரம்பரியக் கோயில்.'),
      significance: bi('Masterpiece of Chola architecture.', 'சோழர் கட்டிடக் கலையின் அற்புதம்.'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Thanjavur_Brihadeeswara_Temple.jpg'
    },
    {
  name: bi('Sri Ranganathaswamy Temple', 'அரங்கநாதர் திருக்கோயில்'),
  location: bi('Srirangam', 'அரங்கம்'),
  deity: bi('Ranganatha (Vishnu)', 'அரங்கநாதர் (மாயோன்)'),
      description: bi('Largest functioning Hindu temple complex in the world.', 'உலகிலேயே மிகப்பெரிய வழிபாட்டு இந்துக் கோயில் தொகுதி.'),
      significance: bi('Primary Divya Desam for Vaishnavites.', 'வைணவத் திருத்தலங்களில் முதன்மையான திவ்யதேசம்.'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Srirangam_rajagopuram.jpg'
    },
    {
      name: bi('Shore Temple', 'கரையோரக் கோயில்'),
      location: bi('Mahabalipuram', 'மகாபலிபுரம்'),
      deity: bi('Shiva & Vishnu', 'சிவன் & விஷ்ணு'),
      description: bi('Pallava-era granite temples on the Bay of Bengal coast.', 'கடற்கரை ஓரத்தில் பல்லவர் காலக் கால்கல் கோயில்கள்.'),
      significance: bi('Part of UNESCO World Heritage Site Group of Monuments.', 'யுனெஸ்கோ பாரம்பரியக் குழு நினைவுச்சின்னங்களின் பகுதியாகும்.'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Shore_Temple_Mahabalipuram.jpg'
    }
  ];

  const kings = [
    {
      name: bi('Raja Raja Chola I', 'ராஜராஜ சோழன்'),
      title: bi('Great Emperor', 'மகா மன்னன்'),
      dynasty: bi('Chola Dynasty', 'சோழர் வம்சம்'),
      period: bi('985–1014 CE', 'கி.பி. 985–1014'),
      description: bi('Built the Brihadeeswara Temple; expanded maritime power.', 'பெரியக் கோயிலை நிர்மாணித்தார்; கடல் கடந்த படைகளை நிலைநிறுத்தினார்.'),
      achievements: bi('Temple construction, naval expeditions', 'பெரிய கோயில், கடல் படைகள்'),
    },
    {
      name: bi('Rajendra Chola I', 'ராஜேந்திர சோழன்'),
      title: bi('Emperor', 'மன்னன்'),
      dynasty: bi('Chola Dynasty', 'சோழர் வம்சம்'),
      period: bi('1014–1044 CE', 'கி.பி. 1014–1044'),
      description: bi('Extended Chola influence up to the Ganges; founded Gangaikonda Cholapuram.', 'கங்கை நதிவரை செல்வாக்கை விரித்தார்; கங்கைகொண்டசோழபுரத்தை நிறுவினார்.'),
      achievements: bi('Northern campaigns, capital expansion', 'வடக்கு படையெடுப்புகள், தலைநகர் விரிவு'),
    },
    {
      name: bi('Karikala Chola', 'கரிகால சோழன்'),
      title: bi('King', 'அரசன்'),
      dynasty: bi('Early Chola', 'ஆரம்ப சோழர்'),
      period: bi('c. 1st–2nd century CE', 'கி.பி. 1–2 ஆம் நூற்றாண்டு'),
      description: bi('Renowned for building the Kallanai (Grand Anicut) dam on the Kaveri.', 'காவிரியில் பெரிய அனைக்கட்டு (கல்லணை) கட்டியவர் என்று புகழ் பெற்றவர்.'),
      achievements: bi('Kallanai dam, agrarian reforms', 'கல்லணை, வேளாண் முன்னேற்றம்'),
    },
    {
      name: bi('Senguttuvan Chera', 'செங்குட்டுவன் சேரன்'),
      title: bi('Chera King', 'சேர மன்னன்'),
      dynasty: bi('Chera Dynasty', 'சேரர் வம்சம்'),
      period: bi('c. 2nd century CE', 'கி.பி. 2 ஆம் நூற்றாண்டு'),
      description: bi('Patron of the Pattini cult; associated with Silappatikaram.', 'பட்டினித் தெய்வ வழிபாட்டை ஊக்குவித்தவர்; சிலப்பதிகாரத்துடன் தொடர்புடையவர்.'),
      achievements: bi('Patronage of arts and religion', 'கலை, சமய ஆதரவு'),
    },
    {
      name: bi('Nedunjeliyan Pandya', 'நெடுஞ்செழியன் பாண்டியன்'),
      title: bi('Pandya King', 'பாண்டிய மன்னன்'),
      dynasty: bi('Pandya Dynasty', 'பாண்டியர் வம்சம்'),
      period: bi('Sangam era', 'சங்ககாலம்'),
      description: bi('Known from Sangam literature for valor and just rule.', 'சங்க இலக்கியங்களில் வீரமும் நீதியும் கொண்ட ஆட்சி செய்தவர் என குறிப்பிடப்படுகிறார்.'),
      achievements: bi('Warfare, patronage of Sangam poets', 'போர்க்கள வெற்றி, சங்கக் கவிஞர் ஆதரவு'),
    }
  ];

  const literature = [
    {
      name: bi('Thirukkural', 'திருக்குறள்'),
      author: bi('Thiruvalluvar', 'திருவள்ளுவர்'),
      period: bi('c. 1st century BCE–5th century CE', 'முதலாம் பி.மு.–ஐந்தாம் பி.பி.'),
      description: bi('Classic Tamil text of 1330 couplets on ethics, wealth, and love.', 'நற்பண்பு, பொருள், காதல் என்பவற்றை 1330 குறள்களால் எடுத்துரைக்கும் உலகப் புகழ் நூல்.'),
      significance: bi('Timeless ethical guidance for humanity.', 'மனித குலத்துக்கான காலாதீத நெறிமுறை வழிகாட்டி.')
    },
    {
      name: bi('Silappatikaram', 'சிலப்பதிகாரம்'),
      author: bi('Ilango Adigal', 'இளங்கோ அடிகள்'),
      period: bi('c. 5th–6th century CE', 'கி.பி. 5–6ஆம் நூற்றாண்டு'),
      description: bi('Epic tale of Kannagi set across Tamil kingdoms.', 'தமிழ் நாடுகளின் பின்னணியில் கண்ணகியின் காவியக் கதை.'),
      significance: bi('One of the Five Great Epics of Tamil literature.', 'தமிழின் ஐம்பெரும் காப்பியங்களில் ஒன்று.')
    },
    {
      name: bi('Manimekalai', 'மணிமேகலை'),
      author: bi('Seethalai Saathanar', 'சீதலைச் சாத்தனார்'),
      period: bi('c. 6th century CE', 'கி.பி. 6 ஆம் நூற்றாண்டு'),
      description: bi('Buddhist epic and sequel to Silappatikaram.', 'சிலப்பதிகாரத்திற்கு அடுத்த பகுதி எனக் கருதப்படும் புத்தமதக் காவியம்.'),
      significance: bi('Important source for Buddhist influence in Tamil Nadu.', 'தமிழகத்தின் புத்தமதப் பாரம்பரியம் குறித்து முக்கிய ஆதாரம்.')
    },
    {
      name: bi('Akananuru', 'அகநானூறு'),
      author: bi('Various Sangam Poets', 'பல சங்கக் கவிஞர்கள்'),
      period: bi('Sangam era', 'சங்ககாலம்'),
      description: bi('Collection of classical love-themed poems.', 'அகத்திணையைச் சேர்ந்த காதல் சார்ந்த சங்கப் பாடல்கள்.'),
      significance: bi('Key anthology of Sangam corpus.', 'சங்க இலக்கியத்தின் முதன்மைத் தொகுப்பு.')
    }
  ];

  const dances = [
    {
      name: bi('Bharatanatyam', 'பரதநாட்டியம்'),
      origin: bi('Tamil Nadu', 'தமிழ்நாடு'),
      description: bi('Classical dance form combining expression, rhythm, and grace.', 'அபிநயம், லய, அங்கசுத்தி ஆகியவற்றின் சங்கமமான தமிழ்நாட்டின் செம்மையான நடன வடிவம்.'),
      significance: bi('Evolved from temple traditions.', 'கோயில் மரபிலிருந்து பரிணமித்தது.')
    },
    {
      name: bi('Karagattam', 'கரகாட்டம்'),
      origin: bi('Tamil folk', 'தமிழ் நாட்டுப்புற'),
      description: bi('Folk dance balancing pots on the head.', 'தலையில் கரகம் வைத்து ஆடும் நாட்டுப்புற நடனம்.'),
      significance: bi('Performed in festivals and village fairs.', 'திருவிழாக்கள், கிராமத் திருவிழாக்களில் ஆடப்படும்.')
    },
    {
      name: bi('Kummi', 'கும்மி'),
      origin: bi('Tamil folk', 'தமிழ் நாட்டுப்புற'),
      description: bi('Group dance with rhythmic clapping.', 'சமமாய்த் தாளமிட்டு வட்டமிட்டு ஆடும் குழு நடனம்.'),
      significance: bi('Community bonding dance of women.', 'பெண்கள் அதிகம் ஆடும் சமூக இணைப்புப் பாங்கு.')
    },
    {
      name: bi('Parai Aattam', 'பறை ஆட்டம்'),
      origin: bi('Tamil folk', 'தமிழ் நாட்டுப்புற'),
      description: bi('Dance performed with the parai drum.', 'பறை என்ற இடைக்கருவியுடன் ஆடும் நடனம்.'),
      significance: bi('Symbol of cultural identity and resistance.', 'கலை மரபின் அடையாளமும் எதிர்ப்பின் சின்னமும்.')
    }
  ];

  const foods = [
    {
      name: bi('Idli', 'இட்லி'),
      description: bi('Soft steamed rice cakes; staple breakfast.', 'நீராவியில் வேகவைக்கும் மென்மையான காலை உணவு.'),
      ingredients: bi('Rice, urad dal, salt', 'அரிசி, உளுந்து, உப்பு'),
      region: bi('Tamil Nadu', 'தமிழ்நாடு'),
      image: ''
    },
    {
      name: bi('Dosa', 'தோசை'),
      description: bi('Crispy crepe made from fermented batter.', 'புளித்த மாவில் சுட்ட மொறு மொறுப்பான உணவு.'),
      ingredients: bi('Rice, urad dal, fenugreek', 'அரிசி, உளுந்து, வெந்தயம்'),
      region: bi('Tamil Nadu', 'தமிழ்நாடு'),
      image: ''
    },
    {
      name: bi('Sambar', 'சாம்பார்'),
      description: bi('Lentil-based vegetable stew.', 'பருப்பு கலந்த காய்கறி குழம்பு.'),
      ingredients: bi('Pigeon pea, vegetables, tamarind, spices', 'துவரம் பருப்பு, காய்கறிகள், புளி, மசாலா'),
      region: bi('Tamil Nadu', 'தமிழ்நாடு'),
      image: ''
    },
    {
      name: bi('Pongal (Ven Pongal)', 'வெண் பொங்கல்'),
      description: bi('Comforting rice and moong dal dish tempered with ghee and pepper.', 'அரிசி, பாசிப்பருப்பு கொண்டு நெய், மிளகு தாளித்து செய்யப்படும் சுவைமிகு உணவு.'),
      ingredients: bi('Rice, moong dal, ghee, pepper, cumin', 'அரிசி, பாசிப்பருப்பு, நெய், மிளகு, சீரகம்'),
      region: bi('Tamil Nadu', 'தமிழ்நாடு'),
      image: ''
    },
    {
      name: bi('Filter Coffee', 'காப்பி'),
      description: bi('South Indian filter-brewed coffee with milk.', 'பாலுடன் தயாரிக்கும் தென் இந்திய ஃபில்டர் காப்பி.'),
      ingredients: bi('Coffee, chicory, milk, sugar', 'காப்பி, சிக்கரி, பால், சர்க்கரை'),
      region: bi('Tamil Nadu', 'தமிழ்நாடு'),
      image: ''
    },
    {
      name: bi('Vada', 'வடை'),
      description: bi('Crispy deep-fried savory lentil doughnut.', 'பருப்பு மாவில் பொரித்த மொறு மொறுப்பான உணவு.'),
      ingredients: bi('Urad dal, spices, oil', 'உளுந்து, மசாலா, எண்ணெய்'),
      region: bi('Tamil Nadu', 'தமிழ்நாடு'),
      image: ''
    }
  ];

  const festivals = [
    {
      name: bi('Pongal', 'பொங்கல்'),
      description: bi('Tamil harvest festival of thanksgiving.', 'நன்றி செலுத்தும் தமிழர் அறுவடைத் திருவிழா.'),
      significance: bi('Four-day celebration honoring nature, sun, and cattle.', 'இயற்கை, சூரியன், மாடுகள் ஆகியவற்றுக்கு நன்றி கூறும் நான்கு நாள் விழா.')
    },
    {
  name: bi('Deepavali / Diwali', 'விளக்கு திருநாள்'),
      description: bi('Festival of lights symbolizing the triumph of good.', 'நன்மை தீமையை வென்றதை நினைவுகூரும் விளக்குத் திருவிழா.'),
      significance: bi('Lighting lamps to dispel darkness.', 'இருளை அகற்ற விளக்கேற்றுதல்.')
    },
    {
  name: bi('Karthigai Deepam', 'கார்த்திகை விளக்கு'),
      description: bi('Festival of lamps celebrated in the Tamil month of Karthigai.', 'கார்த்திகை மாதத்தில் கொண்டாடப்படும் விளக்குத் திருவிழா.'),
      significance: bi('Lighting rows of lamps; famous at Thiruvannamalai.', 'விளக்குத் தொடர்கள் ஏற்றுதல்; திருவண்ணாமலையில் சிறப்பாகக் கொண்டாடப்படுகிறது.')
    },
    {
      name: bi('Thai Poosam', 'தைப்பூசம்'),
      description: bi('Devotional festival dedicated to Lord Murugan.', 'முருகப்பெருமானுக்காக அளிக்கும் பக்திப் பெருவிழா.'),
      significance: bi('Kavadi bearing and vows by devotees.', 'காவடி எடுப்பு மற்றும் விரதங்கள்.')
    }
  ];

  const clothing = [
    {
      name: bi('Kanchipuram Silk Saree', 'காஞ்சீவரம் பட்டுப் புடவை'),
      description: bi('Handwoven silk sarees famous for durability and luster.', 'நீடித்த தன்மை மற்றும் பளபளப்புக்குப் பெயர் பெற்ற கைநெய்த பட்டுப் புடவைகள்.'),
      significance: bi('Pride of Tamil weaving heritage.', 'தமிழ் நெசவுத் பாரம்பரியத்தின் பெருமை.')
    },
    {
  name: bi('Veshti (Dhoti)', 'வேட்டி'),
      description: bi('Traditional men’s garment wrapped around the waist.', 'ஆண்கள் இடுப்பில் சுற்றி அணியும் பாரம்பரிய உடை.'),
      significance: bi('Daily wear and ceremonial attire.', 'நாட்கூடப் பயன்பாடு மற்றும் விழாக்கால உடை.')
    },
    {
      name: bi('Madisar', 'மடிசார்'),
      description: bi('Traditional Iyengar/Iyer saree draping style.', 'ஐயர்/ஐயங்கார் பெண்களின் பாரம்பரிய புடவை அணிவு முறை.'),
      significance: bi('Worn for rituals and special occasions.', 'சடங்குகள் மற்றும் சிறப்பு நிகழ்ச்சிகளில் அணிவது.')
    }
  ];

  const ancientScience = [
    {
      name: bi('Siddha Medicine', 'சித்த மருத்துவம்'),
      field: bi('Traditional Medicine', 'பாரம்பரிய மருத்துவம்'),
      description: bi('Ancient Tamil medical system using herbs, minerals, and metals.', 'மூலிகைகள், கனிமங்கள், உலோகங்கள் கொண்டு குணப்படுத்தும் பண்டைய தமிழ் மருத்துவ முறை.'),
      significance: bi('Holistic approach balancing body and mind.', 'உடல் மன சமநிலையை நோக்கும் முழுமைமிகு மருத்துவம்.')
    },
    {
  name: bi('Wootz Steel (Urukku)', 'உருக்கு எஃகு'),
      field: bi('Metallurgy', 'உலோக அறிவியல்'),
      description: bi('High-quality crucible steel produced in South India, famed as Damascus steel.', 'தென்னிந்தியாவில் தயாரிக்கப்பட்ட உயர் தர உருக்கு எஃகு; டமஸ்கஸ் ஸ்டீல் என உலகப் புகழ் பெற்றது.'),
      significance: bi('Advanced ancient steel-making with global trade.', 'பண்டைய முன்னேற்ற எஃகு தொழில்நுட்பம் மற்றும் உலகளாவிய வர்த்தகம்.')
    },
    {
  name: bi('Vastu Shastra', 'கட்டிடக் கொள்கை'),
      field: bi('Architecture', 'கட்டிடக் கலை'),
      description: bi('Traditional Indian system of architecture and design.', 'பாரம்பரிய இந்திய கட்டிட நயக் கோட்பாடுகள்.'),
      significance: bi('Influenced temple-town planning across Tamil regions.', 'தமிழகக் கோயில் நகரத் திட்டமிடலில் தாக்கம் செலுத்தியது.')
    }
  ];

  const resources = [
    {
      title: bi('Silappatikaram (Epic)', 'சிலப்பதிகாரம் (காப்பியம்)'),
      description: bi('One of the Five Great Epics of Tamil.', 'தமிழின் ஐம்பெரும் காப்பியங்களில் ஒன்று.'),
      link: 'https://en.wikipedia.org/wiki/Silappatikaram',
      type: 'Book'
    },
    {
      title: bi('Akananuru (Anthology)', 'அகநானூறு (தொகுப்பு)'),
      description: bi('Classical anthology of love poems.', 'அகத்திணைப் பாடல்கள் கொண்ட சங்கத் தொகுப்பு.'),
      link: 'https://en.wikipedia.org/wiki/Akananuru',
      type: 'Book'
    },
    {
      title: bi('Tamil Temple Architecture', 'தமிழ் கோயில் கட்டிடக் கலை'),
      description: bi('Overview of Dravidian temple architecture.', 'திராவிட கோயில் கட்டிடக் கலை கண்ணோட்டம்.'),
      link: 'https://en.wikipedia.org/wiki/Dravidian_architecture',
      type: 'Article'
    }
  ];

  const articles = [
    {
      title: bi('Sangam Literature', 'சங்க இலக்கியம்'),
      content: bi('Early classical Tamil literature reflecting ancient society.', 'பழந்தமிழர் வாழ்க்கை முறையைக் கூறும் தொடக்ககால சங்க இலக்கியம்.'),
      author: bi('Editorial', 'தொகுப்பாசிரியர்'),
      image: ''
    },
    {
      title: bi('Chola Maritime Power', 'சோழர் கடல்படை வல்லமை'),
      content: bi('The Cholas built a formidable navy enabling overseas expeditions.', 'சோழர்கள் வலுவான கடற்படையமைத்து அயல் நாடுகளுக்கு படையெடுத்தனர்.'),
      author: bi('Research Desk', 'ஆய்வுக்குழு'),
      image: ''
    }
  ];

  const gallery = [
    {
      title: bi('Tanjore Painting', 'தஞ்சாவூர் ஓவியம்'),
      description: bi('Classical painting style known for rich relief work.', 'பொலிவு மற்றும் உருவெழுச்சிக்குப் பெயர் பெற்ற ஓவிய முறை.'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Tanjore_painting.jpg'
    },
    {
      title: bi('Temple Gopuram', 'கோபுரம்'),
      description: bi('Ornate gateway tower of Dravidian temples.', 'திராவிடக் கோயில்களின் செழுமையான நுழைவு கோபுரம்.'),
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Dravidian_temple_gopuram.jpg'
    }
  ];

  // Clear and insert
  const wipeAndInsert = async (Model, docs, label) => {
    await Model.deleteMany({});
    if (docs.length) await Model.insertMany(docs);
    console.log(`✅ Seeded ${label}: ${docs.length}`);
  };

  await wipeAndInsert(Event, events, 'Events');
  await wipeAndInsert(Temple, temples, 'Temples');
  await wipeAndInsert(King, kings, 'Kings');
  await wipeAndInsert(Literature, literature, 'Literature');
  await wipeAndInsert(Dance, dances, 'Dances');
  await wipeAndInsert(Food, foods, 'Foods');
  await wipeAndInsert(Festival, festivals, 'Festivals');
  await wipeAndInsert(Clothing, clothing, 'Clothing');
  await wipeAndInsert(AncientScience, ancientScience, 'Ancient Science');
  await wipeAndInsert(Resource, resources, 'Resources');
  await wipeAndInsert(Gallery, gallery, 'Gallery');
  await wipeAndInsert(Article, articles, 'Articles');

  console.log('\n🎉 All bilingual data seeded successfully!');
  await mongoose.connection.close();
  console.log('👋 Connection closed');
}

seed().catch((e) => { console.error(e); process.exit(1); });
