import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Comprehensive English translations for ALL collections
const allTranslations = {
  // EVENTS
  events: {
    '68db9eba2cf858908bcec884': {
      title: 'Pongal Festival',
      description: 'Harvest festival celebrated by Tamils in January.',
      location: 'Tamil Nadu, India'
    },
    '68db9eba2cf858908bcec885': {
      title: 'Chithirai Festival',
      description: 'Annual festival celebrated in Madurai, commemorating the divine wedding of Meenakshi and Sundareswarar.',
      location: 'Madurai, Tamil Nadu'
    }
  },

  // TEMPLES
  temples: {
    '68db9eba2cf858908bcec864': {
      name: 'Meenakshi Amman Temple',
      location: 'Madurai',
      deity: 'Parvati (Meenakshi) and Shiva (Sundareswarar)',
      description: 'The glorious temple complex of Madurai, renowned for its magnificent architecture',
      significance: 'One of the most prominent temples in Tamil Nadu, dedicated to Goddess Meenakshi'
    },
    '68db9eba2cf858908bcec862': {
      name: 'Brihadeeswara Temple',
      location: 'Thanjavur',
      deity: 'Shiva',
      description: 'UNESCO World Heritage monument built by Raja Raja Chola',
      significance: 'Architectural marvel of the Chola dynasty, showcasing ancient Tamil engineering'
    }
  },

  // KINGS
  kings: {
    '68db9eba2cf858908bcec85d': {
      name: 'Rajendra Chola I',
      title: 'Emperor',
      dynasty: 'Chola Dynasty',
      description: 'Son of Raja Raja Chola. Led victorious campaigns north up to the Ganges River.',
      achievements: 'Brave king who conquered territories up to the Ganges River',
      legacy: 'Expanded the Chola Empire to its greatest extent'
    },
    '68db9eba2cf858908bcec85f': {
      name: 'Karikala Chola',
      title: 'King',
      dynasty: 'Chola Dynasty',
      description: 'Ancient Chola king. Built the Grand Anicut (Kallanai) on the Kaveri River and improved irrigation systems.',
      achievements: 'Built the Kallanai Dam, one of the oldest water-diversion structures in the world',
      legacy: 'Pioneer of irrigation and water management in ancient Tamil Nadu'
    },
    '68db9eba2cf858908bcec85b': {
      name: 'Raja Raja Chola I',
      title: 'Great Emperor',
      dynasty: 'Chola Dynasty',
      description: 'One of the greatest emperors of the Chola Empire. Built the Brihadeeswara Temple in Thanjavur.',
      achievements: 'Built the great temple, conducted overseas military campaigns',
      legacy: 'Established the golden age of the Chola Empire'
    }
  },

  // LITERATURE
  literature: {
    '68db9eba2cf858908bcec87a': {
      name: 'Thirukkural',
      author: 'Thiruvalluvar',
      description: 'World-renowned Tamil literary work, a classic text of ethical and moral teachings',
      significance: 'Timeless wisdom in 1330 couplets covering virtue, wealth, and love',
      genre: 'Ethics and Philosophy'
    }
  },

  // DANCE
  dance: {
    '68db9eba2cf858908bcec867': {
      name: 'Bharatanatyam',
      origin: 'Tamil Nadu',
      description: 'Traditional dance form of Tamil Nadu, one of the oldest classical dances of India',
      significance: 'Expressive art form combining storytelling, music, and graceful movements',
      period: 'Ancient, dating back to temple traditions'
    }
  },

  // FOODS
  foods: {
    '68db9eba2cf858908bcec86f': {
      name: 'Rasam',
      description: 'Tangy and spicy soup, a staple in Tamil cuisine',
      ingredients: 'Tomato, tamarind, black pepper, cumin, coriander',
      region: 'Tamil Nadu',
      significance: 'Comfort food with digestive properties'
    },
    '68db9eba2cf858908bcec870': {
      name: 'Payasam',
      description: 'Sweet dessert made with rice cooked in milk and sugar',
      ingredients: 'Rice, milk, sugar, cardamom, cashew nuts',
      region: 'Tamil Nadu',
      significance: 'Traditional festive sweet'
    },
    '68db9eba2cf858908bcec86c': {
      name: 'Idli',
      description: 'Soft, steamed rice cake, a popular breakfast dish',
      ingredients: 'Rice, urad dal (black gram), salt',
      region: 'Tamil Nadu',
      significance: 'Healthy, easily digestible food'
    },
    '68db9eba2cf858908bcec86d': {
      name: 'Dosa',
      description: 'Crispy, savory crepe made from fermented batter',
      ingredients: 'Rice, urad dal, fenugreek',
      region: 'Tamil Nadu',
      significance: 'Popular breakfast and dinner item'
    },
    '68db9eba2cf858908bcec86a': {
      name: 'Sambar',
      description: 'Lentil-based vegetable stew, a cornerstone of Tamil cuisine',
      ingredients: 'Pigeon pea lentils, vegetables, tamarind, sambar powder',
      region: 'Tamil Nadu',
      significance: 'Nutritious, protein-rich accompaniment'
    },
    '68db9eba2cf858908bcec86e': {
      name: 'Pongal',
      description: 'Rice and lentil dish cooked with ghee and spices',
      ingredients: 'Rice, moong dal, ghee, black pepper, cumin',
      region: 'Tamil Nadu',
      significance: 'Traditional dish for Pongal festival'
    }
  },

  // FESTIVALS
  festivals: {
    '68db9eba2cf858908bcec874': {
      name: 'Deepavali / Diwali',
      description: 'Festival celebrating the victory of good over evil',
      significance: 'Festival of lights, symbolizing the dispelling of darkness',
      location: 'Throughout Tamil Nadu',
      period: 'October/November'
    },
    '68db9eba2cf858908bcec872': {
      name: 'Pongal',
      description: 'Tamil harvest festival, the most important celebration for Tamils',
      significance: 'Four-day festival giving thanks to nature, the sun, cattle, and community',
      location: 'Throughout Tamil Nadu',
      period: 'Mid-January'
    }
  },

  // CLOTHING
  clothing: {
    '68db9eba2cf858908bcec877': {
      name: 'Kanchipuram Silk Saree',
      description: 'World-renowned traditional Tamil silk garment',
      significance: 'Handwoven silk sarees known for their rich colors, durability, and intricate designs',
      period: 'Ancient weaving tradition',
      region: 'Kanchipuram, Tamil Nadu'
    }
  },

  // ANCIENT SCIENCE
  ancientscience: {
    '68db66eb61660ddab5039fd9': {
      name: 'Siddha Medicine',
      description: 'Ancient Tamil system of medicine using herbs, minerals, and metals for healing',
      significance: 'Traditional holistic healthcare system focusing on balance of body, mind, and spirit',
      field: 'Traditional Medicine',
      period: 'Ancient, developed by Siddha sages'
    }
  }
};

