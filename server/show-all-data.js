import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function showAllData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const collections = [
      { name: 'Event', fields: ['title', 'description', 'location'] },
      { name: 'Temple', fields: ['name', 'location', 'deity', 'description', 'significance'] },
      { name: 'King', fields: ['name', 'title', 'dynasty', 'description', 'achievements'] },
      { name: 'Literature', fields: ['name', 'author', 'description', 'significance'] },
      { name: 'Dance', fields: ['name', 'origin', 'description', 'significance'] },
      { name: 'Food', fields: ['name', 'description', 'ingredients', 'region'] },
      { name: 'Festival', fields: ['name', 'description', 'significance', 'location'] },
      { name: 'Clothing', fields: ['name', 'description', 'significance'] },
      { name: 'AncientScience', fields: ['name', 'description', 'significance', 'field'] }
    ];
    
    for (const col of collections) {
      const Model = mongoose.model(col.name, new mongoose.Schema({}, { strict: false }));
      const docs = await Model.find({});
      
      console.log('\n' + '='.repeat(80));
      console.log(`📚 ${col.name.toUpperCase()} (${docs.length} items)`);
      console.log('='.repeat(80));
      
      docs.forEach((doc, index) => {
        console.log(`\n${index + 1}. ID: ${doc._id}`);
        col.fields.forEach(field => {
          const value = doc[field];
          const displayValue = typeof value === 'object' ? value?.ta : value;
          if (displayValue) {
            console.log(`   ${field}: ${displayValue.substring(0, 100)}${displayValue.length > 100 ? '...' : ''}`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n\n👋 Database connection closed\n');
  }
}

showAllData();
