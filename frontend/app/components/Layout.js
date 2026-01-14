// ruta: frontend/app/components/Layout.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';
import LoadingScreen from './LoadingScreen';
import ResponsiveSidebar from './ResponsiveSidebar';
import MobileNavbar from './MobileNavbar';
import MobileMenu from './MobileMenu';
import Breadcrumbs from './Breadcrumbs';
import Header from './Header';
import LoadingBar from './LoadingBar';

export default function Layout({ children }) {
  const {
    user,
    isAuthenticated,
    initialLoadComplete,
    logoutLoading,
  } = useAuth();
  
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, isTablet, isDesktop } = useMediaQuery();

  // Estados para control de sidebar/menu
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // useEffect to handle side effects like routing
  useEffect(() => {
    if (!initialLoadComplete) {
      return;
    }

    const isLoginPage = pathname === '/';

    if (isAuthenticated && isLoginPage) {
      console.log('Layout: Authenticated, redirecting to /desktop...');
      router.push('/desktop');
    }

    if (!isAuthenticated && !isLoginPage) {
      console.log('Layout: Not authenticated, redirecting to login...');
      router.push('/');
    }
  }, [isAuthenticated, pathname, initialLoadComplete, router]);

  // Ensure we only run logic after mount to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading screen
  if (!initialLoadComplete || logoutLoading) {
    const message = logoutLoading ? 'Cerrando sesión...' : 'Verificando usuario...';
    return <LoadingScreen message={message} />;
  }

  // If authenticated and not on login page, show main app layout
  if (isAuthenticated && pathname !== '/') {
    return (
      <div className="app-layout">
        {/* Mobile Navbar (solo móvil) */}
        {isMobile && (
          <MobileNavbar 
            user={user}
            onMenuClick={() => setMobileMenuOpen(true)} 
          />
        )}

        {/* Mobile Menu Drawer (solo móvil) */}
        {isMobile && (
          <MobileMenu 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)} 
          />
        )}

        {/* Responsive Sidebar (tablet y desktop) */}
        {!isMobile && (
          <ResponsiveSidebar
            isDesktop={isDesktop}
            isTablet={isTablet}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Main Content */}
        <main id="main-content" className={isMobile ? 'app-main mobile' : 'app-main'} tabIndex="-1">
          <LoadingBar />
          {!isMobile && <Header />}
          <Breadcrumbs />
          {children}
        </main>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return <LoadingScreen message="Redirigiendo..." />;
}
