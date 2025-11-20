import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './pages/header_log_reg.jsx';
import Footer from './pages/footer_log_reg.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import './App.css';

export default function App() {
  return (
    <div className="App">          {/* <-- adicionei esta div com className="App" */}
      <BrowserRouter>
        <Header />
        <main className="site-main">
          <div className="container-central">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}