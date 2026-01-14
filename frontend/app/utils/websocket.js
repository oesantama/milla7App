/**
 * Cliente WebSocket mock para notificaciones y chat
 * Ready para integración con Django Channels
 */

class WebSocketClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.reconnectInterval = 5000;
    this.handlers = {};
  }

  connect() {
    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.emit('disconnected');
        this.reconnect();
      };
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
    }
  }

  reconnect() {
    setTimeout(() => {
      console.log('Intentando reconectar...');
      this.connect();
    }, this.reconnectInterval);
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    if (this.handlers[type]) {
      this.handlers[type].forEach(handler => handler(payload));
    }
  }

  on(eventType, handler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }

  emit(eventType, data) {
    if (this.handlers[eventType]) {
      this.handlers[eventType].forEach(handler => handler(data));
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket no conectado');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Hook para usar WebSocket
export function useWebSocket(url) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    wsRef.current = new WebSocketClient(url, token);
    
    wsRef.current.on('connected', () => setConnected(true));
    wsRef.current.on('disconnected', () => setConnected(false));
    
    wsRef.current.connect();

    return () => {
      wsRef.current?.disconnect();
    };
  }, [url]);

  return {
    connected,
    send: (type, payload) => wsRef.current?.send(type, payload),
    on: (type, handler) => wsRef.current?.on(type, handler),
  };
}

// Ejemplo de uso:
/*
const { connected, send, on } = useWebSocket('ws://localhost:8000/ws/notifications/');

useEffect(() => {
  on('notification', (data) => {
    console.log('Nueva notificación:', data);
    addNotification(data);
  });
  
  on('chat_message', (data) => {
    console.log('Nuevo mensaje:', data);
    addMessage(data);
  });
}, []);

// Enviar mensaje
send('chat_message', { room: 1, text: 'Hola!' });
*/

import { useState, useEffect, useRef } from 'react';

export default WebSocketClient;
