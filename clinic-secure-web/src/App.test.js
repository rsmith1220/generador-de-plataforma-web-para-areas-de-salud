import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza la app sin errores y muestra el formulario de login', () => {
  render(<App />);

  const titulo = screen.getByText(/inicia sesión/i);
  expect(titulo).toBeInTheDocument();
});