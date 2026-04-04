import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from './components/Navigation';

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useLocation: () => ({ pathname: '/claims' }),
  }),
  { virtual: true }
);

test('renders gigshield navigation', () => {
  render(<Navigation onLogout={() => {}} user={{ name: 'Codex' }} />);
  expect(screen.getByText(/gigshield/i)).toBeInTheDocument();
  expect(screen.getByText(/claim management/i)).toBeInTheDocument();
  expect(screen.getByText(/insurance policy/i)).toBeInTheDocument();
});
