import { db, storage } from './firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for Aadikara Avenue Property
// NOTE: Using existing app property structure for compatibility
const PROPERTY_DATA = {
  title: 'Aadikara Avenue - Atladra',
  location: {
    locality: 'Atladra',
    city: 'Vadodara',
  },
  description: 'Premium residential and commercial project in Atladra with spacious 2 BHK apartments and shops.',
  price: 3575000, // Average of 2 BHK range (33.5-38 lacs)
  priceUnit: 'buy',
  type: 'residential',
  intent: 'buy',
  status: 'active',
  featured: false,
  
  // Property dimensions
  bedrooms: 2,
  bathrooms: 2,
  area: 762, // Average of 2 BHK range (665-860 sq ft)
  
  // Unit types with carpet ranges (for reference)
  units: [
    {
      type: '2 BHK',
      carpetArea: {
        min: 665,
        max: 860,
        unit: 'sq ft'
      },
      price: {
        min: 3350000, // 33.5 lacs in paise
        max: 3800000, // 38 lacs in paise
        currency: 'INR'
      }
    },
    {
      type: 'Shops',
      carpetArea: {
        min: 197,
        max: 261,
        unit: 'sq ft'
      },
      price: {
        min: 3500000, // 35 lacs in paise
        max: 4800000, // 48 lacs in paise
        currency: 'INR'
      }
    }
  ],

  // Additional details
  amenities: ['Parking', 'Security', 'Water Supply', 'Electricity'],
  images: [], // Will be updated with uploaded image URLs
  
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Image paths
const IMAGE_DIR = path.join(__dirname, '../frontend/src/assets/temp');
const IMAGE_FILES = ['img1.jpeg', 'img2.jpeg', 'img3.jpeg'];

async function uploadImagesToStorage() {
  console.log('🖼️  Uploading images to Firebase Storage...');
  const imageUrls = [];

  for (const imageFile of IMAGE_FILES) {
    const imagePath = path.join(IMAGE_DIR, imageFile);
    
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  Image not found: ${imagePath}`);
      continue;
    }

    try {
      console.log(`📤 Uploading: ${imageFile}`);
      
      const bucket = storage.bucket();
      const filename = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}-${imageFile}`;
      const file = bucket.file(filename);

      // Upload file
      await new Promise((resolve, reject) => {
        const writeStream = file.createWriteStream({
          metadata: { contentType: 'image/jpeg' },
          public: true,
        });

        fs.createReadStream(imagePath)
          .on('error', reject)
          .pipe(writeStream)
          .on('error', reject)
          .on('finish', resolve);
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      imageUrls.push(publicUrl);
      console.log(`✅ Uploaded: ${imageFile} → ${publicUrl}`);
    } catch (err) {
      console.error(`❌ Error uploading ${imageFile}:`, err.message);
    }
  }

  return imageUrls;
}

async function uploadPropertyToFirestore(imageUrls) {
  console.log('\n📝 Uploading property to Firestore...');
  
  try {
    const propertyData = {
      ...PROPERTY_DATA,
      images: imageUrls, // Use 'images' field instead of 'imageUrls'
    };

    // Add property to Firestore
    const docRef = await db.collection('properties').add(propertyData);
    
    console.log(`✅ Property created successfully!`);
    console.log(`📄 Document ID: ${docRef.id}`);
    console.log(`📍 Property: ${propertyData.title}`);
    console.log(`🖼️  Images uploaded: ${imageUrls.length}`);
    console.log(`💰 Price: ₹${propertyData.price / 100000} lacs (Average)`);
    
    return docRef.id;
  } catch (err) {
    console.error('❌ Error uploading property to Firestore:', err);
    throw err;
  }
}

async function main() {
  console.log('🚀 Starting property upload process...\n');
  console.log('═'.repeat(60));
  
  try {
    // Upload images
    const imageUrls = await uploadImagesToStorage();

    if (imageUrls.length === 0) {
      console.warn('\n⚠️  No images uploaded. Continuing with property creation...');
    }

    console.log('\n' + '═'.repeat(60));

    // Upload property
    const propertyId = await uploadPropertyToFirestore(imageUrls);

    console.log('\n' + '═'.repeat(60));
    console.log('\n✨ Property upload completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   • Property: ${PROPERTY_DATA.title}`);
    console.log(`   • Location: ${PROPERTY_DATA.location.locality}, ${PROPERTY_DATA.location.city}`);
    console.log(`   • Firestore ID: ${propertyId}`);
    console.log(`   • Price: ₹${PROPERTY_DATA.price / 100000} lacs (Average)`);
    console.log(`   • Area: ${PROPERTY_DATA.area} sq ft (Average)`);
    console.log(`   • Bedrooms: ${PROPERTY_DATA.bedrooms}`);
    console.log(`   • Available Units:`);
    PROPERTY_DATA.units.forEach(unit => {
      console.log(`     - ${unit.type}: ${unit.carpetArea.min}-${unit.carpetArea.max} ${unit.carpetArea.unit}, ₹${unit.price.min / 100000}-${unit.price.max / 100000} lacs`);
    });
    console.log(`   • Images: ${imageUrls.length}`);

  } catch (err) {
    console.error('\n❌ Upload failed:', err.message);
    process.exit(1);
  }
}

main();
