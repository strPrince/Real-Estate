import fs from 'fs';

const indexesData = JSON.parse(fs.readFileSync('../firestore.indexes.json', 'utf8'));

console.log('🔥 FIRESTORE INDEXES TO CREATE');
console.log('=' .repeat(50));
console.log(`Total indexes: ${indexesData.indexes.length}`);
console.log('');

indexesData.indexes.forEach((index, i) => {
  const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
  console.log(`${i + 1}. ${index.collectionGroup}: ${fields}`);
});

console.log('');
console.log('📋 MANUAL CREATION INSTRUCTIONS:');
console.log('1. Go to: https://console.firebase.google.com/project/test-real-estate-6270c/firestore/indexes');
console.log('2. Click "Create Index" for each one above');
console.log('3. Select collection and add fields with correct order');
console.log('');
console.log('⚡ BATCH CREATION (if you have Firebase CLI permissions):');
console.log('firebase deploy --only firestore:indexes --force');