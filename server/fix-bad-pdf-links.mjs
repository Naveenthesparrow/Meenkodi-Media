// Script to clear all local /uploads/ PDF links from MongoDB resources
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected to MongoDB');

const db = mongoose.connection.db;
const resources = db.collection('resources');

// Find and clear all resources with local /uploads/ downloadLinks (they don't persist on cloud servers)
const result = await resources.updateMany(
  { downloadLink: { $regex: '^/uploads/' } },
  { $set: { downloadLink: '', pdfName: '', pdfSize: '' } }
);

console.log(`Cleared ${result.modifiedCount} resource(s) with expired local disk PDF links.`);

// Show current state
const all = await resources.find({}).toArray();
all.forEach(r => {
  console.log(`ID: ${r._id} | downloadLink: "${r.downloadLink || '(none)'}"`);
});

await mongoose.disconnect();
console.log('Done - please re-upload the PDF from the Edit page.');
