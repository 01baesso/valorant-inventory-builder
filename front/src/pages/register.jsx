import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import userIcon from '/images/icons/user.webp';
import padlockIcon from '/images/icons/padlock.webp';
import mailIcon from '/images/icons/email.webp';
import '../styles/form.css';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 dígitos.");
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setError("As senhas devem ser iguais.");
      return;
    }
    
    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok && (data.success || data.status || data.message)) {
        setSuccessMsg('Cadastro realizado com sucesso! Voltando ao login...');
        setTimeout(() => navigate('/'), 1300);
      } else {
        setError(data.error || data.message || 'Erro ao cadastrar');
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
          <input type="text" placeholder="Nome de Usuário" value={username}
                 onChange={(e) => setUsername(e.target.value)}/>
        </div>

        <div className="inputs">
          <img src={mailIcon} alt="Email Icon" className="icon"/>
          <input type="email" placeholder="Email" value={email}
                 onChange={(e) => setEmail(e.target.value)}/>
        </div>

        <div className="inputs">
          <img src={padlockIcon} alt="Padlock Icon" className="icon"/>
          <input type="password" placeholder="Senha" value={password}
                 onChange={(e) => setPassword(e.target.value)}/>
        </div>
        
        <div className="inputs">
          <img src={padlockIcon} alt="Padlock Icon" className="icon"/>
          <input type="password" placeholder="Confirme sua Senha" value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}/>
        </div>

        <button className='form-button' type="submit">Cadastrar</button>

        <div className="signup-link" style={{marginTop:12}}>
          <p>Já tem uma conta? <Link to="/">Faça o Login</Link></p>
        </div>
      </form>
    </div>
  );
}
