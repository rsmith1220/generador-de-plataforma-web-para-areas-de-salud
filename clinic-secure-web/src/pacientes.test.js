

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