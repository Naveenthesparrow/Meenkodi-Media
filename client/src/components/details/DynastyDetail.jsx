import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Close,
  Edit,
  Explore,
  Language,
  LocalDining,
  MilitaryTech,
  Place,
  Public,
  TempleHindu,
  Timeline,
  Woman,
} from "@mui/icons-material";
import SEO from "../common/SEO";
import MediaUpload from "../common/MediaUpload";
import { useBilingualContent } from "../../utils/bilingualContent";
import { useTranslation } from "react-i18next";

const DYNASTY_DETAILS = {
  pandiya: {
    name: { en: "Pandiya Dynasty", ta: "பாண்டிய வம்சம்" },
    period: { en: "c. 600 BCE - 1650 CE", ta: "கி.மு. 600 - கி.பி. 1650" },
    capital: { en: "Madurai", ta: "மதுரை" },
    region: { en: "Southern Tamilakam", ta: "தென் தமிழகம்" },
    language: { en: "Classical and Middle Tamil", ta: "பழந்தமிழ் மற்றும் நடுத்தர தமிழ்" },
    religion: { en: "Saivism, Vaishnavism, Jain and Buddhist influences", ta: "சைவம், வைணவம், சமணம் மற்றும் பௌத்த தாக்கம்" },
    tagline: { en: "Pearl Crown of the Deep South", ta: "தெற்கின் முத்துக் கிரீடம்" },
    banner:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1900&q=80",
    image: "https://yt3.googleusercontent.com/ICLjJKZ0_mSIvsO-G00WfgpMWw6NWiNifNAFFW9jf7QhboKOaczaqyuFEVntaoWr7oQvFkf97A=s160-c-k-c0x00ffffff-no-rj",
    mapEmbed: "https://www.google.com/maps?q=Madurai&output=embed",
    summary: {
      en: "One of the oldest Tamil polities, the Pandiya realm connected Sangam literary culture, maritime trade, temple institutions, and urban life centered around Madurai.",
      ta: "மிகப் பழமையான தமிழ் அரசாட்சிகளில் ஒன்றான பாண்டியர் ஆட்சி, சங்க இலக்கியம், கடல்சார் வாணிகம், கோவில் மரபு மற்றும் மதுரை நகர வாழ்க்கையுடன் ஆழமாக இணைந்திருந்தது."
    },
    facts: [
      { label: { en: "Peak Port", ta: "முக்கிய துறைமுகம்" }, value: { en: "Korkai", ta: "கோர்கை" } },
      { label: { en: "Legacy", ta: "பாரம்பரியம்" }, value: { en: "Pearl trade and Sangam patronage", ta: "முத்து வாணிகம் மற்றும் சங்க ஆதரவு" } },
      { label: { en: "Political Core", ta: "அரசியல் மையம்" }, value: { en: "Madurai region", ta: "மதுரை பகுதி" } },
    ],
    rulersTitle: { en: "Notable Kings", ta: "புகழ்பெற்ற மன்னர்கள்" },
    rulers: [
      {
        name: "Neduncheliyan",
        reign: "Sangam age",
        portrait: "https://images.unsplash.com/photo-1600012518893-bc54b4fe3f04?auto=format&fit=crop&w=900&q=80",
        note: { en: "Remembered in classical poems for warfare and justice.", ta: "போர் திறனும் நீதிநெறியும் காரணமாக சங்க இலக்கியங்களில் குறிப்பிடப்படுகிறார்." },
        story: {
          en: "Sangam poems portray him as a ruler who balanced martial valor with civic order in the Madurai sphere.",
          ta: "சங்கப் பாடல்கள், மதுரை மண்டலத்தில் வீரத்திற்கும் குடியாட்சி ஒழுங்கிற்கும் சமநிலை கொண்ட மன்னராக அவரைச் சித்தரிக்கின்றன."
        }
      },
      {
        name: "Maravarman Sundara Pandyan",
        reign: "13th century",
        portrait: "https://images.unsplash.com/photo-1616176591924-7a0d48f7f2f7?auto=format&fit=crop&w=900&q=80",
        note: { en: "Expanded authority and temple patronage in the late medieval era.", ta: "மத்தியகால இறுதியில் ஆட்சிச் செல்வாக்கையும் கோவில் ஆதரவையும் விரிவுபடுத்தினார்." },
        story: {
          en: "His reign marks a period of strategic alliances and high-profile religious endowments.",
          ta: "அவரது ஆட்சி, மூலோபாய கூட்டணிகளும் முக்கிய கோவில் தானங்களும் உயர்ந்த காலமாகும்."
        }
      },
      {
        name: "Jatavarman Sundara Pandyan I",
        reign: "1251-1268",
        portrait: "https://images.unsplash.com/photo-1559589689-577aabd1db4b?auto=format&fit=crop&w=900&q=80",
        note: { en: "Known for revenue strength and major temple endowments.", ta: "வருவாய் வலிமை மற்றும் பெரிய கோவில் உதவித்தொகைகளால் அறியப்படுகிறார்." },
        story: {
          en: "He projected royal wealth through temple architecture, ceremonial patronage, and diplomatic influence.",
          ta: "கோவில் கட்டிடங்கள், சடங்கு ஆதரவு, துாதரக செல்வாக்கு மூலம் அரச செழிப்பை வெளிப்படுத்தினார்."
        }
      },
    ],
    wars: [
      { name: { en: "Campaigns against Chola frontiers", ta: "சோழ எல்லைப்பகுதி படையெடுப்புகள்" }, result: { en: "Territorial recovery phases", ta: "பகுதி மீட்பு காலங்கள்" } },
      { name: { en: "Western corridor conflicts", ta: "மேற்கு வழித்தட மோதல்கள்" }, result: { en: "Control over trade belts", ta: "வணிக வளையங்களின் கட்டுப்பாடு" } },
    ],
    architecture: [
      { site: "Meenakshi-Sundareswarar Temple", place: "Madurai", style: "Dravidian expansion", note: { en: "Vast gopurams and ritual urban planning.", ta: "விரிவான கோபுரங்கள் மற்றும் சடங்கு மைய நகர அமைப்பு." } },
      { site: "Koodal Azhagar Temple", place: "Madurai", style: "Early-medieval temple tradition", note: { en: "Important Vaishnavite architectural layer in Pandiya territory.", ta: "பாண்டிய நாட்டின் வைஷ்ணவ கட்டிடக்கலைச் சான்று." } },
    ],
    timeline: [
      { time: "c. 600 BCE", event: { en: "Early Pandiya polity appears in Tamil memory and traditions.", ta: "ஆரம்பகால பாண்டிய ஆட்சி மரபுகளில் தோன்றுகிறது." } },
      { time: "Sangam period", event: { en: "Madurai emerges as a literary and political center.", ta: "மதுரை இலக்கிய மற்றும் அரசியல் மையமாக திகழ்கிறது." } },
      { time: "13th century", event: { en: "Later Pandiya phase marks renewed imperial influence.", ta: "பின்னர் பாண்டியர் காலத்தில் பேரரசுச் செல்வாக்கு மீண்டும் உயர்கிறது." } },
    ],
    culture: [
      { icon: "clothing", title: { en: "Textiles and ornaments", ta: "உடை மற்றும் ஆபரணம்" }, text: { en: "Fine cottons, pearl ornaments, and ceremonial attire were status symbols.", ta: "நுண் பருத்தி, முத்து ஆபரணங்கள், சடங்கு உடைகள் சமூக அடையாளங்களாக இருந்தன." } },
      { icon: "food", title: { en: "Cuisine", ta: "உணவு" }, text: { en: "Rice, pulses, coastal fish, and spice-rich preparations shaped everyday meals.", ta: "அரிசி, பருப்பு, கடலுணவு, சுவைமிக்க சமையல் ஆகியவை தினசரி உணவாக இருந்தன." } },
      { icon: "women", title: { en: "Role of women", ta: "பெண்களின் பங்கு" }, text: { en: "Women appear in literature as patrons, poets, traders, and ritual participants.", ta: "இலக்கியங்களில் பெண்கள் ஆதரவாளர்கள், கவிஞர்கள், வணிகர்கள், சடங்கு பங்கேற்பாளர்கள் எனத் தோன்றுகின்றனர்." } },
    ],
    tradeRoutes: [
      { en: "Pandiyan ports to Roman Red Sea markets", ta: "பாண்டிய துறைமுகங்கள் முதல் ரோமர் செம்மஞ்சள் கடல் சந்தைகள் வரை" },
      { en: "Indian Ocean shipping links with Sri Lanka and Southeast Asia", ta: "இலங்கை மற்றும் தென்கிழக்கு ஆசியாவுடன் இந்தியப் பெருங்கடல் கப்பற் பாதைகள்" },
    ],
    evidence: [
      { type: { en: "Stone inscriptions", ta: "கற்கல்வெட்டுகள்" }, text: { en: "Temple walls record grants, taxes, and social agreements.", ta: "கோவில் சுவர்களில் தானங்கள், வரிகள், சமூக ஒப்பந்தங்கள் பதிவு செய்யப்பட்டுள்ளன." } },
      { type: { en: "Copper plates", ta: "செம்புத்தகடுகள்" }, text: { en: "Royal charters preserve legal and territorial decisions.", ta: "அரசாணைகள் சட்ட மற்றும் நில தீர்மானங்களைச் சான்றாகப் பாதுகாக்கின்றன." } },
    ],
    legacyQuote: { en: "Power fades. Heritage remains.", ta: "அரசுகள் மாறினாலும் மரபு நிலைக்கும்." },
    media: { en: "Dynasty visual documentary", ta: "வம்ச காட்சிப்பட ஆவணப்படம்" },
  },
  chera: {
    name: { en: "Chera Dynasty", ta: "சேர வம்சம்" },
    period: { en: "c. 300 BCE - 1102 CE", ta: "கி.மு. 300 - கி.பி. 1102" },
    capital: { en: "Vanchi (traditionally identified)", ta: "வஞ்சி (பாரம்பரிய அடையாளம்)" },
    region: { en: "Western Tamil regions", ta: "மேற்கு தமிழ் பகுதிகள்" },
    language: { en: "Tamil and trade multilingual contact", ta: "தமிழ் மற்றும் வணிக பன்மொழி தொடர்புகள்" },
    religion: { en: "Hindu, Jain, Buddhist currents", ta: "இந்துமதம், சமணம், பௌத்தப் போக்குகள்" },
    tagline: { en: "Masters of Mountain and Monsoon Trade", ta: "மலைவும் மழைக்கடலும் இணைத்த வணிக வல்லரசு" },
    banner:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1900&q=80",
    image: "https://m.media-amazon.com/images/I/616C23TXJZL.jpg",
    mapEmbed: "https://www.google.com/maps?q=Kodungallur&output=embed",
    summary: {
      en: "The Cheras connected the western Tamil country with Indian Ocean routes through spice commerce, ports, and inland trade corridors.",
      ta: "சேரர்கள், மசாலா வாணிகம், துறைமுகங்கள் மற்றும் உள்நாட்டு வணிக வழிகள் மூலம் மேற்கு தமிழ்நாட்டை இந்தியப் பெருங்கடல் வணிகத்துடன் இணைத்தனர்."
    },
    facts: [
      { label: { en: "Trade Strength", ta: "வணிக வலிமை" }, value: { en: "Pepper and forest produce", ta: "மிளகு மற்றும் காடுவளம்" } },
      { label: { en: "Sea Links", ta: "கடல் இணைப்பு" }, value: { en: "Arabian Sea routes", ta: "அரபிக்கடல் வணிகப்பாதை" } },
      { label: { en: "Literary Presence", ta: "இலக்கிய சான்று" }, value: { en: "Sangam references", ta: "சங்க இலக்கிய குறிப்புகள்" } },
    ],
    rulersTitle: { en: "Notable Kings", ta: "புகழ்பெற்ற மன்னர்கள்" },
    rulers: [
      { name: "Uthiyan Cheralathan", reign: "Early Sangam age", portrait: "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=900&q=80", note: { en: "One of the earliest celebrated Chera rulers.", ta: "சங்ககாலத்தில் குறிப்பிடப்படும் ஆரம்ப சேரர் மன்னர்." }, story: { en: "His memory survives in bardic praise poetry and dynastic origin narratives.", ta: "பாடகர் மரபு கவிதைகளிலும் வம்ச தொடக்கக் கதைகளிலும் அவரது நினைவு தொடர்கிறது." } },
      { name: "Senguttuvan Chera", reign: "c. 2nd century CE", portrait: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80", note: { en: "Associated with Pattini cult traditions and heroic literary memory.", ta: "பட்டினி மரபும் வீர வரலாறும் தொடர்புடையவர்." }, story: { en: "A ruler tied to ritual prestige, route-control politics, and literary symbolism.", ta: "சடங்கு பெருமை, வழித்தட அரசியல், இலக்கியச் சின்னவியல் ஆகியவற்றுடன் இணைந்த மன்னர்." } },
      { name: "Kulasekhara Chera", reign: "Medieval era", portrait: "https://images.unsplash.com/photo-1595833058224-3d5f0f8d5f7f?auto=format&fit=crop&w=900&q=80", note: { en: "Linked with temple patronage and regional political consolidation.", ta: "கோவில் ஆதரவும் பிராந்திய அரசியல் ஒருங்கிணைப்பும் தொடர்புடையவர்." }, story: { en: "His period reflects a transition toward later regional temple-state structures.", ta: "அவரது காலம் பின்னர் கோவில்-மாநில அமைப்புகளுக்கான மாற்றத்தை காட்டுகிறது." } },
    ],
    wars: [
      { name: { en: "Western passes and hill conflicts", ta: "மேற்கு மலைவழி மோதல்கள்" }, result: { en: "Secured movement of spice caravans", ta: "மசாலா கரவான்களின் பாதுகாப்பான இயக்கம்" } },
      { name: { en: "Port rivalries on monsoon coast", ta: "மழைக்கரை துறைமுகப் போட்டிகள்" }, result: { en: "Strategic customs and port control", ta: "சுங்க மற்றும் துறைமுக கட்டுப்பாடு" } },
    ],
    architecture: [
      { site: "Muziris-Kodungallur zone", place: "Kerala coast", style: "Port-urban heritage", note: { en: "Represents maritime exchange culture of early Chera realm.", ta: "ஆரம்ப சேரர் கடல்சார் பரிமாற்ற மரபை பிரதிபலிக்கிறது." } },
      { site: "Bhagavathy temple traditions", place: "Kodungallur", style: "Regional temple continuity", note: { en: "Religious institutions connected to long-term local power.", ta: "நீண்டகால உள்ளூர் ஆட்சியுடன் இணைந்த மத மரபுகள்." } },
    ],
    timeline: [
      { time: "c. 300 BCE", event: { en: "Early Chera identity appears in Tamil historical memory.", ta: "சேரர் அடையாளம் ஆரம்பகால வரலாற்று நினைவில் தோன்றுகிறது." } },
      { time: "1st-3rd c. CE", event: { en: "Roman-linked trade peaks through western ports.", ta: "மேற்கு துறைமுகங்களில் ரோமர் தொடர்புடைய வணிகம் உயரும்." } },
      { time: "Medieval phase", event: { en: "Successor Chera polities continue regional influence.", ta: "பின்னர் சேர அரசுகள் பிராந்திய செல்வாக்கைத் தொடர்கின்றன." } },
    ],
    culture: [
      { icon: "clothing", title: { en: "Highland and coastal styles", ta: "மலை மற்றும் கடற்கரை உடைமுறைகள்" }, text: { en: "Regional dressing reflected climate diversity and trade access.", ta: "வானிலை வேறுபாடும் வாணிகத் தொடர்பும் உடை மரபை நிர்ணயித்தன." } },
      { icon: "food", title: { en: "Pepper coast cuisine", ta: "மிளகுக் கரை சமையல்" }, text: { en: "Coconut, pepper, rice, and fish shaped culinary signatures.", ta: "தேங்காய், மிளகு, அரிசி, மீன் ஆகியவை உணவு அடையாளமாக இருந்தன." } },
      { icon: "women", title: { en: "Women in commerce", ta: "வணிகத்தில் பெண்கள்" }, text: { en: "Literary and oral traditions indicate women in local markets and ritual economy.", ta: "உள்ளூர் சந்தை மற்றும் சடங்கு பொருளாதாரத்தில் பெண்கள் பங்கு கொண்டதை மரபுகள் காட்டுகின்றன." } },
    ],
    tradeRoutes: [
      { en: "Pepper routes to Roman and West Asian traders", ta: "ரோமர் மற்றும் மேற்கு ஆசிய வணிகர்களுக்கு மிளகு பாதைகள்" },
      { en: "Inland hill products linked to coastal ports", ta: "மலைப்பகுதி பொருட்கள் கடலோர துறைமுகங்களுடன் இணைப்பு" },
    ],
    evidence: [
      { type: { en: "Hero stones and inscriptions", ta: "வீரக்கற்கள் மற்றும் கல்வெட்டுகள்" }, text: { en: "Document local chiefs, routes, and social contracts.", ta: "உள்ளூர் தலைவர்கள், பாதைகள், சமூக ஒப்பந்தங்களை சான்றிடுகின்றன." } },
      { type: { en: "Port archaeology", ta: "துறைமுகத் தொல்லியல்" }, text: { en: "Imported ceramics and trade goods reveal global links.", ta: "இறக்குமதி பானைகள் மற்றும் பொருட்கள் உலக வணிகத் தொடர்பை காட்டுகின்றன." } },
    ],
    legacyQuote: { en: "Where monsoon winds blew, Chera trade followed.", ta: "மழைக்காற்று சென்ற இடமெல்லாம் சேரர் வணிகம் சென்றது." },
    media: { en: "Monsoon trade route visual essay", ta: "மழைக்கடல் வணிகப் பாதை காட்சிப்பதிவு" },
  },
  chola: {
    name: { en: "Chola Dynasty", ta: "சோழ வம்சம்" },
    period: { en: "c. 300 BCE - 1279 CE", ta: "கி.மு. 300 - கி.பி. 1279" },
    capital: { en: "Thanjavur and Gangaikonda Cholapuram", ta: "தஞ்சாவூர் மற்றும் கங்கைகொண்ட சோழபுரம்" },
    region: { en: "Kaveri basin and beyond", ta: "காவிரி பள்ளத்தாக்கு மற்றும் அப்பால்" },
    language: { en: "Imperial Tamil and administrative registers", ta: "பேரரசு தமிழ் மற்றும் நிர்வாகப் பதிவுகள்" },
    religion: { en: "Saivism, Vaishnavism, temple-centered statecraft", ta: "சைவம், வைணவம், கோவில் மைய ஆட்சி" },
    tagline: { en: "The Empire that Ruled the Seas", ta: "கடல்களை ஆண்ட பேரரசு" },
    banner:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1900&q=80",
    image: "https://ae01.alicdn.com/kf/H6f548d445be04d79a1b534aa2467d1e6u.jpg",
    mapEmbed: "https://www.google.com/maps?q=Thanjavur+Brihadeeswara+Temple&output=embed",
    summary: {
      en: "The Cholas built one of South Asia's major imperial systems with advanced administration, monumental architecture, inscriptions, and maritime outreach.",
      ta: "சோழர்கள், மேம்பட்ட நிர்வாகம், பிரமாண்ட கட்டிடக்கலை, கல்வெட்டு மரபு மற்றும் கடல்சார் விரிவாக்கத்தால் தென் ஆசியாவின் முக்கிய பேரரசை உருவாக்கினர்."
    },
    facts: [
      { label: { en: "Imperial Core", ta: "பேரரசு மையம்" }, value: { en: "Kaveri delta", ta: "காவிரி டெல்டா" } },
      { label: { en: "Administrative Records", ta: "நிர்வாக ஆதாரங்கள்" }, value: { en: "Extensive inscriptions", ta: "பெருமளவு கல்வெட்டுகள்" } },
      { label: { en: "Maritime Reach", ta: "கடல்சார் செல்வாக்கு" }, value: { en: "Bay of Bengal network", ta: "வங்கக்கடல் வலையமைப்பு" } },
    ],
    rulersTitle: { en: "Notable Kings", ta: "புகழ்பெற்ற மன்னர்கள்" },
    rulers: [
      { name: "Rajaraja Chola I", reign: "985-1014", portrait: "https://images.unsplash.com/photo-1578922864601-79dcc7f1fe8f?auto=format&fit=crop&w=900&q=80", note: { en: "Expanded the empire and commissioned Brihadeeswarar Temple.", ta: "பேரரசை விரிவுபடுத்தி பிரகதீஸ்வரர் கோவிலை நிர்மாணித்தார்." }, story: { en: "His reign fused military force, temple economy, and inscriptional governance into imperial scale.", ta: "படை வலிமை, கோவில் பொருளாதாரம், கல்வெட்டு நிர்வாகம் ஆகியவற்றை பேரரசு அளவில் இணைத்த ஆட்சி இது." } },
      { name: "Rajendra Chola I", reign: "1012-1044", portrait: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=900&q=80", note: { en: "Led naval and northern campaigns and founded Gangaikonda Cholapuram.", ta: "கடற்படை மற்றும் வடக்கு படையெடுப்புகளை நடத்தி கங்கைகொண்ட சோழபுரத்தை நிறுவினார்." }, story: { en: "He transformed Chola prestige into transregional influence through maritime assertion.", ta: "கடல்சார் வலிமை மூலம் சோழப் புகழை பரந்த பிராந்திய செல்வாக்காக மாற்றினார்." } },
      { name: "Kulothunga Chola I", reign: "1070-1122", portrait: "https://images.unsplash.com/photo-1603479505564-66a3b84cb5dc?auto=format&fit=crop&w=900&q=80", note: { en: "Stabilized imperial governance and revenue systems.", ta: "பேரரசு நிர்வாகம் மற்றும் வருவாய் அமைப்பை நிலைப்படுத்தினார்." }, story: { en: "A period of administrative calibration, trade continuity, and temple-state balance.", ta: "நிர்வாக சீரமைப்பு, வாணிகத் தொடர்ச்சி, கோவில்-அரசு சமநிலை கொண்ட காலம்." } },
    ],
    wars: [
      { name: { en: "Kandalur naval assertion", ta: "கந்தளூர் கடற்படை ஆற்றல்" }, result: { en: "Symbolic and strategic sea command", ta: "கடல்சார் அடையாள மற்றும் மூலோபாய வெற்றி" } },
      { name: { en: "Ganges expedition", ta: "கங்கைப் படையெடுப்பு" }, result: { en: "Imperial prestige campaign", ta: "பேரரசு புகழ் நிலைநிறுத்தம்" } },
      { name: { en: "Southeast Asian maritime campaigns", ta: "தென்கிழக்கு ஆசிய கடற்படை முயற்சிகள்" }, result: { en: "Trade route leverage", ta: "வணிகப்பாதை செல்வாக்கு" } },
    ],
    architecture: [
      { site: "Brihadeeswarar Temple", place: "Thanjavur", style: "Imperial granite Dravidian", note: { en: "UNESCO-listed masterpiece of Chola architecture.", ta: "சோழ கட்டிடக்கலையின் உலக பாரம்பரியச் சின்னம்." } },
      { site: "Gangaikonda Cholapuram Temple", place: "Ariyalur district", style: "Refined Dravidian monumental style", note: { en: "Demonstrates mature Chola planning and sculpture.", ta: "முதிர்ந்த சோழ நகர திட்டமிடல் மற்றும் சிற்ப நயம் தெரிகிறது." } },
    ],
    timeline: [
      { time: "Early centuries CE", event: { en: "Early Chola lineages appear in records and poetry.", ta: "ஆரம்ப சோழ மரபுகள் இலக்கியம் மற்றும் பதிவுகளில் தோன்றுகின்றன." } },
      { time: "9th-11th centuries", event: { en: "Imperial Chola expansion transforms peninsular politics.", ta: "பேரரசு சோழ விரிவாக்கம் தென்னிந்திய அரசியலை மாற்றுகிறது." } },
      { time: "13th century", event: { en: "Late Chola decline gives way to successor powers.", ta: "இறுதிக்கால சோழ வீழ்ச்சிக்குப் பின் புதிய ஆட்சிகள் எழுகின்றன." } },
    ],
    culture: [
      { icon: "clothing", title: { en: "Court textiles", ta: "அரண்மனை நெய்தல் மரபு" }, text: { en: "Fine silks, cotton weaves, and elite ornaments marked social rank.", ta: "பட்டு, பருத்தி நெய்தல், அலங்கார ஆபரணங்கள் சமூக நிலையை காட்டின." } },
      { icon: "food", title: { en: "Delta agrarian cuisine", ta: "டெல்டா விவசாய உணவுமுறை" }, text: { en: "Rice surplus, lentils, sesame oils, and spice blends shaped cuisine.", ta: "அரிசி உற்பத்தி, பருப்பு, நல்லெண்ணெய், மசாலா கலவைகள் உணவின் அடிப்படை." } },
      { icon: "women", title: { en: "Women in temple and urban economy", ta: "கோவில் மற்றும் நகர பொருளாதாரத்தில் பெண்கள்" }, text: { en: "Inscriptions indicate women donors, administrators, and performers.", ta: "பெண்கள் தானதரர்கள், நிர்வாகிகள், கலைஞர்கள் என கல்வெட்டுகள் சான்றளிக்கின்றன." } },
    ],
    tradeRoutes: [
      { en: "Nagapattinam to Srivijaya sea corridors", ta: "நாகப்பட்டினம் முதல் ஸ்ரிவிஜயா கடல் பாதைகள்" },
      { en: "Textile and metal exports to Southeast Asia and China", ta: "துணி மற்றும் உலோக ஏற்றுமதி தென்கிழக்கு ஆசியா, சீனா வரை" },
    ],
    evidence: [
      { type: { en: "Temple inscriptions", ta: "கோவில் கல்வெட்டுகள்" }, text: { en: "Granular records of taxation, irrigation, and village assemblies.", ta: "வரி, பாசனம், ஊராட்சி அமைப்புகள் குறித்த நுணுக்கப் பதிவுகள்." } },
      { type: { en: "Copper plate charters", ta: "செம்பு பலகை சாசனங்கள்" }, text: { en: "Legal grants and political claims preserved for institutions.", ta: "சட்ட தானங்கள் மற்றும் அரசியல் உரிமைகள் ஆவணப்படுத்தப்பட்டுள்ளன." } },
    ],
    legacyQuote: { en: "Stone, script, and sea made Chola memory immortal.", ta: "கல், கல்வெட்டு, கடல் - சோழ மரபை நித்தியமாக்கின." },
    media: { en: "Imperial Chola cinematic sequence", ta: "பேரரசு சோழ காட்சித் தொகுப்பு" },
  },
  pallava: {
    name: { en: "Pallava Dynasty", ta: "பல்லவ வம்சம்" },
    period: { en: "c. 275 - 897 CE", ta: "கி.பி. 275 - 897" },
    capital: { en: "Kanchipuram", ta: "காஞ்சிபுரம்" },
    region: { en: "Northern Tamil regions", ta: "வடதமிழகப் பகுதிகள்" },
    language: { en: "Tamil and Sanskrit court traditions", ta: "தமிழ் மற்றும் சமஸ்கிருத அரச மரபு" },
    religion: { en: "Saiva and Vaishnava temple traditions", ta: "சைவ மற்றும் வைணவ கோவில் மரபுகள்" },
    tagline: { en: "Sculptors of Stone and State", ta: "கல்லில் நாட்டை செதுக்கியவர்கள்" },
    banner:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1900&q=80",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Simha_flag_of_Pallava_Kingdom.png",
    mapEmbed: "https://www.google.com/maps?q=Mamallapuram+Shore+Temple&output=embed",
    summary: {
      en: "The Pallavas shaped early South Indian stone architecture and urban religious centers, especially Kanchipuram and Mamallapuram.",
      ta: "பல்லவர்கள், காஞ்சிபுரம் மற்றும் மாமல்லபுரத்தை மையமாகக் கொண்டு தொடக்ககால தென்னிந்திய கற்கோவில் கட்டிடக்கலைக்கும் மதநகர வளர்ச்சிக்கும் வழிகாட்டினர்."
    },
    facts: [
      { label: { en: "Artistic Marker", ta: "கலை அடையாளம்" }, value: { en: "Rock-cut temples", ta: "பாறை வெட்டுக் கோவில்கள்" } },
      { label: { en: "Capital", ta: "தலைநகர்" }, value: { en: "Kanchipuram", ta: "காஞ்சிபுரம்" } },
      { label: { en: "Influence", ta: "செல்வாக்கு" }, value: { en: "Later Dravidian architecture", ta: "பின்னர் திராவிட கட்டிடக்கலை" } },
    ],
    rulersTitle: { en: "Notable Kings", ta: "புகழ்பெற்ற மன்னர்கள்" },
    rulers: [
      { name: "Mahendravarman I", reign: "c. 600-630", portrait: "https://images.unsplash.com/photo-1603297631958-f5f0d6f7f6a0?auto=format&fit=crop&w=900&q=80", note: { en: "Promoted early rock-cut temple experimentation.", ta: "ஆரம்ப பாறை வெட்டுக் கோவில் வடிவங்களில் முன்னேற்றம் செய்தார்." }, story: { en: "A patron of architectural innovation and court culture.", ta: "கட்டிடக் கலை புதுமைக்கும் அரசகுடி கலாசாரத்திற்கும் ஆதரவளித்தவர்." } },
      { name: "Narasimhavarman I", reign: "c. 630-668", portrait: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80", note: { en: "Associated with Mamallapuram monuments and military success.", ta: "மாமல்லபுரச் சின்னங்களும் படைத்துறை வெற்றியும் இவருடன் தொடர்புடையவை." }, story: { en: "His era shaped the monumental identity of Pallava art on the coast.", ta: "அவரது காலம் கடற்கரைப் பல்லவக் கலைக்கு பிரமாண்ட அடையாளம் தந்தது." } },
      { name: "Nandivarman II", reign: "c. 731-796", portrait: "https://images.unsplash.com/photo-1578922864601-79dcc7f1fe8f?auto=format&fit=crop&w=900&q=80", note: { en: "Reinforced Pallava continuity during political challenges.", ta: "அரசியல் சவால்களிடையே பல்லவ ஆட்சியை நிலைநிறுத்தினார்." }, story: { en: "A ruler remembered for institutional resilience and court diplomacy.", ta: "அமைப்புச் சீர்மை மற்றும் துாதரக சமநிலைக்காக நினைவுகூரப்படும் ஆட்சி." } },
    ],
    wars: [
      { name: { en: "Pallava-Chalukya confrontations", ta: "பல்லவ-சாளுக்கிய மோதல்கள்" }, result: { en: "Control over Deccan-Tamil corridors", ta: "தெக்கான்-தமிழ் வழித்தடக் கட்டுப்பாடு" } },
      { name: { en: "Coastal defense campaigns", ta: "கடற்கரை பாதுகாப்புப் போர்கள்" }, result: { en: "Secured Mamallapuram maritime line", ta: "மாமல்லபுரம் கடல்சார் வரியை பாதுகாத்தது" } },
    ],
    architecture: [
      { site: "Shore Temple", place: "Mamallapuram", style: "Early structural granite temple", note: { en: "Iconic coastal temple complex.", ta: "கடற்கரைப் பகுதியின் புகழ்பெற்ற கோவில் அமைப்பு." } },
      { site: "Kailasanatha Temple", place: "Kanchipuram", style: "Pallava structural Dravidian", note: { en: "Key model for later temple superstructures.", ta: "பின்னர் கோவில் வடிவமைப்புகளுக்கான முன்னுதாரணம்." } },
    ],
    timeline: [
      { time: "3rd-6th centuries", event: { en: "Pallava political identity consolidates in northern Tamil country.", ta: "வடதமிழகத்தில் பல்லவ அரசியல் அடையாளம் உறுதியாகிறது." } },
      { time: "7th-8th centuries", event: { en: "Peak era of temple architecture and royal inscriptions.", ta: "கோவில் கட்டிடக்கலை மற்றும் அரச கல்வெட்டுகளின் உச்சகட்டம்." } },
      { time: "Late 9th century", event: { en: "Power transitions to rising regional kingdoms.", ta: "பிராந்திய புதிய ஆட்சிகளுக்கு அதிகாரம் மாறுகிறது." } },
    ],
    culture: [
      { icon: "clothing", title: { en: "Court attire and iconography", ta: "அரச உடை மற்றும் சின்னவியல்" }, text: { en: "Sculptural panels preserve details of elite and devotional dress forms.", ta: "சிற்பங்களில் அரச மற்றும் பக்தி உடை மரபுகள் பதியப்பட்டுள்ளன." } },
      { icon: "food", title: { en: "Temple-town diets", ta: "கோவில் நகர உணவுமுறை" }, text: { en: "Rice, lentils, oil seeds, and ritual food systems supported urban centers.", ta: "அரிசி, பருப்பு, எண்ணெய் விதைகள், சடங்கு உணவு முறை நகர வாழ்வை ஆதரித்தன." } },
      { icon: "women", title: { en: "Women in arts and devotion", ta: "கலை மற்றும் பக்தியில் பெண்கள்" }, text: { en: "Artistic and devotional communities included key female participation.", ta: "கலை மற்றும் பக்தி சமூகங்களில் பெண்களின் பங்கு முக்கியமானது." } },
    ],
    tradeRoutes: [
      { en: "Coromandel coast maritime links", ta: "கோரமண்டல் கடற்கரை கடல்சார் இணைப்புகள்" },
      { en: "Craft circulation between inland Kanchi and ports", ta: "உள் நில காஞ்சி மற்றும் துறைமுகங்களுக்கு இடையிலான கைவினைப் பரிமாற்றம்" },
    ],
    evidence: [
      { type: { en: "Rock-cut records", ta: "பாறை வெட்டு பதிவுகள்" }, text: { en: "Early inscriptions tie kingship with sacred architecture.", ta: "ஆரம்ப கல்வெட்டுகள் அரசாட்சியையும் கோவில் கட்டிடத்தையும் இணைக்கின்றன." } },
      { type: { en: "Monument panels", ta: "சின்னச் சிற்ப பலகைகள்" }, text: { en: "Visual narratives reveal political and ritual life.", ta: "சிற்ப காட்சிகள் அரசியல் மற்றும் சடங்கு வாழ்வை விளக்குகின்றன." } },
    ],
    legacyQuote: { en: "In Pallava stone, Tamil civilization found a new visual language.", ta: "பல்லவக் கல்லில் தமிழ் நாகரிகம் புதிய காட்சி மொழியை கண்டது." },
    media: { en: "Mamallapuram monument walk-through", ta: "மாமல்லபுரம் நினைவுச்சின்ன காட்சி நடை" },
  },
  ltte: {
    name: { en: "LTTE", ta: "தமிழீழ விடுதலைப் புலிகள்" },
    period: { en: "1976 - 2009", ta: "1976 - 2009" },
    capital: { en: "Northern Sri Lanka conflict regions", ta: "இலங்கை வடக்கு மோதல் பகுதிகள்" },
    region: { en: "Jaffna and surrounding regions", ta: "யாழ்ப்பாணம் மற்றும் சுற்றுப் பகுதிகள்" },
    language: { en: "Tamil", ta: "தமிழ்" },
    religion: { en: "Plural social background", ta: "பல்வேறு சமூகப் பின்னணிகள்" },
    tagline: { en: "A Difficult Modern Chapter", ta: "சிக்கலான நவீன வரலாற்றுத் தொகுப்பு" },
    banner:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1900&q=80",
    image: "https://upload.wikimedia.org/wikipedia/en/a/a6/Ltte_emblem.jpg",
    mapEmbed: "https://www.google.com/maps?q=Jaffna&output=embed",
    summary: {
      en: "This is a modern conflict-era chapter in Tamil history, distinct from ancient dynastic history. It is studied through social, political, and humanitarian perspectives.",
      ta: "இது பண்டைய வம்ச வரலாற்றிலிருந்து வேறுபடும் நவீன மோதல் கால அத்தியாயம். சமூக, அரசியல் மற்றும் மனிதாபிமான பார்வைகளில் இது ஆய்வு செய்யப்படுகிறது."
    },
    facts: [
      { label: { en: "Category", ta: "வகை" }, value: { en: "Modern political-military history", ta: "நவீன அரசியல்-படை வரலாறு" } },
      { label: { en: "Context", ta: "சூழல்" }, value: { en: "Sri Lankan civil conflict", ta: "இலங்கை உள்நாட்டு மோதல்" } },
      { label: { en: "Study Focus", ta: "ஆய்வு மையம்" }, value: { en: "Peace, memory, and reconciliation", ta: "அமைதி, நினைவு, சமரசம்" } },
    ],
    rulersTitle: { en: "Notable Figures", ta: "முக்கிய நபர்கள்" },
    rulers: [
      { name: "Conflict-Era Leadership", reign: "Late 20th century", portrait: "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=900&q=80", note: { en: "Discussed in relation to political conflict and negotiations.", ta: "அரசியல் மோதல் மற்றும் பேச்சுவார்த்தை சூழலில் விவாதிக்கப்படுகிறது." }, story: { en: "This period is read through contested political memories.", ta: "இக்காலம் பல்வேறு அரசியல் நினைவுகளின் வழியாகப் புரிந்துகொள்ளப்படுகிறது." } },
      { name: "Civil Society Voices", reign: "Across decades", portrait: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80", note: { en: "Community narratives remain central to understanding the period.", ta: "இந்த காலத்தைப் புரிந்துகொள்வதில் மக்கள் குரல்கள் முக்கியமானவை." }, story: { en: "Families, journalists, and activists form key archives of memory.", ta: "குடும்பங்கள், பத்திரிகையாளர்கள், செயற்பாட்டாளர்கள் ஆகியோர் நினைவுப் பதிவுகளின் மையமாக உள்ளனர்." } },
    ],
    wars: [
      { name: { en: "Civil conflict phases", ta: "உள்நாட்டு மோதல் கட்டங்கள்" }, result: { en: "Long humanitarian impact", ta: "நீண்டகால மனிதாபிமான பாதிப்பு" } },
      { name: { en: "Ceasefire and breakdown cycles", ta: "போர்நிறுத்தம் மற்றும் முறிவு கட்டங்கள்" }, result: { en: "Repeated attempts at negotiated peace", ta: "மீண்டும் மீண்டும் சமரச முயற்சிகள்" } },
    ],
    architecture: [
      { site: "Memory and memorial landscapes", place: "Northern Sri Lanka", style: "Contemporary remembrance", note: { en: "Sites are approached through human stories and recovery efforts.", ta: "மனித அனுபவங்களும் மீட்பு முயற்சிகளும் மையமாகக் கொண்டு இவை ஆய்வு செய்யப்படுகின்றன." } },
    ],
    timeline: [
      { time: "1976", event: { en: "Organization formally emerges.", ta: "அமைப்பு உத்தியோகபூர்வமாக உருவாகிறது." } },
      { time: "1980s-2000s", event: { en: "Conflict period shapes regional social history.", ta: "மோதல் காலம் பிராந்திய சமூக வரலாற்றை மாற்றுகிறது." } },
      { time: "2009", event: { en: "Conflict ends; memory and reconciliation remain ongoing themes.", ta: "மோதல் முடிவடைந்தது; நினைவு மற்றும் சமரசம் தொடரும் கருப்பொருள்கள்." } },
    ],
    culture: [
      { icon: "clothing", title: { en: "Diaspora identity markers", ta: "புலம்பெயர் அடையாளச் சின்னங்கள்" }, text: { en: "Dress, language, and symbols became tools of memory.", ta: "உடை, மொழி, சின்னங்கள் நினைவின் கருவிகளாக மாறின." } },
      { icon: "food", title: { en: "Displacement and food memory", ta: "இடம்பெயர்வு மற்றும் உணவு நினைவு" }, text: { en: "Cuisine became a portable archive across displaced communities.", ta: "இடம்பெயர்ந்த சமூகங்களில் உணவு மரபு நினைவகமாகத் தொடர்ந்தது." } },
      { icon: "women", title: { en: "Women and survival networks", ta: "பெண்கள் மற்றும் வாழ்வாதார வலையமைப்புகள்" }, text: { en: "Women sustained households, memory work, and social healing.", ta: "பெண்கள் குடும்ப வாழ்வையும் நினைவுப் பணியையும் சமூக மீட்சியையும் தாங்கினர்." } },
    ],
    tradeRoutes: [
      { en: "Diaspora remittance corridors", ta: "புலம்பெயர் பணமாற்று இணைப்புகள்" },
      { en: "Transnational social and political networks", ta: "சர்வதேச சமூக மற்றும் அரசியல் வலையமைப்புகள்" },
    ],
    evidence: [
      { type: { en: "Witness archives", ta: "சாட்சிப் பதிவுகள்" }, text: { en: "Oral histories and testimonies preserve human experience.", ta: "வாய்மொழி வரலாறுகள் மற்றும் சாட்சிகள் மனித அனுபவத்தைப் பாதுகாக்கின்றன." } },
      { type: { en: "Post-war documentation", ta: "போருக்குப் பிந்தைய ஆவணங்கள்" }, text: { en: "Civil records, journalism, and rights documentation remain essential.", ta: "சிவில் பதிவுகள், பத்திரிகை, உரிமை ஆவணங்கள் இன்றும் அத்தியாவசியம்." } },
    ],
    legacyQuote: { en: "History asks for memory with dignity.", ta: "வரலாறு, கண்ணியமான நினைவைக் கோருகிறது." },
    media: { en: "Memory and reconciliation visual archive", ta: "நினைவு மற்றும் சமரசக் காட்சிப் பதிவுகள்" },
  },
};

function TimelineItem({ time, text, isLast }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#8B0000", mt: 0.9 }} />
        {!isLast && <Box sx={{ width: 2, flex: 1, minHeight: 40, bgcolor: "rgba(243,201,105,0.45)", mt: 0.6 }} />}
      </Box>
      <Box sx={{ pb: 2.2 }}>
        <Typography sx={{ color: "#8B0000", fontWeight: 700, fontSize: 13 }}>{time}</Typography>
        <Typography sx={{ color: "#f3e5cf", mt: 0.3, lineHeight: 1.65 }}>{text}</Typography>
      </Box>
    </Box>
  );
}

const getBilingualValue = (value, fallback = { en: "", ta: "" }) => {
  if (!value) return fallback;
  if (typeof value === "string") return { en: value, ta: value };
  return {
    en: value.en ?? fallback.en ?? "",
    ta: value.ta ?? fallback.ta ?? "",
  };
};

const mergeDynastyData = (baseDynasty, apiDynasty) => {
  if (!apiDynasty) return baseDynasty;

  return {
    ...baseDynasty,
    _id: apiDynasty._id || baseDynasty._id,
    name: getBilingualValue(apiDynasty.name, baseDynasty.name),
    tagline: getBilingualValue(apiDynasty.tagline, baseDynasty.tagline),
    period: getBilingualValue(apiDynasty.period, baseDynasty.period),
    capital: getBilingualValue(apiDynasty.capital, baseDynasty.capital),
    region: getBilingualValue(apiDynasty.region || apiDynasty.territory, baseDynasty.region),
    language: getBilingualValue(apiDynasty.language, baseDynasty.language),
    religion: getBilingualValue(apiDynasty.religion, baseDynasty.religion),
    summary: getBilingualValue(apiDynasty.summary || apiDynasty.description, baseDynasty.summary),
    banner: apiDynasty.banner || baseDynasty.banner,
    image: apiDynasty.image || apiDynasty.flag || baseDynasty.image,
    mapEmbed: apiDynasty.mapEmbed || baseDynasty.mapEmbed,
    media: getBilingualValue(apiDynasty.mediaText, baseDynasty.media),
  };
};

export default function DynastyDetail({ user }) {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { i18n } = useTranslation();
  const [selectedKing, setSelectedKing] = useState(null);
  const [dynastyData, setDynastyData] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLanguage, setEditLanguage] = useState("en");
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    tagline_en: "",
    tagline_ta: "",
    period_en: "",
    period_ta: "",
    capital_en: "",
    capital_ta: "",
    region_en: "",
    region_ta: "",
    language_en: "",
    language_ta: "",
    religion_en: "",
    religion_ta: "",
    summary_en: "",
    summary_ta: "",
    banner: "",
    image: "",
    mapEmbed: "",
    media_en: "",
    media_ta: "",
  });

  const dynasty = dynastyData || DYNASTY_DETAILS[slug];
  const relatedDynasties = useMemo(
    () => Object.entries(DYNASTY_DETAILS).filter(([key]) => key !== slug),
    [slug]
  );

  useEffect(() => {
    const baseDynasty = DYNASTY_DETAILS[slug];
    if (!baseDynasty) {
      setDynastyData(null);
      return;
    }

    setDynastyData(baseDynasty);

    let isActive = true;
    const fetchDynasty = async () => {
      try {
        const response = await fetch(`/api/dynasties/${slug}`, {
          credentials: "include",
        });
        if (!response.ok) return;
        const apiDynasty = await response.json();
        if (!isActive) return;
        setDynastyData((prev) => mergeDynastyData(prev || baseDynasty, apiDynasty));
      } catch {
        // Keep static fallback if API data is unavailable.
      }
    };

    fetchDynasty();
    return () => {
      isActive = false;
    };
  }, [slug]);

  const openEditDialog = () => {
    if (!dynasty) return;
    setEditError("");
    setEditLanguage("en");
    setEditableData({
      name_en: dynasty.name?.en || "",
      name_ta: dynasty.name?.ta || "",
      tagline_en: dynasty.tagline?.en || "",
      tagline_ta: dynasty.tagline?.ta || "",
      period_en: dynasty.period?.en || "",
      period_ta: dynasty.period?.ta || "",
      capital_en: dynasty.capital?.en || "",
      capital_ta: dynasty.capital?.ta || "",
      region_en: dynasty.region?.en || "",
      region_ta: dynasty.region?.ta || "",
      language_en: dynasty.language?.en || "",
      language_ta: dynasty.language?.ta || "",
      religion_en: dynasty.religion?.en || "",
      religion_ta: dynasty.religion?.ta || "",
      summary_en: dynasty.summary?.en || "",
      summary_ta: dynasty.summary?.ta || "",
      banner: dynasty.banner || "",
      image: dynasty.image || "",
      mapEmbed: dynasty.mapEmbed || "",
      media_en: dynasty.media?.en || "",
      media_ta: dynasty.media?.ta || "",
    });
    setEditOpen(true);
  };

  useEffect(() => {
    if (location.state?.openEdit && user?.role === "admin" && dynasty) {
      openEditDialog();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, user, dynasty]);

  const handleEditField = (key, value) => {
    setEditableData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDynasty = async () => {
    if (!dynasty) return;

    const payload = {
      name: { en: editableData.name_en, ta: editableData.name_ta },
      tagline: { en: editableData.tagline_en, ta: editableData.tagline_ta },
      period: { en: editableData.period_en, ta: editableData.period_ta },
      capital: { en: editableData.capital_en, ta: editableData.capital_ta },
      region: { en: editableData.region_en, ta: editableData.region_ta },
      territory: { en: editableData.region_en, ta: editableData.region_ta },
      language: { en: editableData.language_en, ta: editableData.language_ta },
      religion: { en: editableData.religion_en, ta: editableData.religion_ta },
      summary: { en: editableData.summary_en, ta: editableData.summary_ta },
      description: { en: editableData.summary_en, ta: editableData.summary_ta },
      banner: editableData.banner,
      image: editableData.image,
      mapEmbed: editableData.mapEmbed,
      mediaText: { en: editableData.media_en, ta: editableData.media_ta },
      slug,
    };

    setSaving(true);
    setEditError("");
    try {
      let nextDynasty = mergeDynastyData(dynasty, payload);

      if (user?.role === "admin") {
        const hasPersistedId = Boolean(dynasty._id);
        const endpoint = hasPersistedId ? `/api/dynasties/${dynasty._id}` : "/api/dynasties";
        const method = hasPersistedId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
          method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update dynasty");
        }

        const savedDynasty = await response.json();
        nextDynasty = mergeDynastyData(nextDynasty, savedDynasty);
      }

      setDynastyData(nextDynasty);
      setEditOpen(false);
    } catch (err) {
      setEditError(err.message || "Failed to save dynasty details");
    } finally {
      setSaving(false);
    }
  };

  const renderCultureIcon = (name) => {
    if (name === "clothing") return <TempleHindu sx={{ color: "#8B0000" }} />;
    if (name === "food") return <LocalDining sx={{ color: "#8B0000" }} />;
    if (name === "women") return <Woman sx={{ color: "#8B0000" }} />;
    return <Public sx={{ color: "#8B0000" }} />;
  };

  if (!dynasty) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Dynasty not found
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "#2b1a17",
        bgcolor: "#f5efe6",
        pb: 5,
        backgroundImage:
          "radial-gradient(circle at 14% 12%, rgba(242,193,78,0.12), transparent 36%), radial-gradient(circle at 84% 18%, rgba(121,30,45,0.28), transparent 38%), radial-gradient(circle at 52% 88%, rgba(242,193,78,0.08), transparent 40%)",
      }}
    >
      <SEO
        title={getContent(dynasty.name)}
        description={getContent(dynasty.summary)}
        keywords="Tamil dynasties, Tamil kings, temple architecture, historical maps"
      />

      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 280, md: 420 },
          backgroundImage: `linear-gradient(120deg, rgba(52,12,22,0.72), rgba(36,15,12,0.82) 48%, rgba(84,24,20,0.8)), url(${dynasty.banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          borderBottom: "1px solid rgba(243,201,105,0.32)",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, transparent 0%, rgba(242,193,78,0.18) 50%, transparent 100%)",
            transform: "translateX(-120%)",
            animation: "heroShimmer 6s linear infinite",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 14px)",
            opacity: 0.6,
          },
          "@keyframes heroShimmer": {
            "0%": { transform: "translateX(-120%)" },
            "100%": { transform: "translateX(120%)" },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, pt: { xs: 7.5, md: 12 }, pb: { xs: 4, md: 6 } }}>
          <Typography
            sx={{
              fontFamily:
                i18n.language === "ta"
                  ? "'Noto Serif Tamil', 'Hind Madurai', serif"
                  : "'Cinzel', 'Times New Roman', serif",
              color: "#8B0000",
              fontWeight: 800,
              fontSize: { xs: 34, md: 58 },
              letterSpacing: 0.8,
              textShadow: "0 0 26px rgba(243,201,105,0.42)",
              lineHeight: 1.05,
            }}
          >
            {getContent(dynasty.name)}
          </Typography>
          <Typography sx={{ mt: 1.2, color: "#fff7eb", fontSize: { xs: 17, md: 24 }, fontWeight: 500 }}>
            {getContent(dynasty.tagline)}
          </Typography>
          <Chip
            label={getContent(dynasty.period)}
            sx={{ mt: 2.2, bgcolor: "rgba(243,201,105,0.24)", color: "#fff7eb", border: "1px solid rgba(243,201,105,0.58)" }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 2.4 }}>
        <Stack direction="row" spacing={1.25} sx={{ mb: 2.5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            variant="outlined"
            sx={{
              color: "#8B0000",
              borderColor: "#8B0000",
              bgcolor: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(2px)",
              "&:hover": {
                borderColor: "#ba1d16",
                bgcolor: "rgba(242,193,78,0.12)",
              },
            }}
          >
            {i18n.language === "ta" ? "முகப்பு" : "Home"}
          </Button>
          <Button
            startIcon={<Explore />}
            onClick={() => navigate("/explore")}
            variant="outlined"
            sx={{
              color: "#8B0000",
              borderColor: "#8B0000",
              bgcolor: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(2px)",
              "&:hover": {
                borderColor: "#ba1d16",
                bgcolor: "rgba(242,193,78,0.12)",
              },
            }}
          >
            {i18n.language === "ta" ? "ஆராய்வு" : "Explore"}
          </Button>
          {user?.role === "admin" && (
            <Button
              startIcon={<Edit />}
              onClick={openEditDialog}
              variant="outlined"
              sx={{
                color: "#8B0000",
                borderColor: "#8B0000",
                bgcolor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(2px)",
                "&:hover": {
                  borderColor: "#ba1d16",
                  bgcolor: "rgba(242,193,78,0.12)",
                },
              }}
            >
              {i18n.language === "ta" ? "திருத்து" : "Edit"}
            </Button>
          )}
        </Stack>

        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 3.5,
            bgcolor: "#fff8ef",
            color: "#2b1a17",
            border: "1px solid rgba(243,201,105,0.4)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          <Grid container>
            <Grid item xs={12} md={4}>
              <Box sx={{ height: "100%", minHeight: 210, display: "grid", placeItems: "center", p: 3, bgcolor: "rgba(186,29,22,0.04)" }}>
                <Box component="img" src={dynasty.image} alt={getContent(dynasty.name)} sx={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", border: "3px solid #8B0000", bgcolor: "#fff" }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography sx={{ color: "#8B0000", fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.1 }}>
                  {getContent(dynasty.name)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.2, mb: 1.5, flexWrap: "wrap" }}>
                  <Chip label={getContent(dynasty.period)} sx={{ bgcolor: "rgba(243,201,105,0.18)", color: "#ba1d16", fontWeight: 600 }} />
                  <Chip label={`${i18n.language === "ta" ? "மையம்" : "Capital"}: ${getContent(dynasty.capital)}`} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#2b1a17" }} />
                  <Chip label={`${i18n.language === "ta" ? "பகுதி" : "Region"}: ${getContent(dynasty.region)}`} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#2b1a17" }} />
                  <Chip icon={<Language sx={{ color: "#8B0000 !important" }} />} label={`${i18n.language === "ta" ? "மொழி" : "Language"}: ${getContent(dynasty.language)}`} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#2b1a17" }} />
                  <Chip icon={<TempleHindu sx={{ color: "#8B0000 !important" }} />} label={`${i18n.language === "ta" ? "மதம்" : "Religion"}: ${getContent(dynasty.religion)}`} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#2b1a17" }} />
                </Stack>
                <Typography sx={{ color: "#2b1a17", lineHeight: 1.75 }}>{getContent(dynasty.summary)}</Typography>

                <Box sx={{ mt: 2.2, border: "1px solid rgba(243,201,105,0.4)", borderRadius: 2, p: 1.4, bgcolor: "rgba(186,29,22,0.04)" }}>
                  <Typography sx={{ color: "#8B0000", fontWeight: 700, mb: 1 }}>{i18n.language === "ta" ? "சிறு விரிவு வரைபடம்" : "Mini Expansion Map"}</Typography>
                  <Box component="svg" viewBox="0 0 420 110" sx={{ width: "100%", height: 120 }}>
                    <rect x="8" y="8" width="404" height="94" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" />
                    <circle cx="90" cy="56" r="10" fill="#8B0000" />
                    <circle cx="220" cy="52" r="8" fill="#f0be43" />
                    <circle cx="332" cy="62" r="7" fill="#e4a92e" />
                    <path d="M100 56 C150 28, 180 35, 220 52 C255 66, 285 55, 332 62" fill="none" stroke="#8B0000" strokeWidth="3" strokeDasharray="8 6">
                      <animate attributeName="stroke-dashoffset" values="0;-84" dur="3.4s" repeatCount="indefinite" />
                    </path>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2.2} sx={{ mb: 3.4 }}>
          {dynasty.facts.map((fact, idx) => (
            <Grid item xs={12} sm={4} key={`${slug}-fact-${idx}`}>
              <Card
                sx={{
                  bgcolor: "#fffaf1",
                  color: "#2b1a17",
                  border: "1px solid rgba(186,29,22,0.18)",
                  height: "100%",
                  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "rgba(243,201,105,0.6)",
                    boxShadow: "0 14px 28px rgba(0,0,0,0.35)",
                  },
                }}
              >
                <CardContent>
                  <Typography sx={{ color: "#e7cfad", fontSize: 13 }}>{getContent(fact.label)}</Typography>
                  <Typography sx={{ color: "#8B0000", fontWeight: 700, mt: 0.7, lineHeight: 1.4 }}>{getContent(fact.value)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.6 }}>
                {getContent(dynasty.rulersTitle)}
              </Typography>
              <Stack direction="row" spacing={1.2} sx={{ overflowX: "auto", pb: 0.5 }}>
                {dynasty.rulers.map((ruler, idx) => (
                  <Box key={`${slug}-ruler-${idx}`} sx={{ minWidth: 250, p: 1.2, borderRadius: 1.8, bgcolor: "rgba(186,29,22,0.04)", border: "1px solid rgba(186,29,22,0.18)", transition: "all 180ms ease", cursor: "pointer", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 24px rgba(0,0,0,0.34)", borderColor: "rgba(243,201,105,0.72)", backgroundColor: "rgba(186,29,22,0.08)" } }} onClick={() => setSelectedKing(ruler)}>
                    <Box component="img" src={ruler.portrait} alt={ruler.name} sx={{ width: "100%", height: 120, borderRadius: 1.4, objectFit: "cover", mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: "#1f140e" }}>{ruler.name}</Typography>
                    <Typography sx={{ color: "#a5231c", fontSize: 13.5, mt: 0.3 }}>{ruler.reign}</Typography>
                    <Typography sx={{ color: "#f3e5cf", fontSize: 14, lineHeight: 1.6, mt: 0.4 }}>{getContent(ruler.note)}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.6 }}>
                {i18n.language === "ta" ? "கட்டிடக்கலை & சின்னங்கள்" : "Architecture and Heritage Sites"}
              </Typography>
              <Stack spacing={1.2}>
                {dynasty.architecture.map((item, idx) => (
                  <Box key={`${slug}-arch-${idx}`} sx={{ p: 1.2, borderRadius: 1.8, bgcolor: "rgba(186,29,22,0.04)", border: "1px solid rgba(186,29,22,0.18)" }}>
                    <Typography sx={{ fontWeight: 700, color: "#1f140e" }}>{item.site}</Typography>
                    <Typography sx={{ color: "#a5231c", fontSize: 13.5, mt: 0.3 }}>{`${item.place} • ${item.style}`}</Typography>
                    <Typography sx={{ color: "#f3e5cf", fontSize: 14, lineHeight: 1.6, mt: 0.4 }}>{getContent(item.note)}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <MilitaryTech sx={{ color: "#8B0000" }} />
                <Typography sx={{ fontWeight: 800, color: "#8B0000" }}>
                  {i18n.language === "ta" ? "போர்கள் & வெற்றிகள்" : "Wars and Conquests"}
                </Typography>
              </Stack>
              <Stack spacing={1.1} sx={{ mb: 2 }}>
                {dynasty.wars.map((battle, idx) => (
                  <Box key={`${slug}-battle-${idx}`} sx={{ p: 1.2, borderRadius: 1.5, borderLeft: "3px solid #8B0000", bgcolor: "rgba(186,29,22,0.04)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Typography sx={{ fontWeight: 700, color: "#1f140e" }}>{getContent(battle.name)}</Typography>
                    <Typography sx={{ color: "#f3e5cf", mt: 0.4 }}>{getContent(battle.result)}</Typography>
                  </Box>
                ))}
              </Stack>

              <Typography sx={{ color: "#8B0000", fontWeight: 700, mb: 1 }}>
                {i18n.language === "ta" ? "படையெடுப்பு திசைபடம்" : "Campaign Flow"}
              </Typography>
              <Box component="svg" viewBox="0 0 420 120" sx={{ width: "100%", height: 120 }}>
                <defs>
                  <marker id="arrow-end" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#8B0000" />
                  </marker>
                </defs>
                <rect x="6" y="8" width="408" height="102" rx="12" fill="rgba(186,29,22,0.04)" stroke="rgba(186,29,22,0.22)" />
                <path d="M40 82 C120 30, 190 30, 265 64 C305 84, 348 80, 390 42" fill="none" stroke="#8B0000" strokeWidth="3" markerEnd="url(#arrow-end)" strokeDasharray="10 8">
                  <animate attributeName="stroke-dashoffset" values="0;-180" dur="4s" repeatCount="indefinite" />
                </path>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Timeline sx={{ color: "#8B0000" }} />
                <Typography sx={{ fontWeight: 800, color: "#8B0000" }}>
                  {i18n.language === "ta" ? "வரலாற்றுக் காலவரிசை" : "Historical Timeline"}
                </Typography>
              </Stack>
              <Divider sx={{ mb: 1.2, borderColor: "rgba(255,255,255,0.28)" }} />
              <Stack direction="row" spacing={1.2} sx={{ overflowX: "auto", pb: 0.5 }}>
                {dynasty.timeline.map((entry, idx) => (
                  <Box key={`${slug}-timeline-card-${idx}`} sx={{ minWidth: 220, borderRadius: 1.8, border: "1px solid rgba(186,29,22,0.22)", bgcolor: "rgba(186,29,22,0.04)", p: 1.3 }}>
                    <TimelineItem
                      time={entry.time}
                      text={getContent(entry.event)}
                      isLast
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.4 }}>
                <Place sx={{ color: "#8B0000" }} />
                <Typography sx={{ fontWeight: 800, color: "#8B0000" }}>
                  {i18n.language === "ta" ? "வரலாற்று வரைபடம்" : "Historical Map View"}
                </Typography>
              </Stack>
              <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(186,29,22,0.22)" }}>
                <Box
                  component="iframe"
                  title={`${slug}-map`}
                  src={dynasty.mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sx={{ width: "100%", height: 300, border: 0, display: "block" }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.2 }}>
                {i18n.language === "ta" ? "கலாசாரம் & வாழ்க்கை" : "Culture and Life"}
              </Typography>
              <Stack spacing={1.1}>
                {dynasty.culture.map((item, idx) => (
                  <Box key={`${slug}-culture-${idx}`} sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "rgba(186,29,22,0.04)", border: "1px solid rgba(186,29,22,0.18)", display: "flex", gap: 1.1 }}>
                    {renderCultureIcon(item.icon)}
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#1f140e" }}>{getContent(item.title)}</Typography>
                      <Typography sx={{ color: "#ead8b8", mt: 0.25 }}>{getContent(item.text)}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.2 }}>
                {i18n.language === "ta" ? "கடல் வாணிகம் & உலக செல்வாக்கு" : "Trade and Global Influence"}
              </Typography>
              <Stack spacing={1.1}>
                {dynasty.tradeRoutes.map((route, idx) => (
                  <Box key={`${slug}-route-${idx}`} sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "rgba(186,29,22,0.04)", border: "1px solid rgba(186,29,22,0.18)" }}>
                    <Typography sx={{ color: "#f3e5cf" }}>{getContent(route)}</Typography>
                  </Box>
                ))}
              </Stack>
              <Box component="svg" viewBox="0 0 420 90" sx={{ width: "100%", height: 95, mt: 1.1 }}>
                <circle cx="50" cy="45" r="6" fill="#8B0000" />
                <circle cx="205" cy="45" r="6" fill="#8B0000" />
                <circle cx="370" cy="45" r="6" fill="#8B0000" />
                <path d="M56 45 C110 18, 150 20, 200 45" fill="none" stroke="#8B0000" strokeWidth="2" strokeDasharray="7 6">
                  <animate attributeName="stroke-dashoffset" values="0;-80" dur="2.6s" repeatCount="indefinite" />
                </path>
                <path d="M210 45 C260 70, 315 74, 364 45" fill="none" stroke="#8B0000" strokeWidth="2" strokeDasharray="7 6">
                  <animate attributeName="stroke-dashoffset" values="0;-80" dur="2.6s" repeatCount="indefinite" />
                </path>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.2 }}>
                {i18n.language === "ta" ? "கல்வெட்டுகள் & ஆதாரங்கள்" : "Inscriptions and Evidence"}
              </Typography>
              <Stack spacing={1.1}>
                {dynasty.evidence.map((evidence, idx) => (
                  <Box key={`${slug}-evidence-${idx}`} sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "rgba(186,29,22,0.04)", border: "1px solid rgba(186,29,22,0.18)" }}>
                    <Typography sx={{ color: "#8B0000", fontWeight: 700 }}>{getContent(evidence.type)}</Typography>
                    <Typography sx={{ color: "#ead8b8", mt: 0.35 }}>{getContent(evidence.text)}</Typography>
                    <Typography sx={{ color: "#c8a96d", mt: 0.6, fontSize: 13 }}>தமிழ் பிராமி - வட்டெழுத்து - கல்வெட்டு மரபு</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)", height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.2 }}>
                {i18n.language === "ta" ? "பாரம்பரிய மரபுச் செல்வம்" : "Legacy"}
              </Typography>
              <Typography sx={{ color: "#2b1a17", lineHeight: 1.75 }}>
                {getContent(dynasty.summary)}
              </Typography>
              <Box sx={{ mt: 1.6, p: 1.3, border: "1px solid rgba(242,207,103,0.45)", bgcolor: "rgba(242,207,103,0.07)", borderRadius: 1.5 }}>
                <Typography sx={{ color: "#8B0000", fontSize: { xs: 18, md: 22 }, fontWeight: 700, fontStyle: "italic" }}>
                  "{getContent(dynasty.legacyQuote)}"
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.2 }}>
                {i18n.language === "ta" ? "மீடியா அனுபவம்" : "Media Section"}
              </Typography>
              <Typography sx={{ color: "#f3e5cf", mb: 1.2 }}>{getContent(dynasty.media)}</Typography>
              <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(186,29,22,0.24)" }}>
                <Box
                  component="iframe"
                  title={`${slug}-media`}
                  src="https://www.youtube.com/embed/ScMzIvxBSi4"
                  loading="lazy"
                  sx={{ width: "100%", height: { xs: 220, md: 420 }, border: 0, display: "block" }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2.2, bgcolor: "#fffaf1", borderRadius: 2.5, border: "1px solid rgba(186,29,22,0.18)" }}>
              <Typography sx={{ fontWeight: 800, color: "#8B0000", mb: 1.2 }}>
                {i18n.language === "ta" ? "மேலும் ஆராயுங்கள்" : "Explore More"}
              </Typography>
              <Grid container spacing={1.2}>
                {relatedDynasties.map(([key, entry]) => (
                  <Grid item xs={12} sm={6} md={3} key={`related-${key}`}>
                    <Card
                      onClick={() => navigate(`/dynasties/${key}`)}
                      sx={{
                        bgcolor: "rgba(186,29,22,0.04)",
                        border: "1px solid rgba(186,29,22,0.22)",
                        color: "#2b1a17",
                        cursor: "pointer",
                        transition: "all 180ms ease",
                        "&:hover": { transform: "translateY(-4px) scale(1.015)", boxShadow: "0 12px 28px rgba(0,0,0,0.34)", borderColor: "rgba(243,201,105,0.74)", backgroundColor: "rgba(186,29,22,0.1)" },
                      }}
                    >
                      <CardContent>
                        <Typography sx={{ color: "#8B0000", fontWeight: 700, lineHeight: 1.35 }}>{getContent(entry.name)}</Typography>
                        <Typography sx={{ color: "#f3e5cf", mt: 0.6, fontSize: 13.5 }}>{getContent(entry.period)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 0,
              border: "2px solid #000",
            },
          }}
        >
          <DialogTitle sx={{ bgcolor: "#000", color: "#fff", textAlign: "center", fontWeight: 700 }}>
            {i18n.language === "ta" ? "வம்ச விவரங்களைத் திருத்து" : "Edit Dynasty Details"}
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: "#fff" }}>
            {editError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editError}
              </Alert>
            )}

            <Box sx={{ mb: 3, mt: 1, display: "flex", justifyContent: "center" }}>
              <ToggleButtonGroup
                value={editLanguage}
                exclusive
                onChange={(e, newLang) => newLang && setEditLanguage(newLang)}
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 3,
                    py: 1,
                    border: "2px solid #000",
                    color: "#000",
                    fontWeight: 600,
                    "&.Mui-selected": {
                      bgcolor: "#000",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#333",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="en">ENGLISH</ToggleButton>
                <ToggleButton value="ta">தமிழ்</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Name (English)" : "Name (Tamil)"}
                  value={editLanguage === "en" ? editableData.name_en : editableData.name_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "name_en" : "name_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Tagline (English)" : "Tagline (Tamil)"}
                  value={editLanguage === "en" ? editableData.tagline_en : editableData.tagline_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "tagline_en" : "tagline_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Period (English)" : "Period (Tamil)"}
                  value={editLanguage === "en" ? editableData.period_en : editableData.period_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "period_en" : "period_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Capital (English)" : "Capital (Tamil)"}
                  value={editLanguage === "en" ? editableData.capital_en : editableData.capital_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "capital_en" : "capital_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Region (English)" : "Region (Tamil)"}
                  value={editLanguage === "en" ? editableData.region_en : editableData.region_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "region_en" : "region_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Language (English)" : "Language (Tamil)"}
                  value={editLanguage === "en" ? editableData.language_en : editableData.language_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "language_en" : "language_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Religion (English)" : "Religion (Tamil)"}
                  value={editLanguage === "en" ? editableData.religion_en : editableData.religion_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "religion_en" : "religion_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label={editLanguage === "en" ? "Summary (English)" : "Summary (Tamil)"}
                  value={editLanguage === "en" ? editableData.summary_en : editableData.summary_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "summary_en" : "summary_ta", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MediaUpload
                  label="Banner Image"
                  currentImage={editableData.banner}
                  onImageChange={(url) => handleEditField("banner", url)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MediaUpload
                  label="Dynasty Image / Emblem"
                  currentImage={editableData.image}
                  onImageChange={(url) => handleEditField("image", url)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Map Embed URL" value={editableData.mapEmbed} onChange={(e) => handleEditField("mapEmbed", e.target.value)} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editLanguage === "en" ? "Media Label (English)" : "Media Label (Tamil)"}
                  value={editLanguage === "en" ? editableData.media_en : editableData.media_ta}
                  onChange={(e) => handleEditField(editLanguage === "en" ? "media_en" : "media_ta", e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between", bgcolor: "#f0f0f0" }}>
            <Button onClick={() => setEditOpen(false)} sx={{ color: "#000" }}>
              {i18n.language === "ta" ? "CANCEL / ரத்துசெய்" : "CANCEL / ரத்துசெய்"}
            </Button>
            <Button variant="contained" onClick={handleSaveDynasty} disabled={saving} sx={{ bgcolor: "#000", borderRadius: 0, "&:hover": { bgcolor: "#333" } }}>
              {saving ? (i18n.language === "ta" ? "SAVING... / சேமிக்கிறது..." : "SAVING... / சேமிக்கிறது...") : (i18n.language === "ta" ? "UPDATE / புதுப்பி" : "UPDATE / புதுப்பி")}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(selectedKing)} onClose={() => setSelectedKing(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#fff8ef", color: "#8B0000", fontWeight: 700 }}>
            {selectedKing?.name}
            <IconButton onClick={() => setSelectedKing(null)} sx={{ position: "absolute", right: 8, top: 8, color: "#2b1a17" }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "#fffaf1", color: "#2b1a17", pt: "16px !important" }}>
            {selectedKing && (
              <Stack spacing={1.1}>
                <Box component="img" src={selectedKing.portrait} alt={selectedKing.name} sx={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 1.5, border: "1px solid rgba(186,29,22,0.18)" }} />
                <Typography sx={{ color: "#8B0000", fontWeight: 700 }}>{selectedKing.reign}</Typography>
                <Typography sx={{ color: "#f3e5cf" }}>{getContent(selectedKing.note)}</Typography>
                <Typography sx={{ color: "#eddcc0", lineHeight: 1.7 }}>{getContent(selectedKing.story)}</Typography>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}







