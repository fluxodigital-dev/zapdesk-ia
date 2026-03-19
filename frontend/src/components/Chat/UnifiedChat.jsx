import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './UnifiedChat.css';

const UnifiedChat = ({ user }) => {
  const socketRef = useRef();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showVarinha, setShowVarinha] = useState(false);
  const [varinhaText, setVarinhaText] = useState('');

  // ✅ Função Kanban
  const moveToKanban = (chat) => {
    console.log('Movendo para Kanban:', chat);
  };

  // ✅ Carregar conversas
  const loadConversations = async () => {
    try {
      const res = await fetch(`/api/conversations/${user.id}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    }
  };

  // ✅ Atualizar lista
  const updateConversationList = (message) => {
    setConversations(prev => {
      const existing = prev.find(c => c.contactId === message.contactId);

      if (existing) {
        return prev.map(c =>
          c.contactId === message.contactId
            ? { ...c, lastMessage: message.content, unread: (c.unread || 0) + 1 }
            : c
        );
      }

      return [
        {
          contactId: message.contactId,
          name: message.contactName,
          platform: message.platform,
          lastMessage: message.content,
          unread: 1,
          avatar: message.profilePic
        },
        ...prev
      ];
    });
  };

  // ✅ useEffect CORRIGIDO
  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io(process.env.REACT_APP_API_URL);
    socketRef.current.emit('join', user.id);

    socketRef.current.on('new:message', (data) => {
      setMessages(prev => {
        if (selectedChat?.contactId === data.contactId) {
          return [...prev, data];
        }
        return prev;
      });

      updateConversationList(data);
    });

    loadConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user.id]); // ✅ corrigido

  // ✅ Selecionar conversa
  const selectConversation = async (conv) => {
    setSelectedChat(conv);

    try {
      const res = await fetch(`/api/messages/${user.id}/${conv.contactId}`);
      const data = await res.json();
      setMessages(data);
      generateAiSuggestions(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  // ✅ IA sugestões
  const generateAiSuggestions = async (chatHistory) => {
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory, niche: user.niche })
      });

      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Erro IA sugestões:', err);
    }
  };

  // ✅ Enviar mensagem
  const sendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;

    try {
      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          platform: selectedChat.platform,
          to: selectedChat.contactId,
          content: inputText,
          humanize: true
        })
      });

      setInputText('');
      setAiSuggestions([]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  // ✅ IA resposta
  const aiReply = async () => {
    try {
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
    } catch (err) {
      console.error('Erro IA reply:', err);
    }
  };

  return (
    <div className="unified-chat">
      <div className="chat-sidebar">
        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.contactId}
              className={`conversation-item ${selectedChat?.contactId === conv.contactId ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <span>{conv.name}</span>
              <p>{conv.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h3>{selectedChat.name}</h3>
              <button onClick={() => moveToKanban(selectedChat)}>Mover para Kanban</button>
              <button onClick={aiReply}>IA Responder</button>
            </div>

            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg.messageId}>
                  {msg.content}
                </div>
              ))}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button onClick={sendMessage}>Enviar</button>
          </>
        ) : (
          <p>Selecione uma conversa</p>
        )}
      </div>
    </div>
  );
};

export default UnifiedChat;