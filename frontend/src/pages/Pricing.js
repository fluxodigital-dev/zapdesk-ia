import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: 'para sempre',
      features: [
        '50 mensagens/mês',
        '1 número WhatsApp',
        'Kanban básico',
        'Suporte por email'
      ],
      button: 'Começar Grátis',
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 'R$ 49,90',
      period: '/mês',
      features: [
        'Mensagens ilimitadas',
        'WhatsApp + Instagram',
        'Kanban completo',
        'IA integrada',
        'Automações',
        'Suporte WhatsApp'
      ],
      button: 'Assinar Agora',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 97,00',
      period: '/mês',
      features: [
        'Tudo do Starter',
        'Até 5 números',
        'IA ilimitada',
        'Relatórios avançados',
        'API access'
      ],
      button: 'Assinar Pro',
      popular: false
    },
    {
      id: 'lifetime',
      name: 'Vitalício',
      price: 'R$ 297,00',
      period: 'único',
      features: [
        'Tudo do Pro para sempre',
        'Atualizações vitalícias',
        '8 bônus exclusivos',
        'Grupo VIP',
        'Suporte 1:1'
      ],
      button: 'Comprar Vitalício',
      popular: false,
      badge: 'MAIS VENDIDO'
    }
  ];

  const handlePlan = (planId) => {
    if (planId === 'free') {
      navigate('/register?plan=free');
    } else {
      navigate('/register?plan=' + planId);
    }
  };

  return (
    <div className="pricing-container">
      <header className="pricing-header">
        <h1>🚀 ZapDesk IA</h1>
        <p>Atendimento inteligente com WhatsApp + Instagram</p>
      </header>

      <div className="pricing-grid">
        {plans.map(plan => (
          <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
            {plan.badge && <div className="plan-badge">{plan.badge}</div>}
            <h3>{plan.name}</h3>
            <div className="plan-price">
              <span className="price">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </div>
            <ul className="plan-features">
              {plan.features.map((feat, idx) => (
                <li key={idx}>✓ {feat}</li>
              ))}
            </ul>
            <button 
              className={`btn ${plan.popular ? 'btn-primary' : ''}`}
              onClick={() => handlePlan(plan.id)}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>🛡️ 7 dias de garantia incondicional</p>
        <p>Cancele quando quiser sem multa</p>
      </div>
    </div>
  );
};

export default Pricing;