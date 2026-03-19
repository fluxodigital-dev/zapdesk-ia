import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './UnifiedChat.css';

const UnifiedChat = ({ user }) => {
  const socketRef = useRef();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Mover para Kanban (placeholder)
  const moveToKanban = (chat) => {
    console.log('Movendo para Kanban:', chat);
  };

  // Carregar conversas
  const loadConversations = async () => {
    try {
      const res = await fetch(`/api/conversations/${user.id}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    }
  };

  // Atualizar lista de conversas
  const updateConversationList = (message) => {
    setConversations(prev => {
      const existing = prev.find(c => c.contactId === message.contactId);

      if (existing) {
        return prev.map(c =>
          c.contactId === message.contactId
            ? { ...c, lastMessage: message.content }
            : c
        );
      }

      return [
        {
          contactId: message.contactId,
          name: message.contactName,
          platform: message.platform,
          lastMessage: message.content,
        },
        ...prev
      ];
    });
  };

  // useEffect LIMPO (sem warning)
  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io(process.env.REACT_APP_API_URL);

    socketRef.current.emit('join', user.id);

    socketRef.current.on('new:message', (data) => {
      if (selectedChat?.contactId === data.contactId) {
        setMessages(prev => [...prev, data]);
      }
      updateConversationList(data);
    });

    loadConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.id]); // ✅ corrigido

  // Selecionar conversa
  const selectConversation = async (conv) => {
    setSelectedChat(conv);

    try {
      const res = await fetch(`/api/messages/${user.id}/${conv.contactId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;

    try {
      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          to: selectedChat.contactId,
          content: inputText,
        }),
      });

      setInputText('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  return (
    <div className="unified-chat">
      
      {/* SIDEBAR */}
      <div className="chat-sidebar">
        {conversations.map(conv => (
          <div
            key={conv.contactId}
            className={`conversation-item ${
              selectedChat?.contactId === conv.contactId ? 'active' : ''
            }`}
            onClick={() => selectConversation(conv)}
          >
            <strong>{conv.name}</strong>
            <p>{conv.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h3>{selectedChat.name}</h3>

              <button onClick={() => moveToKanban(selectedChat)}>
                📋 Mover para Kanban
              </button>
            </div>

            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg.messageId} className="message">
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua mensagem..."
              />

              <button onClick={sendMessage}>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <p>Selecione uma conversa</p>
        )}
      </div>
    </div>
  );
};

export default UnifiedChat;