import userIcon from '../assets/user.webp';
import padlockIcon from '../assets/padlock.webp';

import '../styles/login.css';
import { useState } from 'react';

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
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

        console.log("Envio correto");
    }

  return (
    <div className="container">
        <form onSubmit={handleSubmit}>
            <h1>Acesse o Inventário</h1>

            {error && <p className="error-message">{error}</p>}

            
            <div className="inputs">
                <img src={userIcon} alt="User Icon" className="icon"/>
                <input type="text" placeholder="Nome de Usuário" onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div className="inputs">
                <img src={padlockIcon} alt="User Icon" className="icon"/>
                <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)}/>
            </div>

            <button>Entrar</button>

            <div className="signup-link">
                <p>Não tem uma conta? <a href="">Registre</a></p>
            </div>
        </form>
    </div>
  )
}

export default Login;