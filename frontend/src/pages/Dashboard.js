import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    totalLeads: 0,
    aiRequests: 0
  });

  const [connections, setConnections] = useState({
    whatsapp: false,
    instagram: false
  });

  const [showQR, setShowQR] = useState(false);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">🚀 ZapDesk</div>
        <nav>
          <Link to="/dashboard" className="nav-item active">📊 Dashboard</Link>
          <Link to="/chat" className="nav-item">💬 Chat</Link>
          <Link to="/kanban" className="nav-item">📋 Kanban</Link>
          <Link to="/settings" className="nav-item">⚙️ Configurações</Link>
        </nav>
        <div className="user-info">
          <p>{user?.name}</p>
          <small>{user?.plan?.toUpperCase()}</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Bem-vindo de volta, {user?.name}!</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>{stats.totalConversations}</h3>
              <p>Conversas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-info">
              <h3>{stats.unreadMessages}</h3>
              <p>Não lidas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalLeads}</h3>
              <p>Leads</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <h3>{stats.aiRequests}</h3>
              <p>Usos de IA</p>
            </div>
          </div>
        </div>

        <div className="connections-section">
          <h2>🔗 Conectar Contas</h2>
          
          <div className="connection-cards">
            <div className={`connection-card ${connections.whatsapp ? 'connected' : ''}`}>
              <div className="connection-icon">📱</div>
              <h3>WhatsApp</h3>
              <p>{connections.whatsapp ? 'Conectado' : 'Não conectado'}</p>
              {!connections.whatsapp && (
                <button className="btn btn-success" onClick={() => setShowQR(true)}>
                  Conectar QR Code
                </button>
              )}
            </div>

            <div className={`connection-card ${connections.instagram ? 'connected' : ''}`}>
              <div className="connection-icon">📸</div>
              <h3>Instagram</h3>
              <p>{connections.instagram ? 'Conectado' : 'Não conectado'}</p>
              {!connections.instagram && (
                <button className="btn btn-primary">
                  Login Instagram
                </button>
              )}
            </div>
          </div>
        </div>

        {showQR && (
          <div className="modal-overlay" onClick={() => setShowQR(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>📱 Conectar WhatsApp</h3>
              <p>Escaneie o QR Code com seu WhatsApp:</p>
              <div className="qr-placeholder">
                <div className="qr-code">
                  [QR CODE APARECERÁ AQUI]
                </div>
              </div>
              <button className="btn" onClick={() => setShowQR(false)}>Fechar</button>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h2>⚡ Ações Rápidas</h2>
          <div className="actions-grid">
            <Link to="/chat" className="action-card">
              <span>💬</span>
              <p>Ver Conversas</p>
            </Link>
            <Link to="/kanban" className="action-card">
              <span>📋</span>
              <p>Gerenciar Leads</p>
            </Link>
            <Link to="/settings" className="action-card">
              <span>⚙️</span>
              <p>Configurar Automações</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;