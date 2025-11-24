import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from '../../public/icons/user.webp';
import padlockIcon from '../../public/icons/padlock.webp';
import '../styles/form.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 dígitos.");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // IMPORTANTE: Salvar username no localStorage para uso no InventoryBuilder
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email); // Opcional
        
        // Redirecionar para o inventário
        navigate('/inventory'); // Ajuste a rota conforme seu App.jsx
      } else {
        if (data.message && (data.message.toLowerCase().includes('não encontrado') || data.message.toLowerCase().includes('credenciais'))) {
          setError(data.message);
        } else {
          setError(data.message || 'Erro no login');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor');
    }
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Acesse o Inventário</h1>

        {error && <p className="error-message">{error}</p>}

        <div className="inputs">
          <img src={userIcon} alt="User Icon" className="icon"/>
          <input type="text" placeholder="Nome de Usuário" value={username}
                 onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div className="inputs">
          <img src={padlockIcon} alt="Padlock Icon" className="icon"/>
          <input type="password" placeholder="Senha" value={password}
                 onChange={(e) => setPassword(e.target.value)}/>
        </div>

        <button type="submit">Entrar</button>

        <div className="signup-link">
          <p>Não tem uma conta? <Link to="/register">Registre</Link></p>
        </div>
      </form>
    </div>
  );
}