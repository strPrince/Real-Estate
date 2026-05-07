/**
 * Auto-generate firestore.indexes.json for the application based on widely used queries.
 * Firebase uses this file to construct your database indexes.
 * To use this file, run it with `node generate_indexes.js`, then run `firebase deploy --only firestore`.
 */

import fs from 'fs';

const indexes = [
  // Queries
  {
    collectionGroup: "queries",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "ownerId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]
  },
  
  // Properties - Admin & Global Filters (Common)
  {
    collectionGroup: "properties",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]
  },
  {
    collectionGroup: "properties",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]
  },
  {
    collectionGroup: "properties",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "price", order: "ASCENDING" }
    ]
  },
  {
    collectionGroup: "properties",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "price", order: "DESCENDING" }
    ]
  },
  {
    collectionGroup: "properties",
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "featured", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" }
    ]
  }
];

// Dynamically build intent, type, and location permutations for filtering
const filters = ['intent', 'type', 'location.city'];
const orders = [
  { fieldPath: 'createdAt', order: 'DESCENDING' },
  { fieldPath: 'price', order: 'ASCENDING' },
  { fieldPath: 'price', order: 'DESCENDING' }
];

// Helper to get all sub-combinations of a size
function getCombinations(arr, size) {
  if (size === 1) return arr.map(a => [a]);
  const combs = [];
  arr.forEach((v, i) => {
    const smallerCombs = getCombinations(arr.slice(i + 1), size - 1);
    smallerCombs.forEach(c => combs.push([v].concat(c)));
  });
  return combs;
}

// Generate ascending combinations from generic filters combined with the ordering fields
for (let size = 1; size <= filters.length; size++) {
  const allCombs = getCombinations(filters, size);
  allCombs.forEach((comb) => {
    orders.forEach((orderRule) => {
      const idx = {
        collectionGroup: "properties",
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "status", order: "ASCENDING" },
          ...comb.map((filterParam) => ({ fieldPath: filterParam, order: "ASCENDING" })),
          orderRule
        ]
      };
      indexes.push(idx);
    });
  });
}

const finalConfig = {
  indexes: indexes,
  fieldOverrides: []
};

fs.writeFileSync('../firestore.indexes.json', JSON.stringify(finalConfig, null, 2), 'utf-8');

console.log('✅ firestore.indexes.json has been auto-generated based on current widely-used configurations!');
console.log('   Run "firebase deploy --only firestore:indexes" to push to Cloud Firestore.');
