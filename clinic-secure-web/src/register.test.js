import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Register from './Register';

beforeAll(() => {
  window.alert = jest.fn();
  global.fetch = jest.fn(); // 🔥 Agregado para evitar el error de matcher
});

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

  test('no permite enviar formulario si faltan campos', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/nombre/i), { target: { value: 'Solo Nombre' } });
    // No llenamos los demás campos

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    });

    expect(window.alert).toHaveBeenCalledWith('Por favor llena todos los campos.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('envía el formulario', async () => {
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

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    });

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

  test('muestra alerta si faltan campos obligatorios', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // No llenamos ningún campo y tratamos de enviar
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    });

    expect(window.alert).toHaveBeenCalled();
  });

  test('muestra alerta si el correo no es válido', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'correo-no-valido' } }); // no es un correo válido
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/clinic id/i), { target: { value: '1' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));
    });

    expect(window.alert).toHaveBeenCalled();
  });
});

test('muestra error si falla registro', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Some error' }),
    })
  );

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