async function applyAllTranslations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('🌐 Adding English translations to ALL collections...\n');

    // Process each collection
    for (const [collectionKey, translations] of Object.entries(allTranslations)) {
      const modelName = collectionKey.charAt(0).toUpperCase() + collectionKey.slice(1, -1);
      const Model = mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📚 ${modelName.toUpperCase()}`);
      console.log('='.repeat(70));

      for (const [id, translation] of Object.entries(translations)) {
        const updates = {};
        
        // Create updates for each field
        for (const [field, value] of Object.entries(translation)) {
          updates[`${field}.en`] = value;
        }

        try {
          await Model.updateOne(
            { _id: mongoose.Types.ObjectId.createFromHexString(id) },
            { $set: updates }
          );
          
          console.log(`\n✅ ${translation.name || translation.title}`);
          Object.entries(translation).forEach(([key, val]) => {
            const displayVal = val.length > 60 ? val.substring(0, 60) + '...' : val;
            console.log(`   ${key}: ${displayVal}`);
          });
        } catch (err) {
          console.log(`\n❌ Failed to update ${id}: ${err.message}`);
        }
      }
    }

    console.log('\n\n🎉 All English translations applied successfully!\n');

    // Verification
    console.log('📋 Verifying updates...\n');
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
    const events = await Event.find({});
    events.forEach(e => {
      console.log(`   ✓ ${e.title?.en || 'Missing'} / ${e.title?.ta || 'Missing'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed\n');
  }
}

applyAllTranslations();
