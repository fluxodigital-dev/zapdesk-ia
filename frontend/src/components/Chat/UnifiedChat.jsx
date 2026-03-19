 // frontend/src/components/Chat/UnifiedChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './UnifiedChat.css';

const UnifiedChat = ({ user }) => {
const moveToKanban = (chat) => {
  console.log('Movendo para Kanban:', chat);

  // exemplo futuro (opcional)
  // fetch('/api/move-to-kanban', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ chat })
  // });
};
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showVarinha, setShowVarinha] = useState(false);
  const [varinhaText, setVarinhaText] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    // Conecta WebSocket
    socketRef.current = io(process.env.REACT_APP_API_URL);
    socketRef.current.emit('join', user.id);

    // Escuta novas mensagens
    socketRef.current.on('new:message', (data) => {
      if (selectedChat?.contactId === data.contactId) {
        setMessages(prev => [...prev, data]);
      }
      updateConversationList(data);
    });

    // Carrega conversas iniciais
    loadConversations();

    return () => socketRef.current.disconnect();
  }, [user.id, selectedChat]);

  const loadConversations = async () => {
    const res = await fetch(`/api/conversations/${user.id}`);
    const data = await res.json();
    setConversations(data);
  };

  const updateConversationList = (message) => {
    setConversations(prev => {
      const existing = prev.find(c => c.contactId === message.contactId);
      if (existing) {
        return prev.map(c => c.contactId === message.contactId 
          ? { ...c, lastMessage: message.content, unread: c.unread + 1 }
          : c
        );
      }
      return [{
        contactId: message.contactId,
        name: message.contactName,
        platform: message.platform,
        lastMessage: message.content,
        unread: 1,
        avatar: message.profilePic
      }, ...prev];
    });
  };

  const selectConversation = async (conv) => {
    setSelectedChat(conv);
    const res = await fetch(`/api/messages/${user.id}/${conv.contactId}`);
    const data = await res.json();
    setMessages(data);
    
    // Gera sugestões de IA baseadas no contexto
    generateAiSuggestions(data);
  };

  const generateAiSuggestions = async (chatHistory) => {
    const res = await fetch('/api/ai/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: chatHistory, niche: user.niche })
    });
    const data = await res.json();
    setAiSuggestions(data.suggestions);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;

    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        platform: selectedChat.platform,
        to: selectedChat.contactId,
        content: inputText,
        humanize: true // Ativa anti-ban
      })
    });

    setInputText('');
    setAiSuggestions([]);
  };

  // VARINHA MÁGICA - Transforma texto com IA
  const useVarinhaMagica = async () => {
    if (!inputText.trim()) return;
    
    const res = await fetch('/api/ai/varinha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: inputText, 
        style: 'persuasive',
        niche: user.niche 
      })
    });
    
    const data = await res.json();
    setVarinhaText(data.transformed);
    setShowVarinha(true);
  };

  // CORREÇÃO DE TEXTO
  const correctText = async () => {
    const res = await fetch('/api/ai/correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    });
    
    const data = await res.json();
    setInputText(data.corrected);
  };

  // IA Responde automaticamente
  const aiReply = async () => {
    const res = await fetch('/api/ai/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        history: messages,
        niche: user.niche,
        tone: 'friendly'
      })
    });
    
    const data = await res.json();
    setInputText(data.reply);
  };

  return (
    <div className="unified-chat">
      {/* Sidebar - Lista de Conversas */}
      <div className="chat-sidebar">
        <div className="chat-filters">
          <button className="filter-btn active">Todas</button>
          <button className="filter-btn">
            <span className="icon whatsapp">📱</span> WhatsApp
          </button>
          <button className="filter-btn">
            <span className="icon instagram">📸</span> Instagram
          </button>
        </div>
        
        <div className="conversations-list">
          {conversations.map(conv => (
            <div 
              key={conv.contactId}
              className={`conversation-item ${selectedChat?.contactId === conv.contactId ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <img src={conv.avatar || '/default-avatar.png'} alt="" className="avatar" />
              <div className="conv-info">
                <div className="conv-header">
                  <span className="name">{conv.name}</span>
                  <span className={`platform-badge ${conv.platform}`}>
                    {conv.platform === 'whatsapp' ? '📱' : '📸'}
                  </span>
                </div>
                <p className="last-message">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <img src={selectedChat.avatar} alt="" className="avatar" />
              <div className="chat-info">
                <h3>{selectedChat.name}</h3>
                <span className={`platform-tag ${selectedChat.platform}`}>
                  {selectedChat.platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                </span>
              </div>
              <div className="chat-actions">
                <button onClick={() => moveToKanban(selectedChat)}>📋 Mover para Kanban</button>
                <button onClick={aiReply}>🤖 IA Responder</button>
              </div>
            </div>

            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg.messageId} className={`message ${msg.direction}`}>
                  <div className="message-content">{msg.content}</div>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Sugestões de IA */}
            {aiSuggestions.length > 0 && (
              <div className="ai-suggestions">
                <span className="suggestion-label">💡 Sugestões da IA:</span>
                {aiSuggestions.map((sug, idx) => (
                  <button 
                    key={idx} 
                    className="suggestion-chip"
                    onClick={() => setInputText(sug.text)}
                  >
                    {sug.preview}
                  </button>
                ))}
              </div>
            )}

            {/* Área de Input */}
            <div className="chat-input-area">
              <div className="input-toolbar">
                <button onClick={correctText} title="Corrigir texto">✏️ Corrigir</button>
                <button onClick={useVarinhaMagica} title="Varinha Mágica">🪄 Varinha Mágica</button>
                <button title="Anexar">📎</button>
              </div>
              
              <div className="input-wrapper">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                />
                <button className="send-btn" onClick={sendMessage}>
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>

      {/* Modal Varinha Mágica */}
      {showVarinha && (
        <div className="varinha-modal">
          <h3>✨ Varinha Mágica</h3>
          <div className="varinha-original">
            <strong>Original:</strong>
            <p>{inputText}</p>
          </div>
          <div className="varinha-transformed">
            <strong>Transformado:</strong>
            <p>{varinhaText}</p>
          </div>
          <div className="varinha-actions">
            <button onClick={() => { setInputText(varinhaText); setShowVarinha(false); }}>
              Usar este texto
            </button>
            <button onClick={() => setShowVarinha(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedChat;