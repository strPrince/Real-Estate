import 'dotenv/config';
import { db } from './firebase.js';

const normalizeUserStatus = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'available' || value === 'active') return 'active';
  if (value === 'sold' || value === 'rented') return value;
  return 'active';
};

const normalizeUserType = (propertyType) => {
  const value = String(propertyType || '').toLowerCase();
  if (value === 'plot') return 'plot';
  if (value === 'commercial') return 'commercial';
  if (value === 'pg') return 'pg';
  return 'residential';
};

const normalizeUserIntent = (intent) => {
  const value = String(intent || '').toLowerCase();
  if (value === 'rent') return 'rent';
  if (value === 'commercial') return 'commercial';
  return 'buy';
};

async function run() {
  const snapshot = await db.collection('properties').get();
  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    if (!data.userId) continue;

    const nextStatus = normalizeUserStatus(data.status);
    const nextIntent = normalizeUserIntent(data.intent);
    const nextType = normalizeUserType(data.propertyType || data.type);

    const updates = {};
    if (nextStatus !== data.status) updates.status = nextStatus;
    if (nextIntent !== data.intent) updates.intent = nextIntent;
    if (nextType !== data.type) updates.type = nextType;
    if (Object.keys(updates).length === 0) continue;

    updates.updatedAt = new Date().toISOString();
    batch.update(doc.ref, updates);
    updated += 1;
    batchCount += 1;

    if (batchCount >= 400) {
      // Firestore batch limit is 500, keep margin.
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) await batch.commit();
  console.log(`Updated ${updated} user properties.`);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
