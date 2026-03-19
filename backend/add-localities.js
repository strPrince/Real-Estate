import { db } from './firebase.js';

const rawNames = `
Alkapuri
New Alkapuri
Akota
Gotri
Subhanpura
Ellora Park
Vasna
Bhayli
Atladara
Tandalja
Manjalpur
Tarsali
Makarpura
Vadsar
Kalali
Waghodia Road
Ajwa Road
Karelibaug
Nizampura
Chhani
Sama
Harni
Gorwa
Fatehgunj
Sayajigunj
Raopura
Mandvi
Dandia Bazar
Pratapgunj
Old Padra Road
New VIP Road
VIP Road
Bill
Chapad
Kapurai
`;

const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const getUniqueNames = (input) => {
  const unique = new Map();
  input
    .split('\n')
    .map((name) => normalize(name))
    .filter(Boolean)
    .forEach((name) => {
      const key = name.toLowerCase();
      if (!unique.has(key)) unique.set(key, name);
    });
  return Array.from(unique.values());
};

async function main() {
  const names = getUniqueNames(rawNames);
  if (!names.length) {
    console.log('No locality names provided.');
    return;
  }

  const snapshot = await db.collection('localities').get();
  const existing = new Set();
  snapshot.forEach((doc) => {
    const data = doc.data() || {};
    const key = normalize(data.name).toLowerCase();
    if (key) existing.add(key);
  });

  const toCreate = names.filter((name) => !existing.has(name.toLowerCase()));
  if (!toCreate.length) {
    console.log('All localities already exist. Nothing to add.');
    return;
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  toCreate.forEach((name) => {
    const ref = db.collection('localities').doc();
    batch.set(ref, {
      name,
      description: '',
      lat: null,
      lng: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
  console.log(`Added ${toCreate.length} localities.`);
  console.log('Added:', toCreate.join(', '));
}

main().catch((err) => {
  console.error('Failed to add localities:', err);
  process.exit(1);
});
