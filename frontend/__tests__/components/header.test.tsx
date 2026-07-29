import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/Navbar';

test('Header renders', () => {
  render(<Header />);
  expect(screen.getByText(/FixHub/i)).toBeDefined();
});
