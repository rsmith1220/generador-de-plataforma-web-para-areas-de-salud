

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Dashboard from './Dashboard';

test('renderiza el dashboard con título de pacientes', () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(screen.getAllByText(/pacientes/i).length).toBeGreaterThan(0);
});