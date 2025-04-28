

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import Pacientes from './Pacientes';

test('renderiza pacientes con mensaje de carga', () => {
  render(
    <MemoryRouter initialEntries={['/paciente/123']}>
      <Routes>
        <Route path="/paciente/:id" element={<Pacientes />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/cargando datos del paciente/i)).toBeInTheDocument();
});

test('maneja error al cargar paciente', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('Fetch error')));

  render(
    <MemoryRouter initialEntries={['/paciente/123']}>
      <Routes>
        <Route path="/paciente/:id" element={<Pacientes />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByText(/error al cargar paciente/i)).toBeInTheDocument();
});

test('muestra mensaje si paciente no encontrado', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(null) })
  );

  render(
    <MemoryRouter initialEntries={['/paciente/123']}>
      <Routes>
        <Route path="/paciente/:id" element={<Pacientes />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByText(/paciente no encontrado/i)).toBeInTheDocument();
});

test('muestra mensaje si paciente no encontrado', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(null) })
  );

  render(
    <MemoryRouter initialEntries={['/paciente/123']}>
      <Routes>
        <Route path="/paciente/:id" element={<Pacientes />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByText(/paciente no encontrado/i)).toBeInTheDocument();
});