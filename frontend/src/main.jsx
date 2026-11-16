import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Styling imports
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/variables.css';
import './styles/custom.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
