import { MongoClient } from 'mongodb';
import WebSocket from 'ws';

const uri = 'mongodb://localhost:27017/fixhub';
(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const booking = await db.collection('bookings').findOne({});
    const user = await db.collection('users').findOne({ email: 'admin@fixhub.com' }) || await db.collection('users').findOne({});
    if (!booking) {
      console.error('No booking found');
      process.exit(1);
    }
    if (!user) {
      console.error('No user found');
      process.exit(1);
    }
    const bookingId = booking._id.toString();
    const senderId = user._id.toString();
    console.log('Booking ID:', bookingId);
    console.log('Sender ID:', senderId);
    const senderName = user.firstName || user.username || 'TestUser';

    const ws = new WebSocket('ws://localhost:5000/ws');
    ws.on('open', () => {
      console.log('WS open');
      ws.send(JSON.stringify({
        type: 'chat_message',
        payload: {
          bookingId,
          senderId,
          senderName,
          text: 'Hello backend test via websocket',
        },
      }));
    });
    ws.on('message', (msg) => {
      console.log('WS msg', msg.toString());
    });
    ws.on('close', () => {
      console.log('WS closed');
      client.close().then(() => process.exit(0));
    });
    ws.on('error', (err) => {
      console.error('WS err', err.message);
      client.close().then(() => process.exit(1));
    });
    setTimeout(() => ws.close(), 4000);
  } catch (error) {
    console.error('ERROR', error);
    await client.close();
    process.exit(1);
  }
})();
