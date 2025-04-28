import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Login from './Login';

describe('Login Component', () => {
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

  test('permite escribir en los campos', () => {
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={() => {}} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'test@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'password123' } });

    expect(screen.getByPlaceholderText(/correo/i)).toHaveValue('test@mail.com');
    expect(screen.getByPlaceholderText(/contraseña/i)).toHaveValue('password123');
  });

  test('envía el formulario y guarda datos', async () => {
    const mockSetIsAuthenticated = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '123', clinica_id: '456' }),
      })
    );

    Storage.prototype.setItem = jest.fn();

    render(
      <MemoryRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'test@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('usuario_id', '123');
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('clinica_id', '456');
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
  });
});

test('muestra error si falla login', async () => {
  const mockSetIsAuthenticated = jest.fn();
  global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

  render(
    <MemoryRouter>
      <Login setIsAuthenticated={mockSetIsAuthenticated} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/correo/i), { target: { value: 'fallo@mail.com' } });
  fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: 'wrongpass' } });

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
  });

  expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
});