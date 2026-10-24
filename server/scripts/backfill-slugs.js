/**
 * backfill-slugs.js — give existing content a readable URL slug.
 *
 * New documents get a slug automatically (see utils/slug.js); this fills in
 * the ones created before slugs existed. Only adds the `slug` field; existing
 * slugs are never changed.
 *
 * Usage (from server/):
 *   node scripts/backfill-slugs.js          # dry run: show what would be set
 *   node scripts/backfill-slugs.js --apply  # write the slugs
 */
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { uniqueSlug } from '../utils/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MODELS = ['ResearchFolder', 'Article', 'Event', 'Gallery', 'Resource', 'Temple', 'Food', 'Festival',
  'Literature', 'Dance', 'Clothing', 'AncientScience'];
const apply = process.argv.includes('--apply');

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
let total = 0;
for (const name of MODELS) {
  const { default: Model } = await import(`../models/${name}.js`);
  const docs = await Model.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] })
    .select('_id name title').lean();
  let set = 0;
  for (const doc of docs) {
    const slug = await uniqueSlug(Model, doc);
    if (!slug) continue;
    if (apply) {
      // updateOne skips save hooks/validation: only the slug is written
      await Model.updateOne({ _id: doc._id, $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }, { $set: { slug } });
    } else if (set < 3) {
      console.log(`    ${name} ${doc._id} -> ${slug}`);
    }
    set++;
  }
  total += set;
  console.log(`${name}: ${set} of ${docs.length} without a slug ${apply ? 'updated' : 'would be updated'}`);
}
console.log(`\n${apply ? 'Updated' : 'Would update'} ${total} documents`);
await mongoose.disconnect();
