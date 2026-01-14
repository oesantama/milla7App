// ruta: frontend/app/components/UserMenu.js
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    setIsOpen(false); // Close menu before logging out
    logout();
  };

  // Milla 7 corporate colors
  const primaryBlue = '#0056b3';
  const secondaryGreen = '#4CAF50';
  const darkGrey = '#34495e';

  return (
    <div className="user-menu" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="btn">
        <div className="user-avatar">
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <span style={{ marginLeft: '8px' }}>{user?.username}</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <p style={{ margin: 0, fontWeight: 'bold' }}>{user?.username}</p>
            <p
              style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}
            >
              Rol: {user?.role_name || 'Sin rol'}
            </p>
          </div>
          <Link href="/profile">Mi Perfil</Link>
          <button onClick={handleLogout} style={{ color: '#e74c3c' }}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
