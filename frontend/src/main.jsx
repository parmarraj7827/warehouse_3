import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// ==========================================
// ENTRY POINT
// This is the very first file that runs in your React app.
// It grabs the HTML element with id="root" and injects our React code into it.
// ==========================================

ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode helps find potential bugs during development
  <React.StrictMode>
    {/* BrowserRouter enables routing (changing pages without reloading the browser) */}
    <BrowserRouter>
      {/* AuthProvider gives the whole app access to the logged-in user's data */}
      <AuthProvider>
        {/* App is our main application component containing all the routes */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
