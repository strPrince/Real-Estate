#!/bin/bash
# Script to build and deploy Firestore indexes automatically.

echo "Checking for Firebase CLI..."
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI could not be found."
    echo "Please install it using: npm install -g firebase-tools"
    exit 1
fi

echo "Deploying Firestore configurations (Indexes and Rules)..."
# Make sure we are in the root directory where firebase.json and firestore.indexes.json live
cd "$(dirname "$0")/.." || exit 1

# Runs the Firebase CLI to deploy only the Firestore indexes
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
  echo "✅ Firestore indexes successfully deployed! Note: Indexes might take a few minutes to build in the Firebase Console."
else
  echo "❌ Failed to deploy Firestore indexes."
  exit 1
fi
