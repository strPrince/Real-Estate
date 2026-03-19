import { db } from './firebase.js';

async function getOTP(email) {
  const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  if (snapshot.empty) {
    console.log('User not found');
    process.exit(1);
  }
  const data = snapshot.docs[0].data();
  console.log('OTP:', data.otp);
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.log('Email required');
  process.exit(1);
}

getOTP(email);
