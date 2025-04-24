import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renderiza la app sin errores y muestra algo de la UI', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  const texto = screen.getByText(/login|dashboard|pacientes/i);
  expect(texto).toBeInTheDocument();
});
