import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; // Archivo generado por `amplify push`
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


try {
  Amplify.configure(awsExports);
  console.log("Amplify configurado correctamente");
} catch (error) {
  console.error("Error configurando Amplify:", error);
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
