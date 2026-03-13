import { db } from './firebase.js';

// Dummy data generators
const INTENTS = ['buy', 'rent'];
const TYPES = ['residential', 'commercial', 'plot', 'pg'];
const CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad'];
const LOCALITIES = {
  Mumbai: ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Dadar', 'Kurla', 'Santacruz'],
  Pune: ['Kothrud', 'Viman Nagar', 'Baner', 'Aundh', 'Hinjewadi', 'Wakad', 'Karve Nagar'],
  Delhi: ['Gurgaon', 'Noida', 'South Delhi', 'East Delhi', 'West Delhi', 'North Delhi'],
  Bangalore: ['Whitefield', 'Electronic City', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar'],
  Chennai: ['Adyar', 'T. Nagar', 'Anna Nagar', 'Velachery', 'Nungambakkam', 'Mylapore'],
  Hyderabad: ['Hitech City', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Kukatpally'],
  Kolkata: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Howrah', 'Garia'],
  Ahmedabad: ['CG Road', 'Satellite', 'Vastrapur', 'Prahlad Nagar', 'Bodakdev', 'Thaltej']
};
const AMENITIES = ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Lift', 'Clubhouse', 'Play Area', 'Power Backup', '24/7 Water Supply'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateProperty(index) {
  const intent = randomChoice(INTENTS);
  const type = randomChoice(TYPES);
  const city = randomChoice(CITIES);
  const locality = randomChoice(LOCALITIES[city]);
  
  // Generate realistic prices based on intent, type, and city
  let basePrice;
  if (intent === 'buy') {
    basePrice = randomInt(3000000, 50000000); // ₹30L to ₹5Cr
  } else {
    basePrice = randomInt(5000, 100000); // ₹5K to ₹1L per month
  }

  return {
    title: `${randomInt(1, 4)+'+ BHK'} ${type.charAt(0).toUpperCase() + type.slice(1)} in ${locality}`,
    description: `A beautiful ${type} property located in the heart of ${locality}, ${city}. Features ${randomChoice(['modern amenities', 'spacious rooms', 'great location', 'excellent connectivity'])} and is perfect for ${randomChoice(['families', 'young professionals', 'investors'])}.`,
    intent,
    type,
    price: basePrice,
    bedrooms: type === 'plot' ? 0 : randomInt(1, 4),
    bathrooms: type === 'plot' ? 0 : randomInt(1, 4),
    area: randomInt(400, 3000),
    location: {
      city,
      locality,
      address: `${randomInt(1, 100)}, ${randomChoice(['Main Road', 'Cross Road', 'Lane', 'Avenue'])} ${locality}`,
      coordinates: {
        lat: 20 + Math.random() * 20,
        lng: 70 + Math.random() * 30
      }
    },
    amenities: AMENITIES.filter(() => Math.random() > 0.5),
    images: [
      `https://picsum.photos/seed/${index + 1000}/800/600.jpg`,
      `https://picsum.photos/seed/${index + 1001}/800/600.jpg`,
      `https://picsum.photos/seed/${index + 1002}/800/600.jpg`
    ],
    featured: Math.random() > 0.85,
    status: 'active',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date())
  };
}

async function generateAndInsertProperties(count) {
  console.log(`Generating ${count} dummy properties...`);
  
  const properties = [];
  for (let i = 0; i < count; i++) {
    properties.push(generateProperty(i));
  }

  console.log('Inserting properties into Firestore...');
  const batch = db.batch();
  
  properties.forEach(prop => {
    const docRef = db.collection('properties').doc();
    batch.set(docRef, prop);
  });

  await batch.commit();
  console.log(`Successfully inserted ${count} properties!`);
}

// Run the script
// modified to insert 15 properties instead of 1000
generateAndInsertProperties(15).catch(error => {
  console.error('Error inserting properties:', error);
  process.exit(1);
});
