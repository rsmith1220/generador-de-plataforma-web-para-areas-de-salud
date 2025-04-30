const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Dashboard from '../src/Dashboard';

beforeAll(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'usuario_id') return '5';
    if (key === 'clinica_id') return '1';
    return null;
  });
  Storage.prototype.removeItem = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renderiza el dashboard con título de pacientes', () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
  expect(screen.getAllByText(/pacientes/i).length).toBeGreaterThan(0);
});

test('muestra mensaje si no hay pacientes', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/no hay pacientes registrados/i)).toBeInTheDocument();
});

test('botón cerrar sesión elimina datos de localStorage', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

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

test('maneja error al cargar pacientes', async () => {
  jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject(new Error('Fallo en fetch')));

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/no hay pacientes registrados/i)).toBeInTheDocument();
});

test('filtrar paciente inexistente muestra no encontrado', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const input = await screen.findByPlaceholderText('Buscar paciente');
  fireEvent.change(input, { target: { value: 'NombreInexistente' } });
  expect(screen.getByText(/no hay pacientes registrados/i)).toBeInTheDocument();
});


test('redirige a login si no hay usuario_id', async () => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'usuario_id') return null;
    if (key === 'clinica_id') return '1';
    return null;
  });

  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(mockNavigate).toHaveBeenCalledWith('/login');
});

test('input de búsqueda está presente en el dashboard', async () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
  const input = await screen.findByPlaceholderText('Buscar paciente');
  expect(input).toBeInTheDocument();
});

test('renderiza nombres de pacientes si existen', async () => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'usuario_id') return '5';
    if (key === 'clinica_id') return '1';
    return null;
  });

  const mockPatients = [
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'Ana Gómez' }
  ];

  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => mockPatients,
  });

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
  expect(await screen.findByText('Ana Gómez')).toBeInTheDocument();
});