import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from '/images/icons/user.webp';
import padlockIcon from '/images/icons/padlock.webp';
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

    try{
      const res = await fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password },),
        });

        const data = await res.json();

        if (res.ok) {
          if (data.access){
            localStorage.setItem('access', data.access);
          }
          localStorage.setItem('username', username);
          navigate('/inventory');
        } else{
          setError(data.error || data.message || "Erro");
        }
    } catch (err){
      console.error("Login fetch error", err);
      setError("Erro de conexão");
    }
  };

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

        <button className='form-button' type="submit">Entrar</button>

        <div className="signup-link">
          <p>Não tem uma conta? <Link to="/register">Registre</Link></p>
        </div>
      </form>
    </div>
  );
}