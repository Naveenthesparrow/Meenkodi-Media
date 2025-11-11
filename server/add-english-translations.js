import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tamilheritage');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper to add English translations
async function addEnglishTranslations() {
  console.log('\n📝 Adding English translations to Events...\n');
  
  const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
  
  // Get all events
  const events = await Event.find({});
  console.log(`Found ${events.length} events\n`);
  
  // Sample translations - EDIT THESE BASED ON YOUR ACTUAL DATA
  const translations = {
    // Event 1 - Pongal Festival
    'பொங்கல் திருவிழா': {
      title: 'Pongal Festival',
      description: 'Harvest festival celebrated by Tamils in January.',
      location: 'Chennai'
    },
    
    // Event 2 - Chithirai Festival
    'சித்திரை திருவிழா': {
      title: 'Chithirai Festival',
      description: 'A grand Tamil festival celebrated in Madurai, featuring processions, cultural programs, and traditional celebrations.',
      location: 'Madurai'
    },
    
    // Add more translations here as needed
  };
  
  for (const event of events) {
    // Get Tamil title
    const tamilTitle = event.title?.ta || event.title;
    
    console.log(`\n📌 Event: ${tamilTitle}`);
    console.log(`   ID: ${event._id}`);
    
    // Check if we have a translation for this event
    if (translations[tamilTitle]) {
      const trans = translations[tamilTitle];
      
      const updates = {
        'title.en': trans.title,
        'description.en': trans.description,
        'location.en': trans.location
      };
      
      await Event.updateOne({ _id: event._id }, { $set: updates });
      console.log(`   ✅ Added English translations:`);
      console.log(`      Title: ${trans.title}`);
      console.log(`      Description: ${trans.description.substring(0, 50)}...`);
      console.log(`      Location: ${trans.location}`);
    } else {
      console.log(`   ⚠️  No translation found - keeping placeholder`);
      console.log(`      Current EN: ${event.title?.en || 'Not set'}`);
    }
  }
  
  console.log('\n✅ English translation update complete!');
}

// Interactive prompt version
async function addEnglishInteractive() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => readline.question(query, resolve));
  
  console.log('\n🌐 Interactive English Translation Tool\n');
  
  const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
  const events = await Event.find({});
  
  for (const event of events) {
    const tamilTitle = event.title?.ta || event.title;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 Event ID: ${event._id}`);
    console.log(`   Tamil Title: ${tamilTitle}`);
    console.log(`   Tamil Description: ${(event.description?.ta || event.description || '').substring(0, 80)}...`);
    console.log(`   Tamil Location: ${event.location?.ta || event.location || ''}`);
    console.log(`\n   Current English:`);
    console.log(`   Title: ${event.title?.en || '(not set)'}`);
    console.log(`   Description: ${(event.description?.en || '(not set)').substring(0, 80)}...`);
    console.log(`   Location: ${event.location?.en || '(not set)'}`);
    
    const shouldUpdate = await question(`\n   Update this event? (y/n): `);
    
    if (shouldUpdate.toLowerCase() === 'y') {
      const enTitle = await question('   English Title: ');
      const enDesc = await question('   English Description: ');
      const enLoc = await question('   English Location: ');
      
      const updates = {
        'title.en': enTitle || event.title?.en,
        'description.en': enDesc || event.description?.en,
        'location.en': enLoc || event.location?.en
      };
      
      await Event.updateOne({ _id: event._id }, { $set: updates });
      console.log(`   ✅ Updated successfully!`);
    } else {
      console.log(`   ⏭️  Skipped`);
    }
  }
  
  readline.close();
  console.log('\n✅ All done!\n');
}

// Main function
async function main() {
  await connectDB();
  
  const mode = process.argv[2] || 'batch';
  
  if (mode === 'interactive' || mode === '-i') {
    await addEnglishInteractive();
  } else {
    console.log('\n📖 Usage:');
    console.log('   node add-english-translations.js          - Batch mode (edit translations in this file)');
    console.log('   node add-english-translations.js -i       - Interactive mode (prompt for each event)\n');
    
    await addEnglishTranslations();
  }
  
  await mongoose.connection.close();
  console.log('👋 Database connection closed\n');
}

main();
