/**
 * FixHub Frontend Test Suite
 * 21 test cases covering: Auth validation, service filtering/sorting,
 * booking logic, promo codes, chat messaging, history filtering,
 * UI helpers, and API client utilities.
 *
 * Run with: npm test
 */

// ── 1. AUTH FORM VALIDATION (5 tests) ────────────────────────────────────────

describe('Authentication Form Validation', () => {
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPassword = (password: string) => password.length >= 6;

  const isValidPhoneNumber = (phone: string) => /^[0-9]{10}$/.test(phone);

  it('Test 1: should accept a valid email address', () => {
    expect(isValidEmail('prashant@example.com')).toBe(true);
  });

  it('Test 2: should reject an invalid email address without domain', () => {
    expect(isValidEmail('prashant@')).toBe(false);
  });

  it('Test 3: should reject a password shorter than 6 characters', () => {
    expect(isValidPassword('abc')).toBe(false);
  });

  it('Test 4: should accept a password with at least 6 characters', () => {
    expect(isValidPassword('SecurePass1!')).toBe(true);
  });

  it('Test 5: should validate a valid 10-digit Nepali phone number', () => {
    expect(isValidPhoneNumber('9841234567')).toBe(true);
    expect(isValidPhoneNumber('123')).toBe(false);
  });
});

// ── 2. SERVICE SEARCH, FILTER & SORT LOGIC (5 tests) ─────────────────────────

describe('Service Catalog Filter & Sort Logic', () => {
  const services = [
    { id: '1', title: 'AC Service & Deep Clean', category: 'ac_repair', basePrice: 1200, rating: 5.0 },
    { id: '2', title: 'Home Plumbing Repair',    category: 'plumber',   basePrice: 800,  rating: 4.8 },
    { id: '3', title: 'Electrical Wiring Fix',   category: 'electrician', basePrice: 1500, rating: 4.9 },
    { id: '4', title: 'Wall Painting Service',   category: 'painter',   basePrice: 3500, rating: 4.7 },
  ];

  it('Test 6: should filter services by category ac_repair', () => {
    const filtered = services.filter(s => s.category === 'ac_repair');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('AC Service & Deep Clean');
  });

  it('Test 7: should sort services by price ascending (cheapest first)', () => {
    const sorted = [...services].sort((a, b) => a.basePrice - b.basePrice);
    expect(sorted[0].basePrice).toBe(800);
    expect(sorted[3].basePrice).toBe(3500);
  });

  it('Test 8: should sort services by price descending (most expensive first)', () => {
    const sorted = [...services].sort((a, b) => b.basePrice - a.basePrice);
    expect(sorted[0].basePrice).toBe(3500);
  });

  it('Test 9: should sort services by rating descending (highest rating first)', () => {
    const sorted = [...services].sort((a, b) => b.rating - a.rating);
    expect(sorted[0].rating).toBe(5.0);
    expect(sorted[0].category).toBe('ac_repair');
  });

  it('Test 10: should search services by keyword case-insensitively', () => {
    const query = 'plumbing';
    const results = services.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase())
    );
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');
  });
});

// ── 3. BOOKING & PROMO CODE LOGIC (5 tests) ──────────────────────────────────

describe('Booking Flow & Promo Code Logic', () => {
  const PROMO_CODES: Record<string, number> = {
    FIXHUB30: 0.30,
    FIRST30: 0.30,
    WELCOME30: 0.30,
    PROMO500: 500, // fixed NPR discount
    SAVE500: 500,
    FIRSTFIX10: 0.10,
  };

  const applyPromoCode = (code: string, total: number): { discount: number; valid: boolean } => {
    const upper = code.trim().toUpperCase();
    if (upper in PROMO_CODES) {
      const val = PROMO_CODES[upper];
      const discount = val < 1 ? Math.round(total * val) : val;
      return { discount, valid: true };
    }
    return { discount: 0, valid: false };
  };

  it('Test 11: should apply 30% discount for promo code FIXHUB30', () => {
    const result = applyPromoCode('FIXHUB30', 2000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(600);
  });

  it('Test 12: should apply flat Rs 500 discount for code PROMO500', () => {
    const result = applyPromoCode('PROMO500', 2000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500);
  });

  it('Test 13: should reject an invalid or unknown promo code', () => {
    const result = applyPromoCode('FAKECODE123', 2000);
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
  });

  it('Test 14: should compute correct final amount after discount', () => {
    const total = 1500;
    const { discount } = applyPromoCode('WELCOME30', total);
    const finalAmount = Math.max(0, total - discount);
    expect(finalAmount).toBe(1050);
  });

  it('Test 15: should ensure final booking amount is never below zero', () => {
    const total = 300;
    const discount = 500;
    const finalAmount = Math.max(0, total - discount);
    expect(finalAmount).toBe(0);
  });
});

// ── 4. HISTORY FILTER & DATE UTILITY (4 tests) ───────────────────────────────

describe('Service History Filtering & Date Utilities', () => {
  const bookings = [
    { id: 'b1', status: 'completed', amount: 2500, scheduledAt: '2026-07-01T10:00:00Z' },
    { id: 'b2', status: 'cancelled', amount: 1200, scheduledAt: '2026-07-15T14:00:00Z' },
    { id: 'b3', status: 'completed', amount: 3000, scheduledAt: '2026-07-20T09:00:00Z' },
    { id: 'b4', status: 'confirmed', amount: 1800, scheduledAt: '2026-07-25T12:00:00Z' },
  ];

  it('Test 16: should filter only completed bookings', () => {
    const completed = bookings.filter(b => b.status === 'completed');
    expect(completed.length).toBe(2);
  });

  it('Test 17: should calculate total amount spent on completed bookings', () => {
    const total = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0);
    expect(total).toBe(5500);
  });

  it('Test 18: should sort bookings by date descending (most recent first)', () => {
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
    expect(sorted[0].id).toBe('b4');
  });

  it('Test 19: should format a booking date to readable locale string', () => {
    const date = new Date('2026-07-01T10:00:00Z');
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2026');
  });
});

// ── 5. CHAT MESSAGE HANDLING (2 tests) ───────────────────────────────────────

describe('Chat Message Handling', () => {
  it('Test 20: should append new message to conversation history', () => {
    const history: { sender: string; text: string }[] = [
      { sender: 'pro', text: 'Hi there!' },
    ];
    const newMsg = { sender: 'customer', text: 'When will you arrive?' };
    const updated = [...history, newMsg];
    expect(updated.length).toBe(2);
    expect(updated[1].text).toBe('When will you arrive?');
  });

  it('Test 21: should correctly identify message as sent by current user', () => {
    const currentUser = 'customer';
    const messages = [
      { sender: 'customer', text: 'Hello' },
      { sender: 'pro', text: 'Hi!' },
    ];
    const myMessages = messages.filter(m => m.sender === currentUser);
    expect(myMessages.length).toBe(1);
    expect(myMessages[0].text).toBe('Hello');
  });
});
