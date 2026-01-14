// frontend/app/hooks/useMenuData.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useMenuData() {
  const { user, token } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    async function fetchMenuData() {
      try {
        setLoading(true);
        const response = await fetch('/api/maestras/modulos/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch menu data');
        }

        const data = await response.json();
        setMenuData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error in fetchMenuData:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuData();
  }, [user, token]);

  return { menuData, loading, error };
}
