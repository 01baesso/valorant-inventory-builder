import React from 'react';
import { Link } from 'react-router-dom';
import valorantLogo from '/images/logos/valorant-logo.png'; 
import '../styles/header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="left">
        <a href="https://playvalorant.com" target="_blank" rel="noreferrer">
          <img src={valorantLogo} alt="Valorant Logo"/>
        </a>
      </div>
      <div className="center">
        <h1>Valorant Inventory Builder</h1>
      </div>
      <div className="right">
        <select onChange={(e)=> window.open(e.target.value,'_blank')} placeholder='Comprar VP' defaultValue="Lojas Valorant Points">
          <option disabled value="Lojas Valorant Points">Lojas Valorant Points</option>
          <option value="https://bonoxs.com/br/Valorant?from=home_favorite">Bonoxs</option>
          <option value="https://www.reidoscoins.com.br/Valorant">Rei dos Coins</option>
          <option value="https://www.nuuvem.com/br-pt/item/valorant">Nuuvem</option>
        </select>
      </div>
    </header>
  );
}