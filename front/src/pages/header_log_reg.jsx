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
        <select onChange={(e)=> window.open(e.target.value,'_blank')} aria-placeholder='Comprar VP'>
          <option>Comprar VP...</option>
          <option value="https://store.riotgames.com">Riot Store</option>
          <option value="https://www.razer.com">Razer</option>
          <option value="https://www.some-shop.com">Site X</option>
        </select>
      </div>
    </header>
  );
}