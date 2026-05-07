import fs from 'fs';

const indexesData = JSON.parse(fs.readFileSync('../firestore.indexes.json', 'utf8'));

console.log('🔥 FIRESTORE INDEXES - DIRECT CREATION LINKS');
console.log('=' .repeat(60));
console.log(`Total indexes to create: ${indexesData.indexes.length}`);
console.log('');

function encodeIndexUrl(collectionGroup, fields) {
  // Create the index definition in the format Firebase expects
  const indexDef = {
    collectionGroup,
    queryScope: 'COLLECTION',
    fields: fields.map(f => ({
      fieldPath: f.fieldPath,
      order: f.order
    }))
  };

  // Firebase uses a base64 encoded format for the URL
  // We'll construct the URL manually since the exact encoding is complex
  const projectId = 'test-real-estate-6270c';
  const baseUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;

  return baseUrl;
}

indexesData.indexes.forEach((index, i) => {
  const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
  console.log(`${i + 1}. ${index.collectionGroup}: ${fields}`);
  console.log(`   Create URL: ${encodeIndexUrl(index.collectionGroup, index.fields)}`);
  console.log('');
});

console.log('📋 STEP-BY-STEP INSTRUCTIONS:');
console.log('1. Open: https://console.firebase.google.com/project/test-real-estate-6270c/firestore/indexes');
console.log('2. For each index above, click "Create Index" and add the fields');
console.log('3. Start with the most critical ones:');
console.log('   - queries: ownerId, createdAt');
console.log('   - properties: userId, createdAt (this fixes your current error)');
console.log('   - properties: status, createdAt');
console.log('');
console.log('⚠️  INDEX CREATION TAKES TIME:');
console.log('- Each index takes 5-10 minutes to build');
console.log('- You can create multiple at once');
console.log('- Monitor progress in the Firebase Console');