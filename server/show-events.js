import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
    const events = await Event.find({});
    
    console.log('\n📋 CURRENT EVENTS DATA:\n');
    console.log('='.repeat(80));
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. Event ID: ${event._id}`);
      console.log(`   Tamil Title: ${event.title?.ta || event.title}`);
      console.log(`   Tamil Description: ${(event.description?.ta || event.description || '').substring(0, 100)}`);
      console.log(`   Tamil Location: ${event.location?.ta || event.location || ''}`);
      console.log(`   Date: ${event.date}`);
    });
    
    mongoose.connection.close();
  });
