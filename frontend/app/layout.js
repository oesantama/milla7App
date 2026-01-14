// ruta: frontend/app/layout.js
import { AuthProvider } from './context/AuthContext';
import AppProviders from './providers/AppProviders';
import Layout from './components/Layout';
import ClientToaster from './components/ClientToaster';
import SessionTimeout from './components/SessionTimeout';
import './globals.css';
import './responsive-styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const metadata = {
  title: 'Milla 7 App',
  description: 'Sistema de gestión logística',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AppProviders>
          <AuthProvider>
            <Layout>{children}</Layout>
            <ClientToaster />
            <SessionTimeout />
          </AuthProvider>
        </AppProviders>
      </body>
    </html>
  );
}
