import mongoose from 'mongoose';
import Director from './models/Director.js';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTORS_DATA = [
  {
    name: { 
      en: "Subramania Bharathi", 
      ta: "சுப்பிரமணிய பாரதியார்" 
    },
    title: { 
      en: "National Poet of Tamil Nadu", 
      ta: "தமிழ்நாட்டின் தேசிய கவிஞர்" 
    },
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Subramanya_Bharathi.jpg/250px-Subramanya_Bharathi.jpg",
    imagePosition: "center 20%",
    slug: "subramania-bharathi",
    order: 1,
    isActive: true
  },
  {
    name: { 
      en: "Kambar", 
      ta: "கம்பர்" 
    },
    title: { 
      en: "Epic Poet • Kambaramayanam", 
      ta: "காவிய கவிஞர் • கம்பராமாயணம்" 
    },
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Kambar.jpg?20120807204334",
    imagePosition: "center top",
    slug: "kambar",
    order: 2,
    isActive: true
  },
  {
    name: { 
      en: "Thiruvalluvar", 
      ta: "திருவள்ளுவர்" 
    },
    title: { 
      en: "Author of Thirukkural", 
      ta: "திருக்குறள் ஆசிரியர்" 
    },
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXR0EU2W1grbcin5-yghbPrNHdMq0wFccGwR71QRc0WB6ZXEzRbsbPeMdhDWQKgsVfTiGP-9ivpM27-cBXd8_vzzmuZ4JdQbsaWkBS6Dk6swOzSAQhIJ64V_QKG5drXTMrJB1wUgwssyQ/s1600/thiruvalluvar-779961.jpg",
    imagePosition: "50% 15%",
    slug: "thiruvalluvar",
    order: 3,
    isActive: true
  },
  {
    name: { 
      en: "Devaneyapavanar", 
      ta: "தேவநேயப் பாவாணர்" 
    },
    title: { 
      en: "Tamil Scholar • Linguist", 
      ta: "தமிழ் அறிஞர் • மொழியியலாளர்" 
    },
    image: "https://static.hindutamil.in/hindu/uploads/news/2023/02/07/xlarge/940197.jpg",
    imagePosition: "center top",
    slug: "devaneyapavanar",
    order: 4,
    isActive: true
  },
  {
    name: { 
      en: "Avvaiyar", 
      ta: "ஔவையார்" 
    },
    title: { 
      en: "Poet • Philosopher", 
      ta: "கவிஞர் • தத்துவஞானி" 
    },
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Statue_of_Avvaiyar_%28cropped%29.jpg",
    imagePosition: "center top",
    slug: "avvaiyar",
    order: 5,
    isActive: true
  }
];

async function seedDirectors() {
  try {
    // Connect to MongoDB using the same env var as the main server
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil-heritage';
    
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
      console.log('⚠️  WARNING: No MONGO_URI or MONGODB_URI environment variable found!');
      console.log('⚠️  Using default: mongodb://localhost:27017/tamil-heritage');
      console.log('⚠️  Make sure your .env file is configured or MongoDB is running locally.\n');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing directors
    const deleteResult = await Director.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing directors`);

    // Insert new directors
    const insertedDirectors = await Director.insertMany(DIRECTORS_DATA);
    console.log(`✅ Successfully seeded ${insertedDirectors.length} directors:`);
    
    insertedDirectors.forEach(director => {
      console.log(`   - ${director.name.en} (${director.name.ta})`);
      console.log(`     Slug: ${director.slug}`);
      console.log(`     Order: ${director.order}`);
    });

    console.log('\n✅ Directors seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding directors:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDirectors();
