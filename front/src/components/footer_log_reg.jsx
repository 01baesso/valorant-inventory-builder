import React from 'react';
import '../styles/footer.css';
import gitHubIcon from '/images/logos/github.webp';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <a className="download-btn" href="https://playvalorant.com" target="_blank" rel="noreferrer">Instalar Jogo</a>
      </div>
      <div>
        <a className="github-btn" href="https://github.com/01baesso/valorant-inventory-builder" target="_blank" rel="noreferrer">
          <img className='footer-github-logo' src={gitHubIcon} alt="GitHub Logo" />
        </a>
      </div>
    </footer>
  );
}