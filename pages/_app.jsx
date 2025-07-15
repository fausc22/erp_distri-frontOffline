// pages/_app.jsx - Versión actualizada con todos los nuevos componentes
import '../styles/globals.css';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast'; 
import { AuthProvider } from '../components/AuthProvider';
import DefaultLayout from '../components/DefaultLayout';
import AppInitializer from '../components/AppInitializer';
import OfflineGuard from '../components/OfflineGuard';

function MyApp({ Component, pageProps }) {
  // Permite que cada página defina su propio layout (o ninguno)
  const getLayout = Component.getLayout || ((page) => (
    <DefaultLayout>{page}</DefaultLayout>
  ));

  return (
    <AnimatePresence>
      <AuthProvider>
        {/* ✅ WRAPPER DE INICIALIZACIÓN */}
        <AppInitializer>
          {/* ✅ PROTECCIÓN OFFLINE */}
          <OfflineGuard>
            <div className="bg-secondary-light dark:bg-primary-dark transition duration-300">
              {getLayout(<Component {...pageProps} />)}
              
              {/* ✅ TOASTER MEJORADO PARA PWA */}
              <Toaster
                position="top-right"
                containerStyle={{
                  top: 20,
                  right: 20,
                  zIndex: 9999,
                }}
                toastOptions={{
                  duration: 4000,
                  className: 'pwa-toast',
                  style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                      color: 'white',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#10b981',
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                      color: 'white',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#ef4444',
                    },
                  },
                  loading: {
                    duration: 2000,
                    style: {
                      background: '#3b82f6',
                      color: 'white',
                    },
                  },
                  custom: {
                    duration: 4000,
                  },
                  ariaProps: {
                    role: 'status',
                    'aria-live': 'polite',
                  },
                }}
              />
            </div>
          </OfflineGuard>
        </AppInitializer>
      </AuthProvider>
    </AnimatePresence>
  );
}

export default MyApp;