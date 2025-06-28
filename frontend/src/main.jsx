import React from 'react';
import ReactDOM from 'react-dom/client';
import { Flowbite } from 'flowbite-react';
import App from './App';
import './index.css';

// Configure axios defaults
import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Flowbite>
      <App />
    </Flowbite>
  </React.StrictMode>
);
