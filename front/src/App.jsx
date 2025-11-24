import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/header_log_reg.jsx';
import Footer from './components/footer_log_reg.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import InventoryBuilder from './pages/inventory_builder.jsx';

import bg from '/images/background/background.webp';
import invBg from'/images/background/inventory-background.webp';
import './App.css';

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <main className="site-main">
          <div className="container-central">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/inventory" element={<InventoryBuilder/>} />
            </Routes>
          </div>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}