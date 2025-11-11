// Backfill Tamil/English names and descriptions for Tinai lands
// Run once to ensure both languages are present
// Usage: node fillLandTranslations.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Land from './models/Land.js';
import path from 'path';

dotenv.config();

const MAP = {
  Kurinji: {
    name: { en: 'Kurinji', ta: 'குறிஞ்சி' },
    description: {
      en: 'Mountain tract of cool mists; kurinji flower and honey gatherers; theme of union love.',
      ta: 'மலை மூடிக் குளிர் தூறும் நிலம்; 12 ஆண்டுக்கு ஒருமுறை மலரும் குறிஞ்சி மலர், தேன்சேகரர்கள்; சேர்க்கை காதல் சூழல்.'
    }
  },
  Mullai: {
    name: { en: 'Mullai', ta: 'முல்லை' },
    description: {
      en: 'Pastoral forest zone of cattle herds; mood of patient waiting.',
      ta: 'மாடு மேய்க்கும் காடு சூழ்ந்த நிலம்; காத்திருக்கும் தன்மை, மென்மை உணர்ச்சி.'
    }
  },
  Marutham: {
    name: { en: 'Marutham', ta: 'மருதம்' },
    description: {
      en: 'Fertile river-fed plains; agriculture, daily civic life, justice themes.',
      ta: 'பெருக்கெடும் ஆறு பாசனநிலம்; விவசாயம், நாளாந்த வாழ்வு, நீதி குறிப்பு.'
    }
  },
  Neithal: {
    name: { en: 'Neithal', ta: 'நெய்தல்' },
    description: {
      en: 'Littoral coast: boats, salt pans, pearls; theme of longing and separation.',
      ta: 'கரையோரக் கடல் நிலம்; படகுகள், உப்பு காடுகள், முத்து; பிரிவு ஏக்கம் உணர்வு.'
    }
  },
  Palai: {
    name: { en: 'Palai', ta: 'பாலை' },
    description: {
      en: 'Arid transformed tract (from other zones); hardship, endurance, separation.',
      ta: 'மற்ற நிலம் வறண்டுப் மாற்றம் பெற்ற பகுதி; துன்பம், சகிப்புத்தன்மை, பிரிவு.'
    }
  }
};

function both(val){
  if(!val) return { en:'', ta:'' };
  if(typeof val==='object' && ('en' in val || 'ta' in val)) return { en: val.en||'', ta: val.ta||'' };
  const tamil = /[\u0B80-\u0BFF]/.test(String(val));
  return tamil ? { en:'', ta:String(val) } : { en:String(val), ta:'' };
}

async function run(){
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
  const docs = await Land.find();
  let updated = 0;
  for(const d of docs){
    const map = MAP[d.type];
    if(!map) continue;
    const name = both(d.name);
    const desc = both(d.description);
    const next = { name: { ...map.name }, description: { ...map.description } };
    // Preserve existing text if provided; otherwise use mapping
    next.name.en = name.en || map.name.en;
    next.name.ta = name.ta || map.name.ta;
    next.description.en = desc.en || map.description.en;
    next.description.ta = desc.ta || map.description.ta;
    // Only save if change
    if(
      (d.name?.en !== next.name.en) || (d.name?.ta !== next.name.ta) ||
      (d.description?.en !== next.description.en) || (d.description?.ta !== next.description.ta)
    ){
      d.name = next.name;
      d.description = next.description;
      await d.save();
      updated++;
    }
  }
  console.log(`Backfilled ${updated} Land docs with bilingual fields.`);
  await mongoose.disconnect();
}

run().catch(err=>{ console.error(err); process.exit(1); });
