

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Login from './Login';

test('renderiza el formulario de login', () => {
  render(
    <MemoryRouter>
      <Login setIsAuthenticated={() => {}} />
    </MemoryRouter>
  );

  expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
});