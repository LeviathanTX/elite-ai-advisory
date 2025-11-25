import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  // Basic smoke test to ensure the app renders
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
