import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fixhub';

async function clearData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    const db = mongoose.connection.db;

    // Collections to clear
    const collectionsToClear = [
      'bookings',
      'tickets',
      'notifications',
      'paymentintents',
      'transactions',
      'reviews',
      'chatmessages',
    ];

    for (const name of collectionsToClear) {
      try {
        await db.collection(name).deleteMany({});
        console.log(`Cleared collection: ${name}`);
      } catch (err) {
        console.log(`Could not clear ${name}: ${err.message}`);
      }
    }

    console.log('Successfully wiped all activity, job history, bookings, and notifications!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
}

clearData();
