import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Dynasty from './models/Dynasty.js';

dotenv.config();

const dynastiesData = [
  {
    name: {
      en: "Pandiya Dynasty",
      ta: "பாண்டிய வம்சம்"
    },
    slug: "pandiya",
    period: {
      en: "600 BCE - 1650 CE",
      ta: "கி.மு. 600 - கி.பி. 1650"
    },
    capital: {
      en: "Madurai",
      ta: "மதுரை"
    },
    territory: {
      en: "Southern Tamil Nadu, parts of Kerala and Sri Lanka",
      ta: "தென் தமிழ்நாடு, கேரளாவின் சில பகுதிகள் மற்றும் இலங்கை"
    },
    rulers: {
      en: "Nedunchezhiyan, Koon Pandyan, Jatavarman Sundara Pandyan, Maravarman Kulasekhara Pandyan",
      ta: "நெடுஞ்செழியன், கூன் பாண்டியன், ஜடாவர்மன் சுந்தர பாண்டியன், மாறவர்மன் குலசேகர பாண்டியன்"
    },
    achievements: {
      en: "• Patronage of Tamil literature and Sangam poetry\n• Construction of Meenakshi Temple\n• Maritime trade with Rome and Southeast Asia\n• Development of pearl fishing industry\n• Support for Buddhism and Jainism alongside Hinduism",
      ta: "• தமிழ் இலக்கியம் மற்றும் சங்க இலக்கியத்திற்கு ஆதரவு\n• மீனாட்சி கோவில் கட்டுமானம்\n• ரோம் மற்றும் தென்கிழக்கு ஆசியாவுடன் கடல் வாணிபம்\n• முத்துக்குளித்தல் தொழில் வளர்ச்சி\n• இந்து மதத்துடன் பௌத்தம் மற்றும் சமணத்திற்கு ஆதரவு"
    },
    description: {
      en: "The Pandiya Dynasty was one of the three ancient Tamil kingdoms that dominated southern India. Known for their patronage of Tamil literature, the Pandiyas were mentioned in ancient Greek and Roman texts as important trading partners. Their capital, Madurai, became a major center of Tamil culture and learning.",
      ta: "பாண்டிய வம்சம் தென்னிந்தியாவை ஆதிக்கம் செலுத்திய மூன்று பண்டைய தமிழ் அரசுகளில் ஒன்றாகும். தமிழ் இலக்கியத்திற்கு ஆதரவளித்ததற்காக அறியப்பட்ட பாண்டியர்கள், பண்டைய கிரேக்க மற்றும் ரோமானிய நூல்களில் முக்கியமான வாணிப கூட்டாளிகளாகக் குறிப்பிடப்பட்டுள்ளனர். அவர்களின் தலைநகரான மதுரை தமிழ் பண்பாடு மற்றும் கற்றலின் முக்கிய மையமாக மாறியது."
    },
    militaryStrength: {
      en: "The Pandiya army was known for its skilled cavalry and navy. They maintained a strong naval presence in the Indian Ocean and successfully defended against Chola invasions multiple times. Their warriors were famous for their archery skills.",
      ta: "பாண்டிய படை அதன் திறமையான குதிரைப்படை மற்றும் கடற்படைக்கு பெயர் பெற்றது. இந்தியப் பெருங்கடலில் வலுவான கடற்படை இருப்பை பராமரித்து, பல முறை சோழர் படையெடுப்புகளுக்கு எதிராக வெற்றிகரமாக பாதுகாத்தனர். அவர்களின் போர்வீரர்கள் வில்வித்தை திறனுக்கு பிரபலமானவர்கள்."
    },
    culturalContributions: {
      en: "The Pandiyas were great patrons of Tamil literature and the Sangam age flourished under their rule. They supported poets, scholars, and artists. The famous Meenakshi Temple in Madurai stands as a testament to their architectural brilliance. They also promoted education and established numerous educational institutions.",
      ta: "பாண்டியர்கள் தமிழ் இலக்கியத்தின் பெரும் ஆதரவாளர்களாக இருந்தனர் மற்றும் சங்க காலம் அவர்களின் ஆட்சியின் கீழ் செழித்தது. கவிஞர்கள், அறிஞர்கள் மற்றும் கலைஞர்களுக்கு ஆதரவளித்தனர். மதுரையில் உள்ள புகழ்பெற்ற மீனாட்சி கோவில் அவர்களின் கட்டிடக்கலை சிறப்புக்கு சான்றாக உள்ளது. கல்வியை ஊக்குவித்து பல கல்வி நிறுவனங்களை நிறுவினர்."
    },
    architecture: {
      en: "Pandiya architecture is characterized by magnificent temple complexes with towering gopurams. The Meenakshi Amman Temple in Madurai is their most famous architectural achievement. They also built numerous water tanks, irrigation systems, and fortifications.",
      ta: "பாண்டிய கட்டிடக்கலை உயர்ந்த கோபுரங்களுடன் கூடிய அற்புதமான கோவில் வளாகங்களால் வகைப்படுத்தப்படுகிறது. மதுரையில் உள்ள மீனாட்சி அம்மன் கோவில் அவர்களின் மிகவும் பிரபலமான கட்டிடக்கலை சாதனையாகும். பல நீர்த்தொட்டிகள், நீர்ப்பாசன அமைப்புகள் மற்றும் கோட்டைகளை கட்டினர்."
    },
    tradeAndEconomy: {
      en: "The Pandiyas controlled lucrative pearl fisheries and engaged in extensive maritime trade with Rome, Arabia, and Southeast Asia. They exported pearls, textiles, spices, and precious stones. Their economy was also based on agriculture, with advanced irrigation systems.",
      ta: "பாண்டியர்கள் லாபகரமான முத்து மீன்பிடித்தலை கட்டுப்படுத்தி, ரோம், அரேபியா மற்றும் தென்கிழக்கு ஆசியாவுடன் விரிவான கடல் வாணிபத்தில் ஈடுபட்டனர். முத்துகள், ஜவுளி, மசாலா மற்றும் விலைமதிப்பற்ற கற்களை ஏற்றுமதி செய்தனர். மேம்பட்ட நீர்ப்பாசன அமைப்புகளுடன் விவசாயத்தையும் அடிப்படையாகக் கொண்ட பொருளாதாரம் இருந்தது."
    },
    legacy: {
      en: "The Pandiya Dynasty left an enduring legacy in Tamil culture and literature. Their patronage of the Tamil language helped preserve and promote one of the world's oldest classical languages. The Meenakshi Temple continues to be a major pilgrimage site and architectural wonder.",
      ta: "பாண்டிய வம்சம் தமிழ் பண்பாடு மற்றும் இலக்கியத்தில் நீடித்த மரபை விட்டுச் சென்றது. தமிழ் மொழிக்கு அவர்கள் அளித்த ஆதரவு உலகின் பழமையான செம்மொழிகளில் ஒன்றைப் பாதுகாக்கவும் ஊக்குவிக்கவும் உதவியது. மீனாட்சி கோவில் தொடர்ந்து ஒரு முக்கிய புண்ணிய தலமாகவும் கட்டிடக்கலை அதிசயமாகவும் உள்ளது."
    },
    flag: "https://yt3.googleusercontent.com/ICLjJKZ0_mSIvsO-G00WfgpMWw6NWiNifNAFFW9jf7QhboKOaczaqyuFEVntaoWr7oQvFkf97A=s160-c-k-c0x00ffffff-no-rj",
    image: "https://www.tamilNadu.com/img/madurai-meenakshi-temple.jpg"
  },
  {
    name: {
      en: "Chola Dynasty",
      ta: "சோழ வம்சம்"
    },
    slug: "chola",
    period: {
      en: "300 BCE - 1279 CE",
      ta: "கி.மு. 300 - கி.பி. 1279"
    },
    capital: {
      en: "Thanjavur (later capitals: Gangaikonda Cholapuram, Uraiyur)",
      ta: "தஞ்சாவூர் (பிற்காலத் தலைநகரங்கள்: கங்கை கொண்ட சோழபுரம், உறையூர்)"
    },
    territory: {
      en: "Tamil Nadu, parts of Andhra Pradesh, Karnataka, Kerala, Odisha, Sri Lanka, Maldives, and parts of Southeast Asia",
      ta: "தமிழ்நாடு, ஆந்திரா, கர்நாடகா, கேரளா, ஒடிசா, இலங்கை, மாலத்தீவு மற்றும் தென்கிழக்கு ஆசியாவின் சில பகுதிகள்"
    },
    rulers: {
      en: "Karikala Chola, Vijayalaya Chola, Raja Raja Chola I, Rajendra Chola I, Kulottunga Chola I",
      ta: "கரிகால சோழன், விஜயாலய சோழன், ராஜராஜ சோழன் I, ராஜேந்திர சோழன் I, குலோத்துங்க சோழன் I"
    },
    achievements: {
      en: "• Construction of Brihadeeswara Temple (UNESCO World Heritage Site)\n• Naval conquests reaching Sri Lanka and Southeast Asia\n• Advanced administrative system\n• Development of bronze sculpture art\n• Extensive irrigation projects\n• Patronage of Tamil literature and arts",
      ta: "• பிரகதீஸ்வரர் கோவில் கட்டுமானம் (யுனெஸ்கோ உலக பாரம்பரிய தளம்)\n• இலங்கை மற்றும் தென்கிழக்கு ஆசியா வரை கடற்படை வெற்றிகள்\n• மேம்பட்ட நிர்வாக அமைப்பு\n• வெண்கல சிற்ப கலை வளர்ச்சி\n• விரிவான நீர்ப்பாசன திட்டங்கள்\n• தமிழ் இலக்கியம் மற்றும் கலைகளுக்கு ஆதரவு"
    },
    description: {
      en: "The Chola Dynasty was one of the longest-ruling dynasties in southern India and is considered one of the greatest empires in Indian history. At its peak under Raja Raja Chola I and Rajendra Chola I, the empire extended from the Tungabhadra River in the north to Sri Lanka in the south, and from the Maldives in the west to parts of Southeast Asia in the east.",
      ta: "சோழ வம்சம் தென்னிந்தியாவில் மிக நீண்ட காலம் ஆட்சி செய்த வம்சங்களில் ஒன்றாகும் மற்றும் இந்திய வரலாற்றில் மிகப் பெரிய பேரரசுகளில் ஒன்றாக கருதப்படுகிறது. ராஜராஜ சோழன் I மற்றும் ராஜேந்திர சோழன் I காலத்தில் அதன் உச்சத்தில், பேரரசு வடக்கில் துங்கபத்ரா ஆற்றிலிருந்து தெற்கில் இலங்கை வரையிலும், மேற்கில் மாலத்தீவு முதல் கிழக்கில் தென்கிழக்கு ஆசியாவின் சில பகுதிகள் வரையிலும் விரிந்திருந்தது."
    },
    militaryStrength: {
      en: "The Chola military was renowned for its powerful navy, which dominated the Bay of Bengal and the Indian Ocean. They had a well-organized army with cavalry, elephants, and infantry. Their naval expeditions reached as far as the Srivijaya Empire in Southeast Asia.",
      ta: "சோழர் இராணுவம் வங்காள விரிகுடா மற்றும் இந்தியப் பெருங்கடலில் ஆதிக்கம் செலுத்திய வலுவான கடற்படைக்கு பெயர் பெற்றது. குதிரைப்படை, யானைப்படை மற்றும் காலாட்படையுடன் நன்கு ஒழுங்கமைக்கப்பட்ட படை இருந்தது. அவர்களின் கடற்படை பயணங்கள் தென்கிழக்கு ஆசியாவில் உள்ள ஸ்ரீவிஜய பேரரசு வரை சென்றன."
    },
    culturalContributions: {
      en: "The Chola period is often called the Golden Age of Tamil culture. They were great patrons of art, architecture, and literature. The famous Nataraja bronze sculptures were perfected during this period. They built numerous temples with intricate architecture and sponsored Tamil literary works.",
      ta: "சோழர் காலம் பெரும்பாலும் தமிழ் பண்பாட்டின் பொற்காலம் என அழைக்கப்படுகிறது. கலை, கட்டிடக்கலை மற்றும் இலக்கியத்தின் பெரும் ஆதரவாளர்களாக இருந்தனர். புகழ்பெற்ற நடராஜர் வெண்கல சிற்பங்கள் இந்த காலத்தில் முழுமை பெற்றன. சிக்கலான கட்டிடக்கலையுடன் பல கோவில்களை கட்டி தமிழ் இலக்கிய படைப்புகளுக்கு நிதியுதவி செய்தனர்."
    },
    architecture: {
      en: "Chola architecture represents the zenith of South Indian temple architecture. The Brihadeeswara Temple in Thanjavur, with its 216-foot vimana, is a UNESCO World Heritage Site. They also built the Airavatesvara Temple and Gangaikonda Cholapuram Temple, showcasing advanced engineering and artistic skills.",
      ta: "சோழர் கட்டிடக்கலை தென்னிந்திய கோவில் கட்டிடக்கலையின் உச்சத்தை பிரதிநிதித்துவப்படுத்துகிறது. தஞ்சாவூரில் உள்ள பிரகதீஸ்வரர் கோவில் அதன் 216 அடி விமானத்துடன் யுனெஸ்கோ உலக பாரம்பரிய தளமாகும். ஐராவதேஸ்வரர் கோவில் மற்றும் கங்கை கொண்ட சோழபுரம் கோவிலையும் கட்டி, மேம்பட்ட பொறியியல் மற்றும் கலைத் திறன்களை வெளிப்படுத்தினர்."
    },
    tradeAndEconomy: {
      en: "The Cholas had extensive trade networks spanning the Indian Ocean. They traded with China, Southeast Asia, Arabia, and East Africa. Their economy was based on agriculture, with sophisticated irrigation systems including the Grand Anicut dam. They also had a well-developed administrative system for tax collection.",
      ta: "சோழர்கள் இந்தியப் பெருங்கடல் முழுவதும் விரிந்த வாணிப வலைப்பின்னல்களை கொண்டிருந்தனர். சீனா, தென்கிழக்கு ஆசியா, அரேபியா மற்றும் கிழக்கு ஆப்பிரிக்காவுடன் வாணிபம் செய்தனர். கிராண்ட் அணைக்கட்டு உள்ளிட்ட அதிநவீன நீர்ப்பாசன அமைப்புகளுடன் விவசாயத்தை அடிப்படையாகக் கொண்ட பொருளாதாரம் இருந்தது. வரி வசூலுக்கான நன்கு வளர்ச்சியடைந்த நிர்வாக அமைப்பும் இருந்தது."
    },
    legacy: {
      en: "The Chola Dynasty left an unparalleled legacy in art, architecture, administration, and maritime power. Their temples continue to inspire architects worldwide. The Chola bronze sculptures are considered masterpieces of Indian art. Their administrative innovations influenced governance in South India for centuries.",
      ta: "சோழ வம்சம் கலை, கட்டிடக்கலை, நிர்வாகம் மற்றும் கடல்சார் சக்தியில் இணையற்ற மரபை விட்டுச் சென்றது. அவர்களின் கோவில்கள் உலகம் முழுவதும் கட்டிடக் கலைஞர்களுக்கு தொடர்ந்து உத்வேகம் அளிக்கின்றன. சோழர் வெண்கல சிற்பங்கள் இந்திய கலையின் தலைசிறந்த படைப்புகளாக கருதப்படுகின்றன. அவர்களின் நிர்வாக புதுமைகள் பல நூற்றாண்டுகளாக தென்னிந்தியாவில் ஆட்சியை பாதித்தன."
    },
    flag: "https://ae01.alicdn.com/kf/H6f548d445be04d79a1b534aa2467d1e6u.jpg",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Thanjavur_Brihadeeswara_Temple.jpg/800px-Thanjavur_Brihadeeswara_Temple.jpg"
  },
  {
    name: {
      en: "Chera Dynasty",
      ta: "சேர வம்சம்"
    },
    slug: "chera",
    period: {
      en: "300 BCE - 1102 CE",
      ta: "கி.மு. 300 - கி.பி. 1102"
    },
    capital: {
      en: "Karur, later Vanchi (Kodungallur)",
      ta: "கரூர், பின்னர் வஞ்சி (கொடுங்கல்லூர்)"
    },
    territory: {
      en: "Western Tamil Nadu, Kerala, and Kongu region",
      ta: "மேற்கு தமிழ்நாடு, கேரளா மற்றும் கொங்கு பகுதி"
    },
    rulers: {
      en: "Uthiyan Cheralathan, Senguttuvan, Cheran Senguttuvan, Kulasekhara Alwar",
      ta: "உதியன் சேரலாதன், செங்குட்டுவன், சேரன் செங்குட்டுவன், குலசேகர ஆழ்வார்"
    },
    achievements: {
      en: "• Control of spice trade routes\n• Patronage of Sangam literature\n• Maritime trade with Rome and Arabia\n• Construction of ports along Malabar coast\n• Development of pepper cultivation\n• Support for early Christianity and Judaism",
      ta: "• மசாலா வாணிப பாதைகளின் கட்டுப்பாடு\n• சங்க இலக்கியத்திற்கு ஆதரவு\n• ரோம் மற்றும் அரேபியாவுடன் கடல் வாணிபம்\n• மலபார் கடற்கரையில் துறைமுகங்கள் கட்டுமானம்\n• மிளகு சாகுபடி வளர்ச்சி\n• ஆரம்பகால கிறிஸ்தவம் மற்றும் யூத மதத்திற்கு ஆதரவு"
    },
    description: {
      en: "The Chera Dynasty controlled the western coast of the Indian peninsula and was renowned for its spice trade. The Cheras had extensive trade relations with ancient Rome, Arabia, and other Mediterranean civilizations. They were great patrons of Tamil literature and contributed significantly to Sangam poetry.",
      ta: "சேர வம்சம் இந்திய தீபகற்பத்தின் மேற்கு கடற்கரையை கட்டுப்படுத்தியது மற்றும் மசாலா வாணிபத்திற்கு பெயர் பெற்றது. சேரர்கள் பண்டைய ரோம், அரேபியா மற்றும் பிற மத்திய தரைக்கடல் நாகரிகங்களுடன் விரிவான வர்த்தக உறவுகளை கொண்டிருந்தனர். தமிழ் இலக்கியத்தின் பெரும் ஆதரவாளர்களாக இருந்து சங்க கவிதைகளுக்கு குறிப்பிடத்தக்க பங்களிப்பு செய்தனர்."
    },
    militaryStrength: {
      en: "The Chera military was known for its control of mountain passes and strategic hill forts. They maintained a strong navy for protecting trade routes along the Malabar coast. Their warriors were skilled in guerrilla warfare in the Western Ghats.",
      ta: "சேரர் இராணுவம் மலைப்பாதைகள் மற்றும் மூலோபாய மலைக் கோட்டைகளின் கட்டுப்பாட்டிற்கு பெயர் பெற்றது. மலபார் கடற்கரையில் வர்த்தக பாதைகளை பாதுகாக்க வலுவான கடற்படையை பராமரித்தனர். அவர்களின் போர்வீரர்கள் மேற்கு தொடர்ச்சி மலையில் கெரில்லா போரில் திறமையானவர்கள்."
    },
    culturalContributions: {
      en: "The Cheras were significant contributors to Sangam literature, with many poems dedicated to their kings. They supported Tamil poets and scholars. The dynasty was known for its religious tolerance, supporting Hinduism, Buddhism, Jainism, and early Christianity. They played a crucial role in the development of Malayalam language.",
      ta: "சேரர்கள் சங்க இலக்கியத்திற்கு குறிப்பிடத்தக்க பங்களிப்பாளர்களாக இருந்தனர், பல கவிதைகள் அவர்களின் மன்னர்களுக்கு அர்ப்பணிக்கப்பட்டன. தமிழ் கவிஞர்கள் மற்றும் அறிஞர்களுக்கு ஆதரவளித்தனர். இந்து மதம், பௌத்தம், சமணம் மற்றும் ஆரம்பகால கிறிஸ்தவத்தை ஆதரித்து மத சகிப்புத்தன்மைக்கு பெயர் பெற்றனர். மலையாள மொழியின் வளர்ச்சியில் முக்கிய பங்கு வகித்தனர்."
    },
    architecture: {
      en: "Chera architecture included hill forts, temples, and port facilities. They built numerous Shiva and Vishnu temples. The Thiruvanchikulam Temple and various cave temples in Kerala showcase their architectural legacy.",
      ta: "சேர கட்டிடக்கலையில் மலைக் கோட்டைகள், கோவில்கள் மற்றும் துறைமுக வசதிகள் அடங்கும். பல சிவன் மற்றும் விஷ்ணு கோவில்களை கட்டினர். திருவஞ்சிகுளம் கோவில் மற்றும் கேரளாவில் பல குகை கோவில்கள் அவர்களின் கட்டிடக்கலை மரபை காட்டுகின்றன."
    },
    tradeAndEconomy: {
      en: "The Chera economy was primarily based on spice trade, especially pepper and cardamom. They controlled major ports on the Malabar coast and traded extensively with Rome, Arabia, China, and Southeast Asia. They exported spices, timber, pearls, and imported wine, gold, and luxury goods.",
      ta: "சேர பொருளாதாரம் முதன்மையாக மசாலா வாணிபம், குறிப்பாக மிளகு மற்றும் ஏலக்காயை அடிப்படையாகக் கொண்டிருந்தது. மலபார் கடற்கரையில் முக்கிய துறைமுகங்களை கட்டுப்படுத்தி ரோம், அரேபியா, சீனா மற்றும் தென்கிழக்கு ஆசியாவுடன் விரிவாக வாணிபம் செய்தனர். மசாலா, மரம், முத்து ஏற்றுமதி செய்து மது, தங்கம் மற்றும் ஆடம்பர பொருட்களை இறக்குமதி செய்தனர்."
    },
    legacy: {
      en: "The Chera Dynasty's control of spice trade routes shaped global commerce for centuries. Their support for multiple religions created Kerala's unique syncretic culture. They contributed significantly to Tamil Sangam literature and the development of Malayalam language and culture.",
      ta: "சேர வம்சத்தின் மசாலா வர்த்தக பாதைகளின் கட்டுப்பாடு பல நூற்றாண்டுகளாக உலக வாணிபத்தை வடிவமைத்தது. பல மதங்களுக்கு அவர்கள் அளித்த ஆதரவு கேரளாவின் தனித்துவமான ஒருங்கிணைந்த பண்பாட்டை உருவாக்கியது. தமிழ் சங்க இலக்கியம் மற்றும் மலையாள மொழி மற்றும் பண்பாட்டின் வளர்ச்சிக்கு குறிப்பிடத்தக்க பங்களிப்பு செய்தனர்."
    },
    flag: "https://m.media-amazon.com/images/I/616C23TXJZL.jpg",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Muziris_port.jpg/800px-Muziris_port.jpg"
  },
  {
    name: {
      en: "Pallava Dynasty",
      ta: "பல்லவ வம்சம்"
    },
    slug: "pallava",
    period: {
      en: "275 - 897 CE",
      ta: "கி.பி. 275 - 897"
    },
    capital: {
      en: "Kanchipuram",
      ta: "காஞ்சிபுரம்"
    },
    territory: {
      en: "Northern Tamil Nadu, parts of Andhra Pradesh and Karnataka",
      ta: "வடக்கு தமிழ்நாடு, ஆந்திரா மற்றும் கர்நாடகாவின் சில பகுதிகள்"
    },
    rulers: {
      en: "Simhavishnu, Mahendravarman I, Narasimhavarman I (Mamalla), Narasimhavarman II (Rajasimha)",
      ta: "சிம்மவிஷ்ணு, மகேந்திரவர்மன் I, நரசிம்மவர்மன் I (மாமல்லன்), நரசிம்மவர்மன் II (ராஜசிம்மன்)"
    },
    achievements: {
      en: "• Development of Dravidian architecture\n• Rock-cut cave temples and monolithic rathas\n• Shore Temple and Pancha Rathas at Mahabalipuram (UNESCO sites)\n• Development of Pallava script (basis for Southeast Asian scripts)\n• Patronage of Sanskrit and Tamil literature\n• Naval expeditions to Sri Lanka",
      ta: "• திராவிட கட்டிடக்கலை வளர்ச்சி\n• பாறை குடைவரை கோவில்கள் மற்றும் ஒற்றைக்கல் ரதங்கள்\n• மகாபலிபுரத்தில் கடற்கரை கோவில் மற்றும் பஞ்ச ரதங்கள் (யுனெஸ்கோ தளங்கள்)\n• பல்லவ எழுத்து வளர்ச்சி (தென்கிழக்கு ஆசிய எழுத்துகளின் அடிப்படை)\n• சமஸ்கிருத மற்றும் தமிழ் இலக்கியத்திற்கு ஆதரவு\n• இலங்கைக்கு கடற்படை பயணங்கள்"
    },
    description: {
      en: "The Pallava Dynasty was instrumental in the development of South Indian art and architecture. They pioneered the rock-cut architecture and monolithic structures that became hallmarks of Dravidian temple design. The Pallavas were great patrons of both Sanskrit and Tamil literature, contributing to a golden age of cultural synthesis.",
      ta: "பல்லவ வம்சம் தென்னிந்திய கலை மற்றும் கட்டிடக்கலை வளர்ச்சியில் முக்கிய பங்கு வகித்தது. திராவிட கோவில் வடிவமைப்பின் அடையாளங்களாக மாறிய பாறை குடைவரை கட்டிடக்கலை மற்றும் ஒற்றைக்கல் கட்டமைப்புகளுக்கு முன்னோடியாக இருந்தனர். பல்லவர்கள் சமஸ்கிருத மற்றும் தமிழ் இலக்கியத்தின் பெரும் ஆதரவாளர்களாக இருந்து, பண்பாட்டு ஒருங்கிணைப்பின் பொற்காலத்திற்கு பங்களிப்பு செய்தனர்."
    },
    militaryStrength: {
      en: "The Pallava military was known for its cavalry and naval power. They successfully defended against Chalukya invasions and conducted naval expeditions to Sri Lanka. Narasimhavarman I defeated the Chalukya king Pulakeshin II and captured the Chalukya capital.",
      ta: "பல்லவ இராணுவம் அதன் குதிரைப்படை மற்றும் கடற்படை சக்திக்கு பெயர் பெற்றது. சாளுக்கிய படையெடுப்புகளுக்கு எதிராக வெற்றிகரமாக பாதுகாத்து இலங்கைக்கு கடற்படை பயணங்களை நடத்தினர். நரசிம்மவர்மன் I சாளுக்கிய மன்னன் புலிகேசி II-ஐ தோற்கடித்து சாளுக்கிய தலைநகரை கைப்பற்றினார்."
    },
    culturalContributions: {
      en: "The Pallavas revolutionized South Indian architecture with their rock-cut temples and structural temples. They developed the Pallava script which influenced scripts in Thailand, Cambodia, Indonesia, and other Southeast Asian regions. They patronized both Tamil and Sanskrit literature, with Mahendravarman I being a noted playwright.",
      ta: "பல்லவர்கள் தங்கள் பாறை குடைவரை கோவில்கள் மற்றும் கட்டமைப்பு கோவில்களுடன் தென்னிந்திய கட்டிடக்கலையை புரட்சிகரமாக மாற்றினர். தாய்லாந்து, கம்போடியா, இந்தோனேசியா மற்றும் பிற தென்கிழக்கு ஆசிய பகுதிகளில் எழுத்துகளை பாதித்த பல்லவ எழுத்தை வளர்த்தனர். தமிழ் மற்றும் சமஸ்கிருத இலக்கியத்திற்கு ஆதரவளித்தனர், மகேந்திரவர்மன் I ஒரு குறிப்பிடத்தக்க நாடக ஆசிரியராக இருந்தார்."
    },
    architecture: {
      en: "Pallava architecture represents a pivotal phase in South Indian temple design. Starting with rock-cut caves at Mandagapattu, they progressed to monolithic rathas at Mahabalipuram, and finally to structural temples like the Shore Temple and Kailasanatha Temple. Their architectural style influenced all later South Indian dynasties.",
      ta: "பல்லவ கட்டிடக்கலை தென்னிந்திய கோவில் வடிவமைப்பில் ஒரு முக்கிய கட்டத்தை பிரதிநிதித்துவப்படுத்துகிறது. மண்டகப்பட்டில் பாறை குடைவரை குகைகளில் தொடங்கி, மகாபலிபுரத்தில் ஒற்றைக்கல் ரதங்களுக்கு முன்னேறி, இறுதியாக கடற்கரை கோவில் மற்றும் கைலாசநாதர் கோவில் போன்ற கட்டமைப்பு கோவில்களுக்கு வந்தனர். அவர்களின் கட்டிடக்கலை பாணி பிற்கால தென்னிந்திய வம்சங்கள் அனைத்தையும் பாதித்தது."
    },
    tradeAndEconomy: {
      en: "The Pallava economy was based on agriculture, maritime trade, and craft production. They maintained ports along the Coromandel coast and traded with Southeast Asia. Kanchipuram became famous for silk weaving. They collected land revenue and customs duties efficiently.",
      ta: "பல்லவ பொருளாதாரம் விவசாயம், கடல் வாணிபம் மற்றும் கைவினை உற்பத்தியை அடிப்படையாகக் கொண்டிருந்தது. கோரமண்டல் கடற்கரையில் துறைமுகங்களை பராமரித்து தென்கிழக்கு ஆசியாவுடன் வாணிபம் செய்தனர். காஞ்சிபுரம் பட்டு நெசவுக்கு பிரபலமானது. நில வருவாய் மற்றும் சுங்க வரிகளை திறமையாக வசூலித்தனர்."
    },
    legacy: {
      en: "The Pallavas left an indelible mark on South Indian and Southeast Asian culture. Their architectural innovations influenced temple construction for centuries. The Pallava script became the basis for many Southeast Asian writing systems. The monuments at Mahabalipuram remain UNESCO World Heritage Sites and tourist attractions.",
      ta: "பல்லவர்கள் தென்னிந்திய மற்றும் தென்கிழக்கு ஆசிய பண்பாட்டில் அழியாத அடையாளத்தை விட்டுச் சென்றனர். அவர்களின் கட்டிடக்கலை புதுமைகள் பல நூற்றாண்டுகளாக கோவில் கட்டுமானத்தை பாதித்தன. பல்லவ எழுத்து பல தென்கிழக்கு ஆசிய எழுத்து முறைகளுக்கு அடிப்படையாக மாறியது. மகாபலிபுரத்தில் உள்ள நினைவுச்சின்னங்கள் யுனெஸ்கோ உலக பாரம்பரிய தளங்களாகவும் சுற்றுலா தலங்களாகவும் உள்ளன."
    },
    flag: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Simha_flag_of_Pallava_Kingdom.png",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Shore_Temple_Mahabalipuram.jpg/800px-Shore_Temple_Mahabalipuram.jpg"
  },
  {
    name: {
      en: "LTTE",
      ta: "தமிழீழ விடுதலைப் புலிகள்"
    },
    slug: "ltte",
    period: {
      en: "1976 - 2009",
      ta: "1976 - 2009"
    },
    capital: {
      en: "Kilinochchi (de facto)",
      ta: "கிளிநொச்சி (நடைமுறை)"
    },
    territory: {
      en: "Northern and Eastern Sri Lanka (claimed and controlled at peak)",
      ta: "வடக்கு மற்றும் கிழக்கு இலங்கை (உச்சத்தில் உரிமை கோரப்பட்டு கட்டுப்படுத்தப்பட்டது)"
    },
    rulers: {
      en: "Velupillai Prabhakaran (Leader, 1976-2009)",
      ta: "வேலுப்பிள்ளை பிரபாகரன் (தலைவர், 1976-2009)"
    },
    achievements: {
      en: "• Established de facto state administration in Northern Sri Lanka\n• Built independent police, judiciary, and taxation systems\n• Developed Tamil media and cultural institutions\n• Created martyrs' memorials and cultural centers\n• Advanced Tamil nationalist ideology\n• Fought for Tamil self-determination",
      ta: "• வட இலங்கையில் நடைமுறை அரசு நிர்வாகத்தை நிறுவியது\n• சுதந்திர காவல்துறை, நீதித்துறை மற்றும் வரி அமைப்புகளை கட்டியது\n• தமிழ் ஊடகங்கள் மற்றும் கலாச்சார நிறுவனங்களை வளர்த்தது\n• மாவீரர் நினைவுச்சின்னங்கள் மற்றும் கலாச்சார மையங்களை உருவாக்கியது\n• தமிழ் தேசியவாத சித்தாந்தத்தை முன்னேற்றியது\n• தமிழ் சுயநிர்ணய உரிமைக்காக போராடியது"
    },
    description: {
      en: "The Liberation Tigers of Tamil Eelam (LTTE) was a Tamil militant organization that fought for an independent Tamil state in northern and eastern Sri Lanka. Founded in 1976 by Velupillai Prabhakaran, the organization became known for its highly disciplined military structure and fought a prolonged civil war from 1983 to 2009. The conflict arose from decades of discrimination against Tamil minorities and demands for autonomy and self-determination.",
      ta: "தமிழீழ விடுதலைப் புலிகள் (LTTE) வட மற்றும் கிழக்கு இலங்கையில் சுதந்திர தமிழ் அரசுக்காக போராடிய ஒரு தமிழ் போராட்ட அமைப்பாகும். 1976 இல் வேலுப்பிள்ளை பிரபாகரனால் நிறுவப்பட்ட இந்த அமைப்பு அதன் மிகவும் ஒழுக்கமான இராணுவ அமைப்புக்கு பெயர் பெற்றது மற்றும் 1983 முதல் 2009 வரை நீண்ட உள்நாட்டு போரை நடத்தியது. தமிழ் சிறுபான்மையினருக்கு எதிரான பல தசாப்த கால பாகுபாடு மற்றும் சுயாட்சி மற்றும் சுயநிர்ணயம் கோரிக்கைகளிலிருந்து இந்த மோதல் எழுந்தது."
    },
    militaryStrength: {
      en: "The LTTE developed a sophisticated military organization with land, sea, and air capabilities. They were known for innovative guerrilla tactics, suicide bombings, and naval operations. At their peak, they controlled significant territory and operated a de facto navy (Sea Tigers) and air wing (Air Tigers).",
      ta: "LTTE நிலம், கடல் மற்றும் வான திறன்களுடன் அதிநவீன இராணுவ அமைப்பை உருவாக்கியது. புதுமையான கெரில்லா தந்திரங்கள், தற்கொலை குண்டுதாக்குதல்கள் மற்றும் கடற்படை செயல்பாடுகளுக்கு அறியப்பட்டனர். உச்சத்தில், குறிப்பிடத்தக்க பிரதேசத்தை கட்டுப்படுத்தி நடைமுறை கடற்படை (கடற்புலிகள்) மற்றும் விமானப் பிரிவை (வான்புலிகள்) இயக்கினர்."
    },
    culturalContributions: {
      en: "The LTTE promoted Tamil language, culture, and nationalism. They established Tamil schools, libraries, and cultural centers in areas under their control. They commemorated fallen fighters as martyrs (மாவீரர்) and established annual Martyrs' Day (Maaveerar Naal). They produced Tamil literature, music, and films promoting their ideology.",
      ta: "LTTE தமிழ் மொழி, பண்பாடு மற்றும் தேசியவாதத்தை ஊக்குவித்தது. அவர்கள் கட்டுப்பாட்டில் உள்ள பகுதிகளில் தமிழ் பள்ளிகள், நூலகங்கள் மற்றும் கலாச்சார மையங்களை நிறுவினர். இறந்த போராளிகளை மாவீரர்களாக நினைவுகூர்ந்து வருடாந்திர மாவீரர் நாளை நிறுவினர். தங்கள் கொள்கையை ஊக்குவிக்கும் தமிழ் இலக்கியம், இசை மற்றும் திரைப்படங்களை தயாரித்தனர்."
    },
    architecture: {
      en: "The LTTE constructed war memorials, martyrs' cemeteries, administrative buildings, and bunkers in territories under their control. They built the Thuyilum Illam (martyrs' resting places) and various monuments. After the war's end in 2009, many of these structures were destroyed by the Sri Lankan government.",
      ta: "LTTE அவர்கள் கட்டுப்பாட்டில் உள்ள பிரதேசங்களில் போர் நினைவுச்சின்னங்கள், மாவீரர் கல்லறைகள், நிர்வாக கட்டடங்கள் மற்றும் பதுங்கு குழிகளை கட்டியது. துயிலும் இல்லம் (மாவீரர் ஓய்வு இடங்கள்) மற்றும் பல்வேறு நினைவுச்சின்னங்களை கட்டினர். 2009 இல் போர் முடிவுக்கு பிறகு, இந்த கட்டமைப்புகளில் பல இலங்கை அரசாங்கத்தால் அழிக்கப்பட்டன."
    },
    tradeAndEconomy: {
      en: "In areas under LTTE control, they established a taxation system, customs, and economic infrastructure. They ran their own banks, businesses, and international fundraising networks. The organization controlled trade routes and smuggling operations. They also regulated fishing, agriculture, and local commerce in their territories.",
      ta: "LTTE கட்டுப்பாட்டில் உள்ள பகுதிகளில், வரி அமைப்பு, சுங்கம் மற்றும் பொருளாதார உள்கட்டமைப்பை நிறுவினர். சொந்த வங்கிகள், வணிகங்கள் மற்றும் சர்வதேச நிதி திரட்டும் வலைப்பின்னல்களை நடத்தினர். அமைப்பு வர்த்தக பாதைகள் மற்றும் கடத்தல் செயல்பாடுகளை கட்டுப்படுத்தியது. தங்கள் பிரதேசங்களில் மீன்பிடித்தல், விவசாயம் மற்றும் உள்ளூர் வாணிபத்தையும் ஒழுங்குபடுத்தினர்."
    },
    legacy: {
      en: "The LTTE's legacy remains deeply contested. The organization's 30-year armed struggle ended in 2009 with military defeat. The conflict resulted in massive civilian casualties and displacement. Post-war, the Tamil question regarding equality, autonomy, and justice remains unresolved. The LTTE is banned in many countries as a terrorist organization, while some Tamil diaspora communities commemorate their cause.",
      ta: "LTTE இன் மரபு ஆழமாக சர்ச்சைக்குரியதாக உள்ளது. அமைப்பின் 30 ஆண்டு ஆயுதப் போராட்டம் 2009 இல் இராணுவ தோல்வியுடன் முடிவுக்கு வந்தது. மோதல் பாரிய சிவிலியன் உயிரிழப்புகள் மற்றும் இடம்பெயர்வுகளை விளைவித்தது. போருக்குப் பிந்தைய காலத்தில், சமத்துவம், சுயாட்சி மற்றும் நீதி தொடர்பான தமிழ் கேள்வி தீர்க்கப்படாமல் உள்ளது. LTTE பல நாடுகளில் பயங்கரவாத அமைப்பாக தடை செய்யப்பட்டுள்ளது, சில தமிழ் புலம்பெயர்ந்த சமூகங்கள் அவர்களின் நோக்கத்தை நினைவுகூருகின்றன."
    },
    flag: "https://upload.wikimedia.org/wikipedia/en/a/a6/Ltte_emblem.jpg",
    image: "https://www.tamilguardian.com/sites/default/files/styles/article_inner_media_large/public/article-images/Thileepan-01.jpg"
  }
];

async function seedDynasties() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('No MongoDB URI found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing dynasties
    await Dynasty.deleteMany({});
    console.log('Cleared existing dynasties');

    // Insert new dynasties
    const result = await Dynasty.insertMany(dynastiesData);
    console.log(`Successfully inserted ${result.length} dynasties`);

    console.log('\nDynasties seeded:');
    result.forEach(dynasty => {
      console.log(`- ${dynasty.name.en} (${dynasty.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding dynasties:', error);
    process.exit(1);
  }
}

seedDynasties();
