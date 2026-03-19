import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import './Auth.css';

const Register = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.name && form.email && form.password) {
      // Se for plano pago, redireciona para pagamento
      if (plan !== 'free') {
        alert(`Redirecionando para pagamento do plano ${plan.toUpperCase()}...`);
        // Aqui integra com Stripe depois
      }
      
      setUser({ email: form.email, name: form.name, plan });
      navigate('/dashboard');
    } else {
      setError('Preencha todos os campos obrigatórios');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🚀 Criar Conta</h2>
        <div className="plan-info">
          Plano selecionado: <strong>{plan.toUpperCase()}</strong>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome completo *</label>
            <input 
              type="text" 
              className="input"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Seu nome"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              className="input"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              placeholder="seu@email.com"
            />
          </div>
          <div className="form-group">
            <label>Senha *</label>
            <input 
              type="password" 
              className="input"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="form-group">
            <label>Nome da empresa</label>
            <input 
              type="text" 
              className="input"
              value={form.company}
              onChange={(e) => setForm({...form, company: e.target.value})}
              placeholder="Sua empresa"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            {plan === 'free' ? 'Criar Conta Grátis' : 'Continuar para Pagamento'}
          </button>
        </form>
        <p className="auth-link">
          Já tem conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;