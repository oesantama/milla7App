'use client';

import { useState } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Sistema de comentarios con soporte para menciones
 * Componente completo con input y lista
 */
export default function CommentSystem({ entityId, entityType = 'operacion' }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: { name: 'Juan Pérez', avatar: 'JP' },
      text: 'Operación iniciada correctamente',
      timestamp: '2025-12-26 10:30',
      mentions: [],
    },
    {
      id: 2,
      author: { name: 'María López', avatar: 'ML' },
      text: '@Juan Pérez todo listo para continuar',
      timestamp: '2025-12-26 11:15',
      mentions: ['Juan Pérez'],
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);
    
    const comment = {
      id: Date.now(),
      author: { name: 'Usuario Actual', avatar: 'UC' },
      text: newComment,
      timestamp: new Date().toLocaleString('es-ES'),
      mentions,
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('Comentario agregado');
    
    // TODO: Enviar al backend
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+\s?\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  return (
    <div className="comment-system">
      <div className="comment-header">
        <MessageCircle size={20} />
        <h3>Comentarios ({comments.length})</h3>
      </div>

      {/* Lista de comentarios */}
      <div className="comment-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar">{comment.author.avatar}</div>
            <div className="comment-content">
              <div className="comment-meta">
                <strong>{comment.author.name}</strong>
                <span className="comment-time">{comment.timestamp}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input de nuevo comentario */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-wrapper">
          <User size={18} className="comment-input-icon" />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario... (usa @ para mencionar)"
            rows="3"
          />
        </div>
        <button type="submit" className="btn-primary btn-comment-submit">
          <Send size={18} />
          Publicar
        </button>
      </form>
    </div>
  );
}
