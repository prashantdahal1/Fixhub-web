const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/v1/auth/whoami', (req, res) => {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.replace('Bearer ', '');
    if (token === 'admin-token') {
      return res.json({ success: true, data: { email: 'admin@fixhub', firstName: 'Admin', role: 'admin' } });
    }
    if (token === 'pro-token') {
      return res.json({ success: true, data: { email: 'pro@fixhub', firstName: 'Pro', role: 'professional' } });
    }
    if (token === 'test-token') {
      return res.json({ success: true, data: { email: 'test@fixhub', firstName: 'Test', role: 'customer' } });
    }
  }
  res.status(200).json({ success: false, data: null });
});

app.get('/api/v1/services', (req, res) => {
  res.json({ success: true, data: [], meta: { total: 0 } });
});

app.get('/api/v1/services/:id', (req, res) => {
  res.json({ success: true, data: null });
});

app.get('/api/v1/services/slug/:slug', (req, res) => {
  res.json({ success: true, data: { _id: 'svc1', title: 'Mock Service', slug: req.params.slug, category: 'electrician', shortDescription: 'Mock', basePrice: 100, priceUnit: 'flat', rating: 5, reviewCount: 0, imageUrl: '', tags: [], specifications: [], isCertified: false, estimatedDuration: '1 hour', description: 'Mock' } });
});

app.get('/api/v1/notifications', (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body || {};
  // simple token mapping for tests
  if (email && email.includes('admin')) {
    return res.json({ success: true, data: { token: 'admin-token', user: { email, firstName: 'Admin', role: 'admin' } } });
  }
  if (email && email.includes('pro')) {
    return res.json({ success: true, data: { token: 'pro-token', user: { email, firstName: 'Pro', role: 'professional' } } });
  }
  return res.json({ success: true, data: { token: 'test-token', user: { email: email || 'test@fixhub', firstName: 'Test', role: 'customer' } } });
});

app.get('/api/v1/notifications/stream', (req, res) => {
  res.status(200).send('');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Mock backend listening on', port));
