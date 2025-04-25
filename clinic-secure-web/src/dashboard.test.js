

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Dashboard from './Dashboard';

// Mock useNavigate
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn(),
}));

beforeAll(() => {
  // Mock localStorage
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'usuario_id') return '1';
    if (key === 'clinica_id') return '1';
    return null;
  });
  Storage.prototype.removeItem = jest.fn();
  
  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([{ id: 1, nombre: 'Juan Perez' }]),
    })
  );
});

test('renderiza el dashboard con título de pacientes', () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(screen.getAllByText(/pacientes/i).length).toBeGreaterThan(0);
});

test('filtra pacientes por nombre', async () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const input = await screen.findByPlaceholderText('Buscar paciente');
  fireEvent.change(input, { target: { value: 'Juan' } });
  expect(screen.getByText('Juan Perez')).toBeInTheDocument();
});

test('muestra mensaje si no hay pacientes', async () => {
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  );

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/no hay pacientes registrados/i)).toBeInTheDocument();
});

test('botón cerrar sesión elimina datos de localStorage', async () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const button = await screen.findByRole('button', { name: /cerrar sesión/i });
  fireEvent.click(button);

  expect(Storage.prototype.removeItem).toHaveBeenCalledWith('usuario_id');
  expect(Storage.prototype.removeItem).toHaveBeenCalledWith('clinica_id');
});