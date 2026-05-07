import { db } from './firebase.js';
import { FieldPath } from 'firebase-admin/firestore';

async function createIndexes() {
  console.log('Creating Firestore indexes...');

  try {
    // The specific index causing the error: userId + createdAt
    const indexRef = db.collection('properties').where('userId', '!=', null).orderBy('createdAt', 'desc').limit(1);
    const snapshot = await indexRef.get();
    console.log('✅ Index userId+createdAt is ready (query executed successfully)');

    // Test other common indexes
    const statusIndex = db.collection('properties').where('status', '==', 'active').orderBy('createdAt', 'desc').limit(1);
    await statusIndex.get();
    console.log('✅ Index status+createdAt is ready');

    const priceIndex = db.collection('properties').where('status', '==', 'active').orderBy('price', 'asc').limit(1);
    await priceIndex.get();
    console.log('✅ Index status+price is ready');

    console.log('🎉 All required indexes are working!');

  } catch (error) {
    if (error.code === 9) {
      console.log('❌ Index creation needed. Please create the following indexes in Firebase Console:');
      console.log('Index: properties collection - userId (ASC), createdAt (DESC)');
      console.log('URL from error:', error.message);
    } else {
      console.error('Error testing indexes:', error);
    }
  }
}

createIndexes();