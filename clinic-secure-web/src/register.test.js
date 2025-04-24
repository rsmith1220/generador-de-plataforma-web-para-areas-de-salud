

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Register from './Register';

test('renderiza el formulario de registro', () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  expect(screen.getByText(/regístrate/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
});