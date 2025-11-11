// One-time migration script to normalize existing Land documents
// Ensures name & description become bilingual objects { en, ta }
// Usage (Windows PowerShell): node normalizeLands.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Land from './models/Land.js';
dotenv.config();

function toBi(val) {
  if (!val) return { en: '', ta: '' };
  if (typeof val === 'object' && (val.en !== undefined || val.ta !== undefined)) {
    return { en: val.en || '', ta: val.ta || '' };
  }
  // Legacy string -> assume Tamil if it contains Tamil unicode range, else English
  const tamilRegex = /[\u0B80-\u0BFF]/;
  if (tamilRegex.test(val)) {
    return { en: '', ta: val };
  }
  return { en: val, ta: '' };
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const lands = await Land.find();
  let updated = 0;
  for (const land of lands) {
    let changed = false;
    if (typeof land.name === 'string') { land.name = toBi(land.name); changed = true; }
    if (typeof land.description === 'string' || !land.description || typeof land.description.en === 'undefined') { land.description = toBi(land.description); changed = true; }
    if (changed) { await land.save(); updated++; }
  }
  console.log(`Normalized ${updated} land documents.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });