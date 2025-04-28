import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Register from './Register';

describe('Register Component', () => {
  test('renderiza el formulario de registro', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText(/regístrate/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/clinic id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  test('permite escribir en los campos', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/clinic id/i), { target: { value: '1' } });

    expect(screen.getByPlaceholderText(/nombre/i)).toHaveValue('Juan');
    expect(screen.getByPlaceholderText(/correo/i)).toHaveValue('juan@example.com');
    expect(screen.getByPlaceholderText(/contraseña/i)).toHaveValue('password123');
    // For type="number", value is string unless converted; check string:
    expect(screen.getByPlaceholderText(/clinic id/i)).toHaveValue(1);
  });

  test('envía el formulario', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/nombre/i), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'maria@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'password456' } });
    fireEvent.change(screen.getByPlaceholderText(/clinic id/i), { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/register', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Maria',
        email: 'maria@example.com',
        password: 'password456',
        clinica_id: '2'
      }),
    }));
  });
});

test('muestra error si falla registro', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/nombre/i), { target: { value: 'Error' } });
  fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'error@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'errorpass' } });
  fireEvent.change(screen.getByPlaceholderText(/clinic id/i), { target: { value: '1' } });

  fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

  expect(global.fetch).toHaveBeenCalledTimes(1);
});