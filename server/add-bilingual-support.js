import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to create bilingual field structure
const createBilingualField = (existingValue, englishDefault = '') => ({
  en: englishDefault || existingValue || '',
  ta: existingValue || ''
});

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

// Migration function for Events
async function migrateEvents() {
  console.log('\n📝 Starting Event migration...');
  const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
  
  const events = await Event.find({});
  console.log(`Found ${events.length} events to migrate`);
  
  for (const event of events) {
    const updates = {};
    
    // Check if already migrated
    if (event.title && typeof event.title === 'object' && event.title.en !== undefined) {
      console.log(`⏭️  Skipping event "${event._id}" - already migrated`);
      continue;
    }
    
    // Migrate title
    if (event.title && typeof event.title === 'string') {
      updates.title = createBilingualField(event.title, 'Event Title (Add English)');
    }
    
    // Migrate description
    if (event.description && typeof event.description === 'string') {
      updates.description = createBilingualField(event.description, 'Event description (Add English)');
    }
    
    // Migrate location
    if (event.location && typeof event.location === 'string') {
      updates.location = createBilingualField(event.location, 'Location (Add English)');
    }
    
    if (Object.keys(updates).length > 0) {
      await Event.updateOne({ _id: event._id }, { $set: updates });
      console.log(`✅ Migrated event: ${event._id}`);
    }
  }
  
  console.log('✅ Event migration complete!');
}

// Migration function for Temples
async function migrateTemples() {
  console.log('\n📝 Starting Temple migration...');
  const Temple = mongoose.model('Temple', new mongoose.Schema({}, { strict: false }));
  
  const temples = await Temple.find({});
  console.log(`Found ${temples.length} temples to migrate`);
  
  for (const temple of temples) {
    const updates = {};
    
    // Check if already migrated
    if (temple.name && typeof temple.name === 'object' && temple.name.en !== undefined) {
      console.log(`⏭️  Skipping temple "${temple._id}" - already migrated`);
      continue;
    }
    
    // Migrate fields
    const fieldsToMigrate = [
      'name', 'location', 'deity', 'period', 'dynasty', 'builder',
      'architecture', 'description', 'significance'
    ];
    
    fieldsToMigrate.forEach(field => {
      if (temple[field] && typeof temple[field] === 'string') {
        updates[field] = createBilingualField(temple[field], `${field} (Add English)`);
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await Temple.updateOne({ _id: temple._id }, { $set: updates });
      console.log(`✅ Migrated temple: ${temple._id}`);
    }
  }
  
  console.log('✅ Temple migration complete!');
}

// Migration function for other collections (Kings, Literature, Dance, etc.)
async function migrateCollection(collectionName, fieldsToMigrate) {
  console.log(`\n📝 Starting ${collectionName} migration...`);
  const Model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
  
  const docs = await Model.find({});
  console.log(`Found ${docs.length} ${collectionName.toLowerCase()} to migrate`);
  
  for (const doc of docs) {
    const updates = {};
    
    // Check if already migrated
    const firstField = fieldsToMigrate[0];
    if (doc[firstField] && typeof doc[firstField] === 'object' && doc[firstField].en !== undefined) {
      console.log(`⏭️  Skipping ${collectionName} "${doc._id}" - already migrated`);
      continue;
    }
    
    fieldsToMigrate.forEach(field => {
      if (doc[field] && typeof doc[field] === 'string') {
        updates[field] = createBilingualField(doc[field], `${field} (Add English)`);
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await Model.updateOne({ _id: doc._id }, { $set: updates });
      console.log(`✅ Migrated ${collectionName}: ${doc._id}`);
    }
  }
  
  console.log(`✅ ${collectionName} migration complete!`);
}

// Main migration function
async function runMigration() {
  try {
    await connectDB();
    
    console.log('\n🚀 Starting bilingual migration...\n');
    console.log('This will convert single-language fields to bilingual format:');
    console.log('  { field: "value" } → { field: { en: "English", ta: "தமிழ்" } }\n');
    
    // Migrate Events
    await migrateEvents();
    
    // Migrate Temples
    await migrateTemples();
    
    // Migrate Kings
    await migrateCollection('King', ['name', 'title', 'dynasty', 'period', 'description', 'achievements', 'legacy']);
    
    // Migrate Literature
    await migrateCollection('Literature', ['name', 'author', 'period', 'description', 'significance', 'genre']);
    
    // Migrate Dance
    await migrateCollection('Dance', ['name', 'origin', 'description', 'significance', 'period']);
    
    // Migrate Foods
    await migrateCollection('Food', ['name', 'description', 'ingredients', 'region', 'significance']);
    
    // Migrate Festivals
    await migrateCollection('Festival', ['name', 'description', 'significance', 'location', 'period']);
    
    // Migrate Clothing
    await migrateCollection('Clothing', ['name', 'description', 'significance', 'period', 'region']);
    
    // Migrate Ancient Science
    await migrateCollection('AncientScience', ['name', 'description', 'significance', 'period', 'field']);
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update the Mongoose schemas to use bilingual field definitions');
    console.log('2. Update frontend components to display content based on selected language');
    console.log('3. Add English translations where needed in the admin portal\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run migration
runMigration();
