import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renderiza la app sin errores y muestra el formulario de login', () => {
  render(<App />);

  const titulo = screen.getByText(/inicia sesión/i);
  expect(titulo).toBeInTheDocument();
});

test('navega al registro', () => {
  window.history.pushState({}, 'Registro', '/register');
  render(<App />);
  const titulo = screen.getByText(/regístrate/i);
  expect(titulo).toBeInTheDocument();
});

test('redirige a login para rutas no existentes', () => {
  window.history.pushState({}, 'No existe', '/ruta-no-existe');
  render(<App />);
  const titulo = screen.getByText(/inicia sesión/i);
  expect(titulo).toBeInTheDocument();
});