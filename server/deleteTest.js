const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function diagnoseDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connection Status: Connected');
    console.log('Database Name:', mongoose.connection.db.databaseName);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available Collections:');
    collections.forEach(collection => {
      console.log(collection.name);
    });

    // Check Kings collection
    const King = mongoose.model('King');
    const kingsCount = await King.countDocuments();
    console.log('Total Kings:', kingsCount);

    // List a few kings
    const kings = await King.find().limit(5);
    console.log('Sample Kings:');
    kings.forEach(king => {
      console.log(`ID: ${king._id}, Name: ${king.name}, Period: ${king.period}`);
    });

  } catch (error) {
    console.error('Diagnosis Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

diagnoseDatabase(); 