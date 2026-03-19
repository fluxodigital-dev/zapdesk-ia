import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './UnifiedChat.css';

const UnifiedChat = ({ user }) => {
  const socketRef = useRef();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const moveToKanban = (chat) => {
    console.log('Movendo para Kanban:', chat);
  };

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(process.env.REACT_APP_API_URL);
    socketRef.current = socket;

    socket.emit('join', user.id);

    socket.on('new:message', (data) => {
      setMessages(prev => {
        if (selectedChat?.contactId === data.contactId) {
          return [...prev, data];
        }
        return prev;
      });

      setConversations(prev => {
        const existing = prev.find(c => c.contactId === data.contactId);

        if (existing) {
          return prev.map(c =>
            c.contactId === data.contactId
              ? { ...c, lastMessage: data.content }
              : c
          );
        }

        return [
          {
            contactId: data.contactId,
            name: data.contactName,
            platform: data.platform,
            lastMessage: data.content,
          },
          ...prev
        ];
      });
    });

    // carregar conversas
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/conversations/${user.id}`);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchConversations();

    return () => socket.disconnect();
  }, [user?.id, selectedChat?.contactId]);

  const selectConversation = async (conv) => {
    setSelectedChat(conv);

    try {
      const res = await fetch(`/api/messages/${user.id}/${conv.contactId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  return (
    <div className="unified-chat">
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
              <button onClick={sendMessage}>Enviar</button>
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