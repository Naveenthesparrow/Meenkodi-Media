const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const galleryItems = await db.collection('galleries').find({}).toArray();
    for (const item of galleryItems) {
      if (item.imageUrl && (item.imageUrl.startsWith('C:') || item.imageUrl.startsWith('file:///'))) {
        console.log('Bad URL:', item._id, item.name, item.imageUrl);
      }
    }
    console.log('Done checking DB.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkDb();
