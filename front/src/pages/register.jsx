import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userIcon from '../assets/user.webp';
import padlockIcon from '../assets/padlock.webp';
import '../styles/login.css';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 dígitos.");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Cadastro realizado com sucesso! Volte ao login.');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(data.message || 'Erro ao cadastrar');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Registre-se</h1>
        {error && <p className="error-message">{error}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}

        <div className="inputs">
          <img src={userIcon} alt="User Icon" className="icon"/>
          <input type="text" placeholder="Nome de Usuário" onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div className="inputs">
          <img src={userIcon} alt="Email Icon" className="icon"/>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className="inputs">
          <img src={padlockIcon} alt="Padlock Icon" className="icon"/>
          <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)}/>
        </div>

        <button>Cadastrar</button>
        <div className="signup-link">
          <p>Já tem conta? <button type="button" onClick={() => navigate('/')}>Voltar ao Login</button></p>
        </div>
      </form>
    </div>
  );
}

export default Register;
