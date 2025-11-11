import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Literal English translations for your Tamil events
const englishTranslations = {
  '68db9eba2cf858908bcec884': {
    // பொங்கல் திருவிழா
    title: 'Pongal Festival',
    description: 'Harvest festival celebrated by Tamils in January.',
    location: 'Tamil Nadu, India'
  },
  '68db9eba2cf858908bcec885': {
    // சித்திரை திருவிழா
    title: 'Chithirai Festival',
    description: 'Annual festival celebrated in Madurai, commemorating the wedding of Meenakshi and Sundareswarar.',
    location: 'Madurai, Tamil Nadu'
  }
};

async function addEnglishTranslations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
    
    for (const [eventId, translation] of Object.entries(englishTranslations)) {
      const updates = {
        'title.en': translation.title,
        'description.en': translation.description,
        'location.en': translation.location
      };
      
      await Event.updateOne(
        { _id: mongoose.Types.ObjectId.createFromHexString(eventId) },
        { $set: updates }
      );
      
      console.log(`✅ Updated Event: ${translation.title}`);
      console.log(`   Title (EN): ${translation.title}`);
      console.log(`   Description (EN): ${translation.description}`);
      console.log(`   Location (EN): ${translation.location}\n`);
    }
    
    console.log('🎉 All English translations added successfully!\n');
    
    // Verify the updates
    console.log('📋 Verification:');
    const events = await Event.find({});
    events.forEach(event => {
      console.log(`\n   ${event.title.en} / ${event.title.ta}`);
      console.log(`   EN: ${event.description.en?.substring(0, 60)}...`);
      console.log(`   TA: ${event.description.ta?.substring(0, 60)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed\n');
  }
}

addEnglishTranslations();
