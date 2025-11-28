import React from 'react';
import { BrowserRouter, Routes, Route, useLoaderData, useLocation } from 'react-router-dom';

// import ProtectedRoute from './components/ProtectedRoute.jsx';

import Header from './components/header_log_reg.jsx';
import HeaderInventory from './components/header_inventory.jsx';
import Footer from './components/footer_log_reg.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import InventoryBuilder from './pages/inventory_builder.jsx';

import './App.css';

const HeaderSwitcher = () => {
  const location = useLocation();
  if (location.pathname === '/inventory') {
    return <HeaderInventory />;
  } else {
    return <Header />;
  }
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <HeaderSwitcher />
        <main className="site-main">
          <div className="container-central">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/inventory" element={
                // <ProtectedRoute>
                  <InventoryBuilder />
                /* </ProtectedRoute> */
              } />
            </Routes>
          </div>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}