import { createBilingualContent } from "../utils/bilingualContent";

// Move all heavy data arrays out of Home.jsx to reduce initial parse time
// This file can be code-split and loaded on demand

export const TEAM_DIRECTORS = [
  {
    name: { en: "Subramania Bharathi", ta: "சுப்பிரமணிய பாரதியார்" },
    title: { en: "National Poet of Tamil Nadu", ta: "தமிழ்நாட்டின் தேசிய கவிஞர்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Subramanya_Bharathi.jpg/220px-Subramanya_Bharathi.jpg"
  },
  {
    name: { en: "Kambar", ta: "கம்பர்" },
    title: { en: "Epic Poet • Kambaramayanam", ta: "காவிய கவிஞர் • கம்பராமாயணம்" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzQqB5pZ9nI7XF6rX4vH7mYGnK3rR1kGvKRw&s"
  },
  {
    name: { en: "Thiruvalluvar", ta: "திருவள்ளுவர்" },
    title: { en: "Author of Thirukkural", ta: "திருக்குறள் ஆசிரியர்" },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz7XvJ5pZ9nI7XF6rX4vH7mYGnK3rR1kGvKRw&s"
  },
  {
    name: { en: "Bharathidasan", ta: "பாரதிதாசன்" },
    title: { en: "Revolutionary Poet", ta: "புரட்சிக் கவிஞர்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bharathidasan.jpg/220px-Bharathidasan.jpg"
  },
  {
    name: { en: "Maraimalai Adigal", ta: "மறைமலை அடிகள்" },
    title: { en: "Tamil Scholar • Purist Movement", ta: "தமிழ் அறிஞர் • தனித்தமிழ் இயக்கம்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Maraimalai_Adigal.jpg/220px-Maraimalai_Adigal.jpg"
  }
];

export const TEAM_MUSEUM = [
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

export const FIVE_LANDS = [
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
      en: 'Pastoral forests of bamboo groves, cowherds, and Mayon\'s flute. Evening lamps glow in leaf-thatched hamlets while stories of waiting kindle the hearth.',
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
        en: 'Folklore of Kannagi\'s resilience travels through night-long story circles.',
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

export const FEATURED_TEMPLES = [
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
      en: "Raja Raja Chola I's masterpiece crowned with a 216-ft vimana carved from single granite blocks.",
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
      en: "Mariner's landmark etched with Narasimha panels, safeguarding coastal trade routes.",
      ta: "கரை காவலனாக விளங்கும் நரசிம்ம பலகைகள் கொண்ட கருங்கல் சன்னதிகள்."
    }
  }
];

// More data arrays can be added here
