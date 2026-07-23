import WebSocket from 'ws';

const apiBase = 'http://127.0.0.1:5000/api/v1';
const loginUrl = `${apiBase}/auth/login`;

const email = 'admin@fixhub.com';
const password = 'admin123';

(async () => {
  try {
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    console.log('Login response status:', loginRes.status);
    console.log('Login response body:', JSON.stringify(loginData, null, 2));

    const token = loginData.token || loginData.data?.token || loginData?.data?.token;
    if (!token) {
      console.error('No token found in login response');
      process.exit(1);
    }

    const authUrl = `ws://127.0.0.1:5000/ws?token=${encodeURIComponent(token)}`;
    console.log('Connecting websocket to:', authUrl);

    const ws = new WebSocket(authUrl);
    let receivedChatMessage = false;

    ws.on('open', () => {
      console.log('WebSocket opened');
      const message = {
        type: 'chat_message',
        payload: {
          bookingId: '6a589569add8634f6f7ba9e3',
          senderName: 'TestUser',
          text: 'Authenticated websocket test message',
        },
      };
      console.log('Sending chat_message payload:', JSON.stringify(message, null, 2));
      ws.send(JSON.stringify(message));
    });

    ws.on('message', (data) => {
      const text = data.toString();
      console.log('WS MSG:', text);
      try {
        const msg = JSON.parse(text);
        if (msg.type === 'chat_message') {
          console.log('Received chat_message event:', JSON.stringify(msg, null, 2));
          receivedChatMessage = true;
          ws.close();
        }
      } catch (_) {
        // ignore parse errors
      }
    });

    ws.on('close', (code, reason) => {
      console.log('WebSocket closed', code, reason.toString());
      process.exit(receivedChatMessage ? 0 : 1);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error', err.message);
      process.exit(1);
    });

    setTimeout(() => {
      if (!receivedChatMessage) {
        console.error('Timed out without receiving chat_message event');
        ws.close();
      }
    }, 8000);
  } catch (error) {
    console.error('ERROR', error);
    process.exit(1);
  }
})();
