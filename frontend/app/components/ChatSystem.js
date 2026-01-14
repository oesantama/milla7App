'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Users, Search, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Sistema de chat interno
 * Comunicación en tiempo real entre usuarios
 */
export default function ChatSystem({ currentUserId }) {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Equipo Logística',
      type: 'group',
      unread: 2,
      lastMessage: 'Todo listo para la operación',
      timestamp: '10:30',
      avatar: '👥',
    },
    {
      id: 2,
      name: 'Juan Pérez',
      type: 'direct',
      unread: 0,
      lastMessage: 'Gracias por la actualización',
      timestamp: 'Ayer',
      avatar: 'JP',
    },
  ]);

  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const mockMessages = {
    1: [
      {
        id: 1,
        senderId: 2,
        senderName: 'María López',
        text: 'Buenos días equipo',
        timestamp: '2025-12-26 09:00',
        isOwn: false,
      },
      {
        id: 2,
        senderId: currentUserId,
        senderName: 'Tú',
        text: 'Buenos días!',
        timestamp: '2025-12-26 09:05',
        isOwn: true,
      },
      {
        id: 3,
        senderId: 3,
        senderName: 'Carlos Ruiz',
        text: 'Todo listo para la operación',
        timestamp: '2025-12-26 10:30',
        isOwn: false,
      },
    ],
  };

  useEffect(() => {
    if (activeConversation) {
      setMessages(mockMessages[activeConversation.id] || []);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: currentUserId,
      senderName: 'Tú',
      text: newMessage,
      timestamp: new Date().toLocaleString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    toast.success('Mensaje enviado');
    // TODO: Enviar al backend via WebSocket
  };

  return (
    <div className="chat-system">
      {/* Lista de conversaciones */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Mensajes</h3>
          <button className="btn-icon">
            <Search size={20} />
          </button>
        </div>

        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setActiveConversation(conv)}
            >
              <div className="conversation-avatar">{conv.avatar}</div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="conversation-name">{conv.name}</span>
                  <span className="conversation-time">{conv.timestamp}</span>
                </div>
                <div className="conversation-preview">
                  <span>{conv.lastMessage}</span>
                  {conv.unread > 0 && (
                    <span className="unread-badge">{conv.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="chat-main">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">{activeConversation.avatar}</div>
                <div>
                  <h3>{activeConversation.name}</h3>
                  <span className="chat-status">
                    {activeConversation.type === 'group' ? '5 miembros' : 'En línea'}
                  </span>
                </div>
              </div>
              <button className="btn-icon">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Mensajes */}
            <div className="chat-messages">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message ${msg.isOwn ? 'message-own' : 'message-other'}`}
                >
                  {!msg.isOwn && (
                    <div className="message-sender">{msg.senderName}</div>
                  )}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                  </div>
                  <div className="message-time">{msg.timestamp}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-container" onSubmit={handleSendMessage}>
              <button type="button" className="btn-icon">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="chat-input"
              />
              <button type="button" className="btn-icon">
                <Smile size={20} />
              </button>
              <button type="submit" className="btn-primary btn-sm">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <Users size={64} />
            <p>Selecciona una conversación para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
