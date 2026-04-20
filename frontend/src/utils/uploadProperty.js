/**
 * Frontend Property Upload Script
 * 
 * This script uploads Aadikara Avenue property to Firestore with local images.
 * Run from browser console or integrate into your admin dashboard.
 * 
 * Requirements:
 * - Firebase client SDK initialized
 * - Admin authentication
 * - Images available in frontend/src/assets/temp/
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

// You'll need to export these from your initialization
// For now, assuming they're available globally or passed in
export async function uploadAadikaraProperty(db, storage) {
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
    images: [],

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Image imports (adjust path as needed)
  const images = import.meta.glob('/src/assets/temp/*.jpeg');
  const imageFiles = Object.keys(images); // ['img1.jpeg', 'img2.jpeg', 'img3.jpeg']

  console.log('🚀 Starting property upload process...\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Upload images to Storage
    console.log('🖼️  Uploading images to Firebase Storage...');
    const imageUrls = [];

    for (const imagePath of imageFiles) {
      try {
        const imageName = imagePath.split('/').pop();
        console.log(`📤 Uploading: ${imageName}`);

        // Fetch the image
        const response = await fetch(imagePath);
        const blob = await response.blob();

        // Upload to Firebase Storage
        const storageRef = ref(storage, `properties/${Date.now()}-${Math.random().toString(36).slice(2)}-${imageName}`);
        await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });

        // Get download URL
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
        console.log(`✅ Uploaded: ${imageName}`);
      } catch (err) {
        console.error(`❌ Error uploading ${imagePath}:`, err.message);
      }
    }

    console.log('\n' + '═'.repeat(60));

    // Step 2: Create property document in Firestore
    console.log('\n📝 Uploading property to Firestore...');

    const propertyData = {
      ...PROPERTY_DATA,
      images: imageUrls, // Use 'images' field instead of 'imageUrls'
    };

    const docRef = await addDoc(collection(db, 'properties'), propertyData);

    console.log(`✅ Property created successfully!`);
    console.log(`📄 Document ID: ${docRef.id}`);
    console.log(`📍 Property: ${propertyData.title}`);
    console.log(`🖼️  Images uploaded: ${imageUrls.length}`);
    console.log(`💰 Price: ₹${propertyData.price / 100000} lacs (Average)`);

    console.log('\n' + '═'.repeat(60));
    console.log('\n✨ Property upload completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   • Property: ${PROPERTY_DATA.name}`);
    console.log(`   • Location: ${PROPERTY_DATA.locality}, ${PROPERTY_DATA.city}`);
    console.log(`   • Firestore ID: ${docRef.id}`);
    console.log(`   • Units:`);
    PROPERTY_DATA.units.forEach(unit => {
      console.log(`     - ${unit.type}: ${unit.carpetArea.min}-${unit.carpetArea.max} ${unit.carpetArea.unit}, ₹${unit.price.min / 100000}-${unit.price.max / 100000} lacs`);
    });
    console.log(`   • Images: ${imageUrls.length}`);

    return {
      success: true,
      propertyId: docRef.id,
      images: imageUrls,
    };
  } catch (err) {
    console.error('\n❌ Upload failed:', err.message);
    throw err;
  }
}
