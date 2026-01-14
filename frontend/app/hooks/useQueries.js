'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

/**
 * Hook para obtener el listado de usuarios con React Query
 */
export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/api/users/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener el listado de clientes
 */
export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      console.log('Fetching clientes from /api/core/clientes/');
      const response = await api.get('/api/core/clientes/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener el perfil del usuario (incluye operaciones asignadas)
 */
export function useProfile(token) {
  return useQuery({
    queryKey: ['profile', token],
    queryFn: async () => {
      const response = await api.get('/api/users/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token, // Solo ejecutar si hay token
    staleTime: 3 * 60 * 1000,
  });
}

export function useConductores() {
    return useQuery({
        queryKey: ['conductores'],
        queryFn: async () => {
             const response = await api.get('/api/core/conductores/');
             return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useVehiculos() {
    return useQuery({
         queryKey: ['vehiculos'],
         queryFn: async () => {
             const response = await api.get('/api/core/vehiculos/');
             return response.data;
         },
         staleTime: 5 * 60 * 1000,
    });
}

// Suponiendo que 'operations' se mapea a delivery-plans o similar
export function useOperaciones() {
    return useQuery({
        queryKey: ['operaciones'],
        queryFn: async () => {
            // Nota: Usar el endpoint que retorna la lista general, ajusta según backend
            const response = await api.get('/api/operations/delivery-plans/'); 
            return response.data.results || response.data; 
        },
        staleTime: 5 * 60 * 1000, 
    });
}
