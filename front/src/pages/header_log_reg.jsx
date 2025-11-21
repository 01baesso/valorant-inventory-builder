import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/valorant-logo.png'; 
import '../styles/head_foot.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="left">
        <a href="https://playvalorant.com" target="_blank" rel="noreferrer">
          <img src={logo} alt="Valorant" style={{height:40}}/>
        </a>
      </div>
      <div className="center">
        <h1>Valorant Inventory Builder</h1>
      </div>
      <div className="right">
        <select onChange={(e)=> window.open(e.target.value,'_blank')} placeholder='Comprar VP'>
          <option selected disabled>Lojas Valorant Points</option>
          <option value="https://bonoxs.com/br/Valorant?from=home_favorite">Bonoxs</option>
          <option value="https://www.reidoscoins.com.br/Valorant">Rei dos Coins</option>
          <option value="https://www.nuuvem.com/br-pt/item/valorant">Nuuvem</option>
        </select>
      </div>
    </header>
  );
}