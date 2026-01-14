'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

/**
 * Esquema de validación para login
 */
export const loginSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

/**
 * Hook de ejemplo para usar react-hook-form
 */
export function useLoginForm() {
  return useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
}

/**
 * Componente FormField reutilizable
 */
export function FormField({ label, error, children }) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  );
}
