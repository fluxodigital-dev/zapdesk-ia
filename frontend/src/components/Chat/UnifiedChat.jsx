useEffect(() => {
  // Conecta WebSocket
  socketRef.current = io(process.env.REACT_APP_API_URL);
  socketRef.current.emit('join', user.id);

  // Escuta novas mensagens
  socketRef.current.on('new:message', (data) => {
    setMessages(prev => {
      if (selectedChat?.contactId === data.contactId) {
        return [...prev, data];
      }
      return prev;
    });

    updateConversationList(data);
  });

  // Carrega conversas iniciais
  loadConversations();

  return () => socketRef.current.disconnect();
}, [user.id]); // ✅ CORRIGIDO (removido selectedChat)