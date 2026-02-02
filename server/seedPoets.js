import mongoose from "mongoose";
import Poet from "./models/Poet.js";
import dotenv from "dotenv";
dotenv.config();

const poets = [
  {
    name: { en: "Subramania Bharathi", ta: "சுப்பிரமணிய பாரதியார்" },
    slug: "subramania-bharathi",
    title: { en: "National Poet of Tamil Nadu", ta: "தமிழ்நாட்டின் தேசிய கவிஞர்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Subramanya_Bharathi.jpg/250px-Subramanya_Bharathi.jpg",
    imagePosition: "center 20%",
    period: { en: "1882 - 1921", ta: "1882 - 1921" },
    birthPlace: { en: "Ettayapuram, Tamil Nadu", ta: "எட்டயபுரம், தமிழ்நாடு" },
    description: {
      en: "Chinnaswami Subramania Bharathi was a Tamil writer, poet, journalist, Indian independence activist, social reformer and polyglot. Popularly known as 'Mahakavi Bharathi', he is considered one of the greatest Tamil literary figures of all time.",
      ta: "சின்னசாமி சுப்பிரமணிய பாரதியார் ஒரு தமிழ் எழுத்தாளர், கவிஞர், பத்திரிகையாளர், இந்திய சுதந்திர ஆர்வலர், சமூக சீர்திருத்தவாதி மற்றும் பல மொழிகளை அறிந்தவர். 'மகாகவி பாரதி' என்று பரவலாக அறியப்படும் இவர், எல்லா காலத்திலும் சிறந்த தமிழ் இலக்கிய ஆளுமைகளில் ஒருவராகக் கருதப்படுகிறார்."
    },
    biography: {
      en: "Born in Ettayapuram in 1882, Bharathi showed extraordinary talent from a young age. He was given the title 'Bharathi' (one blessed by Saraswati, the goddess of learning) at the age of 11 by the Ettayapuram court. He became involved in the Indian independence movement and used his poetry to inspire millions. He worked as a journalist and editor for various Tamil newspapers including 'India' and 'Vijaya'. His revolutionary ideas on women's rights, caste abolition, and national freedom were far ahead of his time.",
      ta: "1882ல் எட்டயபுரத்தில் பிறந்த பாரதி, இளம் வயதிலிருந்தே அசாதாரண திறமையைக் காட்டினார். 11 வயதில் எட்டயபுர அரசவையால் 'பாரதி' (கல்வி தேவியான சரஸ்வதியால் ஆசீர்வதிக்கப்பட்டவர்) என்ற பட்டம் வழங்கப்பட்டது. அவர் இந்திய சுதந்திர இயக்கத்தில் ஈடுபட்டு, தனது கவிதைகள் மூலம் மில்லியன் கணக்கானவர்களை ஊக்குவித்தார்."
    },
    majorWorks: [
      {
        title: { en: "Kuyil Pattu", ta: "குயில் பாட்டு" },
        description: { en: "A beautiful poem celebrating nature and freedom", ta: "இயற்கையையும் சுதந்திரத்தையும் கொண்டாடும் அழகிய கவிதை" }
      },
      {
        title: { en: "Panchali Sabatham", ta: "பாஞ்சாலி சபதம்" },
        description: { en: "Epic poem based on Draupadi from Mahabharata", ta: "மகாபாரதத்தின் திரௌபதியை அடிப்படையாகக் கொண்ட காவியம்" }
      },
      {
        title: { en: "Kannan Pattu", ta: "கண்ணன் பாட்டு" },
        description: { en: "Devotional songs dedicated to Lord Krishna", ta: "கண்ணபிரானுக்கு அர்ப்பணிக்கப்பட்ட பக்தி பாடல்கள்" }
      }
    ],
    contributions: {
      en: "Bharathi revolutionized Tamil poetry by introducing new styles and themes. He wrote about social issues, women's liberation, and national freedom. His songs became anthems of the independence movement. He also contributed to Tamil prose and journalism.",
      ta: "பாரதி புதிய பாணிகளையும் கருப்பொருள்களையும் அறிமுகப்படுத்தி தமிழ் கவிதையில் புரட்சியை ஏற்படுத்தினார். சமூகப் பிரச்சினைகள், பெண்கள் விடுதலை, தேசிய சுதந்திரம் பற்றி எழுதினார்."
    },
    philosophy: {
      en: "Bharathi believed in the unity of all Indians regardless of caste, creed, or gender. He advocated for women's education and equality. His philosophy combined nationalism with spirituality, seeing freedom as both political and spiritual liberation.",
      ta: "சாதி, மதம், பாலினம் என்ற வேறுபாடின்றி அனைத்து இந்தியர்களின் ஒற்றுமையை பாரதி நம்பினார். பெண்கல்வி மற்றும் சமத்துவத்திற்காக வாதிட்டார்."
    },
    famousQuotes: [
      {
        quote: { en: "Thani Ondru Vaazhvatharku, Nilamillai Indha Nilathile", ta: "தனி ஒன்று வாழ்வதற்கு நிலமில்லை இந்த நிலத்திலே" },
        source: { en: "Bharathi's poem on Unity", ta: "ஒற்றுமை பற்றிய பாரதியின் கவிதை" }
      },
      {
        quote: { en: "Achamillai Achamillai, Acham Enbadhu Illaiye", ta: "அச்சமில்லை அச்சமில்லை அச்சமென்பது இல்லையே" },
        source: { en: "Song of Fearlessness", ta: "அச்சமின்மை பாடல்" }
      }
    ],
    legacy: {
      en: "Bharathi's influence on Tamil literature and Indian nationalism is immeasurable. His birthday, December 11, is celebrated as 'Bharathi Day'. His poems are still sung across Tamil Nadu. Schools, universities, and institutions are named after him.",
      ta: "தமிழ் இலக்கியம் மற்றும் இந்திய தேசியவாதத்தின் மீது பாரதியின் தாக்கம் அளவிட முடியாதது. அவரது பிறந்த நாளான டிசம்பர் 11 'பாரதி தினம்' என கொண்டாடப்படுகிறது."
    },
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Subramanya_Bharathi.jpg/250px-Subramanya_Bharathi.jpg"
    ]
  },
  {
    name: { en: "Kambar", ta: "கம்பர்" },
    slug: "kambar",
    title: { en: "Epic Poet • Kambaramayanam", ta: "காவிய கவிஞர் • கம்பராமாயணம்" },
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Kambar.jpg?20120807204334",
    imagePosition: "center top",
    period: { en: "12th Century CE", ta: "கி.பி. 12ஆம் நூற்றாண்டு" },
    birthPlace: { en: "Therazhundur, Tamil Nadu", ta: "தேரழுந்தூர், தமிழ்நாடு" },
    description: {
      en: "Kambar was a medieval Tamil poet and the author of the Ramavataram, popularly known as Kambaramayanam, the Tamil version of Ramayana. He is considered one of the five great epics of Tamil literature.",
      ta: "கம்பர் ஒரு இடைக்கால தமிழ் கவிஞர் மற்றும் கம்பராமாயணம் என்று பிரபலமாக அறியப்படும் இராமாவதாரத்தின் ஆசிரியர். தமிழ் இலக்கியத்தின் ஐம்பெரும் காப்பியங்களில் ஒன்றாக இது கருதப்படுகிறது."
    },
    biography: {
      en: "Kambar was born in Therazhundur near Thiruvannamalai. He lived during the reign of Kulothunga Chola III. According to legend, he was discovered as a talented poet when he composed verses at the Chola court. He was patronized by a local chieftain named Sadayappa Vallal.",
      ta: "கம்பர் திருவண்ணாமலை அருகே உள்ள தேரழுந்தூரில் பிறந்தார். மூன்றாம் குலோத்துங்க சோழன் காலத்தில் வாழ்ந்தார். சோழ அரசவையில் கவிதைகள் பாடியபோது திறமையான கவிஞராக கண்டறியப்பட்டார் என்று கூறப்படுகிறது."
    },
    majorWorks: [
      {
        title: { en: "Kambaramayanam", ta: "கம்பராமாயணம்" },
        description: { en: "The Tamil epic adaptation of Valmiki's Ramayana with over 10,000 verses", ta: "வால்மீகி ராமாயணத்தின் தமிழ் காவிய தழுவல், 10,000க்கும் மேற்பட்ட பாடல்கள்" }
      },
      {
        title: { en: "Saraswati Antadi", ta: "சரஸ்வதி அந்தாதி" },
        description: { en: "A devotional work dedicated to Goddess Saraswati", ta: "சரஸ்வதி தேவிக்கு அர்ப்பணிக்கப்பட்ட பக்தி படைப்பு" }
      }
    ],
    contributions: {
      en: "Kambar's Kambaramayanam is considered a masterpiece of Tamil literature. He adapted the Sanskrit Ramayana to Tamil sensibilities while maintaining poetic excellence. His work influenced all subsequent Tamil poets.",
      ta: "கம்பரின் கம்பராமாயணம் தமிழ் இலக்கியத்தின் தலைசிறந்த படைப்பாக கருதப்படுகிறது. சமஸ்கிருத ராமாயணத்தை தமிழ் உணர்வுகளுக்கு ஏற்ப கவிதை சிறப்புடன் தழுவியுள்ளார்."
    },
    philosophy: {
      en: "Kambar's work reflects deep devotion to Rama and the values of dharma. He emphasized the importance of righteousness, duty, and moral conduct through his poetry.",
      ta: "கம்பரின் படைப்பு ராமன் மீதான ஆழ்ந்த பக்தியையும் தர்ம மதிப்புகளையும் பிரதிபலிக்கிறது. தனது கவிதைகள் மூலம் நேர்மை, கடமை, நெறிமுறை நடத்தையின் முக்கியத்துவத்தை வலியுறுத்தினார்."
    },
    famousQuotes: [
      {
        quote: { en: "Ulaginil Thirumakal Naanmugan Padaitha Nilai", ta: "உலகினில் திருமகள் நான்முகன் படைத்த நிலை" },
        source: { en: "Kambaramayanam", ta: "கம்பராமாயணம்" }
      }
    ],
    legacy: {
      en: "Kambaramayanam is still recited and celebrated across Tamil Nadu. His work is considered equal to the original Sanskrit Ramayana in literary merit. Temples have been built in his honor.",
      ta: "கம்பராமாயணம் இன்றும் தமிழ்நாடு முழுவதும் பாராயணம் செய்யப்பட்டு கொண்டாடப்படுகிறது. அவரது படைப்பு இலக்கியத் தகுதியில் மூல சமஸ்கிருத ராமாயணத்திற்கு இணையாக கருதப்படுகிறது."
    },
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/a/a9/Kambar.jpg?20120807204334"
    ]
  },
  {
    name: { en: "Thiruvalluvar", ta: "திருவள்ளுவர்" },
    slug: "thiruvalluvar",
    title: { en: "Author of Thirukkural", ta: "திருக்குறள் ஆசிரியர்" },
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXR0EU2W1grbcin5-yghbPrNHdMq0wFccGwR71QRc0WB6ZXEzRbsbPeMdhDWQKgsVfTiGP-9ivpM27-cBXd8_vzzmuZ4JdQbsaWkBS6Dk6swOzSAQhIJ64V_QKG5drXTMrJB1wUgwssyQ/s1600/thiruvalluvar-779961.jpg",
    imagePosition: "50% 15%",
    period: { en: "Between 3rd century BCE and 5th century CE", ta: "கி.மு. 3ஆம் நூற்றாண்டு முதல் கி.பி. 5ஆம் நூற்றாண்டு வரை" },
    birthPlace: { en: "Mylapore, Chennai (traditionally)", ta: "மயிலாப்பூர், சென்னை (மரபுப்படி)" },
    description: {
      en: "Thiruvalluvar was a celebrated Tamil poet and philosopher whose contribution to Tamil literature is the Thirukkural, a collection of couplets on ethics, political and economic matters, and love. The Thirukkural is considered one of the greatest works on ethics and morality.",
      ta: "திருவள்ளுவர் ஒரு புகழ்பெற்ற தமிழ் கவிஞர் மற்றும் தத்துவஞானி. தமிழ் இலக்கியத்திற்கு அவரது பங்களிப்பு திருக்குறள் - அறம், பொருள், இன்பம் பற்றிய குறள்களின் தொகுப்பு. திருக்குறள் அறநெறி மற்றும் நெறிமுறைகள் பற்றிய சிறந்த படைப்புகளில் ஒன்றாக கருதப்படுகிறது."
    },
    biography: {
      en: "Little is known about Thiruvalluvar's life with certainty. According to tradition, he was a weaver by profession and lived in Mylapore. He is believed to have been married to a woman named Vasuki, who is considered an ideal wife in Tamil culture. Various traditions claim him as belonging to different religious backgrounds.",
      ta: "திருவள்ளுவரின் வாழ்க்கை பற்றி உறுதியாக அதிகம் அறியப்படவில்லை. மரபுப்படி, அவர் நெசவாளராக இருந்தார், மயிலாப்பூரில் வாழ்ந்தார். வாசுகி என்ற பெண்ணை மணந்ததாக நம்பப்படுகிறது, அவர் தமிழ் கலாச்சாரத்தில் சிறந்த மனைவியாக கருதப்படுகிறார்."
    },
    majorWorks: [
      {
        title: { en: "Thirukkural", ta: "திருக்குறள்" },
        description: { en: "1330 couplets divided into 133 chapters covering Aram (Virtue), Porul (Wealth), and Inbam (Love)", ta: "அறம், பொருள், இன்பம் ஆகிய மூன்று பிரிவுகளில் 133 அதிகாரங்களாகப் பிரிக்கப்பட்ட 1330 குறள்கள்" }
      }
    ],
    contributions: {
      en: "The Thirukkural is a timeless work that transcends religious and cultural boundaries. It has been translated into over 80 languages, making it one of the most translated works of Indian literature. Its universal ethical teachings remain relevant today.",
      ta: "திருக்குறள் மத மற்றும் கலாச்சார எல்லைகளைக் கடந்த காலத்தால் அழியாத படைப்பு. இது 80க்கும் மேற்பட்ட மொழிகளில் மொழிபெயர்க்கப்பட்டுள்ளது, இது இந்திய இலக்கியத்தின் மிக அதிகமாக மொழிபெயர்க்கப்பட்ட படைப்புகளில் ஒன்றாக உள்ளது."
    },
    philosophy: {
      en: "Thiruvalluvar's philosophy emphasizes ethical living, righteous conduct, and balanced life. He covers all aspects of human life from personal ethics to governance. His teachings promote universal human values without favoring any religion.",
      ta: "திருவள்ளுவரின் தத்துவம் நெறிமுறையான வாழ்க்கை, நேர்மையான நடத்தை, சமநிலையான வாழ்க்கை ஆகியவற்றை வலியுறுத்துகிறது. தனிப்பட்ட நெறிமுறைகள் முதல் ஆட்சி வரை மனித வாழ்க்கையின் அனைத்து அம்சங்களையும் உள்ளடக்கியது."
    },
    famousQuotes: [
      {
        quote: { en: "Katradhu Kai Mann Alavu, Kalladhadhu Ulagalavu", ta: "கற்றது கைமண் அளவு கல்லாதது உலகளவு" },
        source: { en: "Thirukkural on Learning", ta: "கல்வி பற்றிய திருக்குறள்" }
      },
      {
        quote: { en: "Yaadhum Oore Yaavarum Kelir", ta: "யாதும் ஊரே யாவரும் கேளிர்" },
        source: { en: "On Universal Brotherhood", ta: "உலக சகோதரத்துவம் பற்றி" }
      }
    ],
    legacy: {
      en: "Thiruvalluvar Day (January 15 or 16) is celebrated across Tamil Nadu. A massive 133-foot statue of Thiruvalluvar stands at Kanyakumari. His work is mandatory reading in Tamil schools and continues to influence moral education worldwide.",
      ta: "திருவள்ளுவர் தினம் (ஜனவரி 15 அல்லது 16) தமிழ்நாடு முழுவதும் கொண்டாடப்படுகிறது. கன்னியாகுமரியில் 133 அடி உயர திருவள்ளுவர் சிலை நிற்கிறது. அவரது படைப்பு தமிழ்ப் பள்ளிகளில் கட்டாய வாசிப்பாகும்."
    },
    gallery: [
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXR0EU2W1grbcin5-yghbPrNHdMq0wFccGwR71QRc0WB6ZXEzRbsbPeMdhDWQKgsVfTiGP-9ivpM27-cBXd8_vzzmuZ4JdQbsaWkBS6Dk6swOzSAQhIJ64V_QKG5drXTMrJB1wUgwssyQ/s1600/thiruvalluvar-779961.jpg"
    ]
  },
  {
    name: { en: "Devaneyapavanar", ta: "தேவநேய பாவாணர்" },
    slug: "devaneyapavanar",
    title: { en: "Tamil Scholar • Linguist", ta: "தமிழ் அறிஞர் • மொழியியலாளர்" },
    image: "https://static.hindutamil.in/hindu/uploads/news/2023/02/07/xlarge/940197.jpg",
    imagePosition: "center top",
    period: { en: "1902 - 1981", ta: "1902 - 1981" },
    birthPlace: { en: "Sankarankoil, Tamil Nadu", ta: "சங்கரன்கோவில், தமிழ்நாடு" },
    description: {
      en: "Gnanasekaran Devaneyapavanar was a renowned Tamil linguist and scholar who dedicated his life to proving the antiquity and originality of the Tamil language. He is considered the father of Tamil etymology.",
      ta: "ஞானசேகரன் தேவநேய பாவாணர் ஒரு புகழ்பெற்ற தமிழ் மொழியியலாளர் மற்றும் அறிஞர், தமிழ் மொழியின் பழமையையும் தனித்துவத்தையும் நிரூபிக்க தனது வாழ்நாளை அர்ப்பணித்தவர். தமிழ் சொற்பிறப்பியலின் தந்தை என்று கருதப்படுகிறார்."
    },
    biography: {
      en: "Born in 1902 in Sankarankoil, Devaneyapavanar became passionate about Tamil language from a young age. He worked as a teacher and later dedicated himself entirely to Tamil research. He established the Tamil Etymology Institute and wrote extensively on Tamil linguistics.",
      ta: "1902ல் சங்கரன்கோவிலில் பிறந்த தேவநேய பாவாணர் இளம் வயதிலிருந்தே தமிழ் மொழியின் மீது ஆர்வம் கொண்டார். ஆசிரியராக பணியாற்றினார், பின்னர் தமிழ் ஆராய்ச்சியில் முழுமையாக ஈடுபட்டார். தமிழ் சொற்பிறப்பியல் நிறுவனத்தை நிறுவினார்."
    },
    majorWorks: [
      {
        title: { en: "Sorkala Aaivu", ta: "சொற்கலை ஆய்வு" },
        description: { en: "Comprehensive study of Tamil etymology", ta: "தமிழ் சொற்பிறப்பியலின் விரிவான ஆய்வு" }
      },
      {
        title: { en: "Tamil Mozhi Varalaru", ta: "தமிழ்மொழி வரலாறு" },
        description: { en: "History of the Tamil language", ta: "தமிழ் மொழியின் வரலாறு" }
      },
      {
        title: { en: "Tholkappiyam Eluttatikaram Urai", ta: "தொல்காப்பியம் எழுத்ததிகாரம் உரை" },
        description: { en: "Commentary on Tholkappiyam", ta: "தொல்காப்பியத்தின் உரை" }
      }
    ],
    contributions: {
      en: "Devaneyapavanar developed a systematic approach to Tamil etymology. He argued for the classical status of Tamil and its independence from Sanskrit. His research influenced the recognition of Tamil as a classical language.",
      ta: "தேவநேய பாவாணர் தமிழ் சொற்பிறப்பியலுக்கு முறையான அணுகுமுறையை உருவாக்கினார். தமிழின் செம்மொழி தகுதிக்கும் சமஸ்கிருதத்திலிருந்து அதன் சுதந்திரத்திற்கும் வாதிட்டார்."
    },
    philosophy: {
      en: "Devaneyapavanar believed Tamil was one of the oldest languages in the world with its own independent origin. He worked to restore pride in Tamil heritage and establish its academic recognition.",
      ta: "தமிழ் உலகின் பழமையான மொழிகளில் ஒன்று என்றும் அதன் சொந்த சுதந்திரமான தோற்றம் உள்ளது என்றும் தேவநேய பாவாணர் நம்பினார். தமிழ் பாரம்பரியத்தில் பெருமையை மீட்டெடுக்கவும் அதன் கல்விசார் அங்கீகாரத்தை நிறுவும் பணியில் ஈடுபட்டார்."
    },
    famousQuotes: [
      {
        quote: { en: "Tamil is not derived from any language; it is the mother of many languages", ta: "தமிழ் எந்த மொழியிலிருந்தும் வரவில்லை; இது பல மொழிகளின் தாய்" },
        source: { en: "On Tamil Origin", ta: "தமிழ் தோற்றம் பற்றி" }
      }
    ],
    legacy: {
      en: "His work laid the foundation for modern Tamil linguistic studies. The World Tamil Conference honors his contributions. His research continues to influence Tamil scholarship.",
      ta: "அவரது பணி நவீன தமிழ் மொழியியல் ஆய்வுகளுக்கு அடித்தளமிட்டது. உலக தமிழ் மாநாடு அவரது பங்களிப்புகளை கௌரவிக்கிறது."
    },
    gallery: [
      "https://static.hindutamil.in/hindu/uploads/news/2023/02/07/xlarge/940197.jpg"
    ]
  },
  {
    name: { en: "Avvaiyar", ta: "ஔவையார்" },
    slug: "avvaiyar",
    title: { en: "Poet • Philosopher", ta: "கவிஞர் • தத்துவவாதி" },
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Statue_of_Avvaiyar_%28cropped%29.jpg",
    imagePosition: "center top",
    period: { en: "Sangam Period (3rd century BCE - 3rd century CE)", ta: "சங்க காலம் (கி.மு. 3ஆம் நூற்றாண்டு - கி.பி. 3ஆம் நூற்றாண்டு)" },
    birthPlace: { en: "Tamil Nadu (exact location unknown)", ta: "தமிழ்நாடு (சரியான இடம் தெரியவில்லை)" },
    description: {
      en: "Avvaiyar is the title given to several female Tamil poets who wrote during the Sangam period and later. The most famous Avvaiyar is associated with the Sangam era and was known for her wisdom, wit, and ethical teachings.",
      ta: "ஔவையார் என்பது சங்க காலத்திலும் அதற்குப் பின்னரும் எழுதிய பல பெண் தமிழ் கவிஞர்களுக்கு வழங்கப்பட்ட பட்டம். மிகவும் புகழ்பெற்ற ஔவையார் சங்க காலத்துடன் தொடர்புடையவர், அவரது ஞானம், நகைச்சுவை, அற போதனைகளுக்கு பெயர் பெற்றவர்."
    },
    biography: {
      en: "According to legend, Avvaiyar was devoted to learning from childhood and chose to remain unmarried to pursue her literary career. She traveled extensively, was respected by kings and commoners alike, and became known for her moral teachings and quick wit.",
      ta: "புராணத்தின்படி, ஔவையார் குழந்தைப் பருவத்திலிருந்தே கற்றலில் ஈடுபாடு கொண்டிருந்தார், தனது இலக்கிய வாழ்க்கையைத் தொடர திருமணம் செய்துகொள்ளாமல் இருக்க தேர்ந்தெடுத்தார். விரிவாகப் பயணம் செய்தார், அரசர்களும் பொதுமக்களும் சமமாக மதிக்கப்பட்டார்."
    },
    majorWorks: [
      {
        title: { en: "Aathichudi", ta: "ஆத்திச்சூடி" },
        description: { en: "Collection of 109 one-line verses teaching moral values to children", ta: "குழந்தைகளுக்கு நெறிமுறை மதிப்புகளை கற்பிக்கும் 109 ஒற்றை வரி பாடல்களின் தொகுப்பு" }
      },
      {
        title: { en: "Kondrai Vendhan", ta: "கொன்றைவேந்தன்" },
        description: { en: "Another collection of moral teachings for children", ta: "குழந்தைகளுக்கான நெறிமுறை போதனைகளின் மற்றொரு தொகுப்பு" }
      },
      {
        title: { en: "Moodurai", ta: "மூதுரை" },
        description: { en: "A collection of wise sayings and proverbs", ta: "ஞான மொழிகள் மற்றும் பழமொழிகளின் தொகுப்பு" }
      },
      {
        title: { en: "Nalvazhi", ta: "நல்வழி" },
        description: { en: "Guide to righteous living", ta: "நேர்மையான வாழ்க்கைக்கான வழிகாட்டி" }
      }
    ],
    contributions: {
      en: "Avvaiyar's works form the foundation of Tamil moral education. Her simple yet profound verses are still taught in Tamil schools. She pioneered children's literature in Tamil and made complex philosophical ideas accessible to all.",
      ta: "ஔவையாரின் படைப்புகள் தமிழ் நெறிமுறை கல்வியின் அடித்தளமாக உள்ளன. அவரது எளிய ஆனால் ஆழமான பாடல்கள் இன்றும் தமிழ்ப் பள்ளிகளில் கற்பிக்கப்படுகின்றன."
    },
    philosophy: {
      en: "Avvaiyar's philosophy emphasized practical wisdom, ethical conduct, and respect for knowledge. She taught that education and virtue are the true treasures of life, accessible to all regardless of social status.",
      ta: "ஔவையாரின் தத்துவம் நடைமுறை ஞானம், நெறிமுறை நடத்தை, அறிவுக்கான மரியாதை ஆகியவற்றை வலியுறுத்தியது. கல்வியும் நற்குணமும் வாழ்க்கையின் உண்மையான செல்வங்கள் என்று கற்பித்தார்."
    },
    famousQuotes: [
      {
        quote: { en: "Aaram Seiya Virumbu", ta: "ஆறாம் செய்ய விரும்பு" },
        source: { en: "Aathichudi - Desire to do good", ta: "ஆத்திச்சூடி - நன்மை செய்ய விரும்பு" }
      },
      {
        quote: { en: "Kalvi Kallunga Kasadara Kallunga", ta: "கல்வி கல்லுங்க கசடற கல்லுங்க" },
        source: { en: "On the importance of learning", ta: "கற்றலின் முக்கியத்துவம் பற்றி" }
      }
    ],
    legacy: {
      en: "Avvaiyar is revered as the grandmother of Tamil literature. Her works are mandatory in Tamil Nadu schools. Statues of Avvaiyar are found across Tamil Nadu, and she remains an inspiration for Tamil women.",
      ta: "ஔவையார் தமிழ் இலக்கியத்தின் பாட்டியாக போற்றப்படுகிறார். அவரது படைப்புகள் தமிழ்நாடு பள்ளிகளில் கட்டாயமாக உள்ளன. தமிழ்நாடு முழுவதும் ஔவையார் சிலைகள் காணப்படுகின்றன."
    },
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Statue_of_Avvaiyar_%28cropped%29.jpg"
    ]
  }
];

async function seedPoets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing poets
    await Poet.deleteMany({});
    console.log("Cleared existing poets");

    // Insert new poets
    const result = await Poet.insertMany(poets);
    console.log(`Successfully seeded ${result.length} poets`);

    console.log("Poets seeded:");
    result.forEach(poet => {
      console.log(`  - ${poet.name.en} (${poet.slug})`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding poets:", error);
    process.exit(1);
  }
}

seedPoets();
