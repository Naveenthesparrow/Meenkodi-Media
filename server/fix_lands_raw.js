// Raw migration to normalize and backfill Land docs without hydrating Mongoose models
// Usage: node fix_lands_raw.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MAP = {
  Kurinji: {
    name: { en: 'Kurinji', ta: 'குறிஞ்சி' },
    description: {
      en: 'Mountain tract of cool mists; kurinji flower and honey gatherers; theme of union love.',
      ta: 'குறிஞ்சிச் சூழலும் மலை நிலம்; 12 ஆண்டுக்கு ஒருமுறை மலரும் குறிஞ்சி மலர், தேன்சேகரம்; சேர்க்கை காதல் உணர்வு.'
    }
  },
  Mullai: {
    name: { en: 'Mullai', ta: 'முல்லை' },
    description: {
      en: 'Pastoral forest zone of cattle herds; mood of patient waiting.',
      ta: 'மாடுகள் மேயும் காடு நிலம்; காத்திருப்பு மனநிலை.'
    }
  },
  Marutham: {
    name: { en: 'Marutham', ta: 'மருதம்' },
    description: {
      en: 'Fertile river-fed plains; agriculture, civic life, justice themes.',
      ta: 'ஆற்று பாசனப் புலம்; விவசாயம், நகர்வாழ்வு, நீதி குறிப்பு.'
    }
  },
  Neithal: {
    name: { en: 'Neithal', ta: 'நெய்தல்' },
    description: {
      en: 'Littoral coast: boats, salt pans, pearls; theme of longing and separation.',
      ta: 'கரையோரக் கடல்; படகுகள், உப்பு காடுகள், முத்து; பிரிவு ஏக்கம்.'
    }
  },
  Palai: {
    name: { en: 'Palai', ta: 'பாலை' },
    description: {
      en: 'Arid transformed tract (from other zones); hardship, endurance, separation.',
      ta: 'மற்ற நிலம் வறண்டு உருவகமான பகுதி; துன்பம், சகிப்புத்தன்மை, பிரிவு.'
    }
  }
};

function both(val){
  if(!val) return { en:'', ta:'' };
  if(typeof val==='object' && (val.en!==undefined || val.ta!==undefined)){
    return { en: String(val.en||''), ta: String(val.ta||'') };
  }
  const tamil = /[\u0B80-\u0BFF]/.test(String(val));
  return tamil ? { en:'', ta:String(val) } : { en:String(val), ta:'' };
}

async function run(){
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meenkodi';
  await mongoose.connect(uri);
  const coll = mongoose.connection.db.collection('lands');

  const docs = await coll.find({}).toArray();
  let updates = 0;
  for(const d of docs){
    const map = MAP[d.type];
    const name = both(d.name);
    const desc = both(d.description);

    // Seed bilingual defaults from type map when available
    const desired = { 
      name: {
        en: name.en || (map?.name.en || ''),
        ta: name.ta || (map?.name.ta || ''),
      },
      description: {
        en: desc.en || (map?.description.en || ''),
        ta: desc.ta || (map?.description.ta || ''),
      }
    };

    const need = (
      !d.name || typeof d.name !== 'object' || d.name.en !== desired.name.en || d.name.ta !== desired.name.ta ||
      !d.description || typeof d.description !== 'object' || d.description.en !== desired.description.en || d.description.ta !== desired.description.ta
    );

    if(need){
      await coll.updateOne({ _id: d._id }, { $set: desired });
      updates++;
    }
  }

  console.log(`Updated ${updates} land documents to bilingual.`);
  await mongoose.disconnect();
}

run().catch(err=>{ console.error(err); process.exit(1); });
