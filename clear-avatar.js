import { MongoClient } from 'mongodb';

const client = await MongoClient.connect('mongodb://localhost:27017');
const db = client.db('fixhub');

const user = await db.collection('users').findOne({ email: 'prashantdahal319@gmail.com' });
console.log('Current profilePicture:', JSON.stringify(user?.profilePicture));

const result = await db.collection('users').updateOne(
  { email: 'prashantdahal319@gmail.com' },
  { $set: { profilePicture: '' } }
);
console.log('Modified:', result.modifiedCount);

await client.close();
