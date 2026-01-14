/**
 * Utilidad para lazy loading de componentes
 * Mejora el performance inicial
 */
import dynamic from 'next/dynamic';

// Lazy load de componentes pesados
export const LazyAdminDashboard = dynamic(
  () => import('../components/AdminDashboard'),
  {
    loading: () => <div className="lazy-loading">Cargando dashboard...</div>,
    ssr: false,
  }
);

export const LazySupervisorDashboard = dynamic(
  () => import('../components/SupervisorDashboard'),
  {
    loading: () => <div className="lazy-loading">Cargando dashboard...</div>,
    ssr: false,
  }
);

export const LazyOperatorDashboard = dynamic(
  () => import('../components/OperatorDashboard'),
  {
    loading: () => <div className="lazy-loading">Cargando dashboard...</div>,
    ssr: false,
  }
);

export const LazyFileUpload = dynamic(
  () => import('../components/FileUpload'),
  {
    loading: () => <div className="lazy-loading">Cargando...</div>,
  }
);

export const LazyChangeTimeline = dynamic(
  () => import('../components/ChangeTimeline'),
  {
    loading: () => <div className="lazy-loading">Cargando timeline...</div>,
  }
);

export const LazyCommentSystem = dynamic(
  () => import('../components/CommentSystem'),
  {
    loading: () => <div className="lazy-loading">Cargando comentarios...</div>,
  }
);

// Preload de componentes críticos
export const preloadDashboard = (role) => {
  if (role === 'admin') {
    LazyAdminDashboard.preload();
  } else if (role === 'supervisor') {
    LazySupervisorDashboard.preload();
  } else {
    LazyOperatorDashboard.preload();
  }
};
