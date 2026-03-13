import { db } from './firebase.js';

/**
 * Script to remove 90% of documents from a Firestore collection
 * Usage: node backend/remove-90-percent-collection.js
 */

const COLLECTION_NAME = 'properties'; // Change this to your collection name

async function remove90PercentOfCollection() {
  try {
    console.log(`Starting to process collection: ${COLLECTION_NAME}`);

    // Get all documents in the collection
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const totalDocuments = snapshot.size;
    
    console.log(`Total documents in ${COLLECTION_NAME}: ${totalDocuments}`);

    if (totalDocuments === 0) {
      console.log('Collection is already empty');
      return;
    }

    // Calculate number of documents to keep (10%)
    const documentsToKeep = Math.ceil(totalDocuments * 0.1);
    const documentsToDelete = totalDocuments - documentsToKeep;

    console.log(`Documents to keep: ${documentsToKeep}`);
    console.log(`Documents to delete: ${documentsToDelete}`);

    // Create an array of document references
    const allDocuments = [];
    snapshot.forEach(doc => {
      allDocuments.push(doc.ref);
    });

    // Shuffle the array to get a random selection
    const shuffledDocuments = allDocuments.sort(() => Math.random() - 0.5);

    // Get the documents to delete (first N documents after shuffle)
    const documentsToDeleteRefs = shuffledDocuments.slice(documentsToKeep);

    console.log('Starting deletion process...');

    // Delete documents in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    let deletedCount = 0;

    for (let i = 0; i < documentsToDeleteRefs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = documentsToDeleteRefs.slice(i, i + batchSize);

      batchDocs.forEach(docRef => {
        batch.delete(docRef);
      });

      await batch.commit();
      deletedCount += batchDocs.length;

      console.log(`Deleted ${deletedCount} of ${documentsToDelete} documents`);
    }

    console.log('========================================');
    console.log('Deletion process completed successfully');
    console.log(`Total documents: ${totalDocuments}`);
    console.log(`Documents kept: ${documentsToKeep}`);
    console.log(`Documents deleted: ${deletedCount}`);
    console.log(`Percentage deleted: ${((deletedCount / totalDocuments) * 100).toFixed(2)}%`);
    console.log('========================================');

  } catch (error) {
    console.error('Error processing collection:', error);
  }
}

// Run the script
remove90PercentOfCollection();
