import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import valorantLogo from '/images/logos/valorant-logo.png'; 
import logoutIcon from '/images/icons/logout.webp';

import '../styles/header.css';

export default function Header() {
  const [selectedStore, setSelectedStore] = useState('Lojas Valorant Points');

  const handleStoreChange = (e) => {
    const value = e.target.value;

    if (value !== "Lojas Valorant Points") {
      window.open(value, '_blank');
      setSelectedStore("Lojas Valorant Points");
    }
  }

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn('Logout request falhou', err);
    } finally {
      // limpar localStorage sempre
      localStorage.removeItem('username');
      localStorage.removeItem('access');
      navigate('/'); // redireciona ao login
    }
  };

  return (
    <header className="site-header">
      <div className="left">
        <a href="https://playvalorant.com" target="_blank" rel="noreferrer">
          <img className='left-valorant-logo' src={valorantLogo} alt="Valorant Logo"/>
        </a>
      </div>
      <div className="center">
        <h1>Valorant Inventory Builder</h1>
      </div>
      <div className="right">
        <select className='select-lojas-valorantpoints' value={selectedStore} onChange={handleStoreChange}>
          <option disabled value="Lojas Valorant Points">Lojas Valorant Points</option>
          <option value="https://bonoxs.com/br/Valorant?from=home_favorite">Bonoxs</option>
          <option value="https://www.reidoscoins.com.br/Valorant">Rei dos Coins</option>
          <option value="https://www.nuuvem.com/br-pt/item/valorant">Nuuvem</option>
        </select>

        <button className="logout-button" onClick={handleLogout}>Logout 
            <img src={logoutIcon} alt="Logout Icon" />
        </button>
      </div>
    </header>
  );
}