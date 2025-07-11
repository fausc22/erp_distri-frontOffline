// pages/_app.jsx - Versión modificada con AppInitializer
import '../styles/globals.css';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast'; 
import { AuthProvider } from '../components/AuthProvider';
import DefaultLayout from '../components/DefaultLayout';
import AppInitializer from '../components/AppInitializer'; // ✅ NUEVO

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
          <div className="bg-secondary-light dark:bg-primary-dark transition duration-300">
            {getLayout(<Component {...pageProps} />)}
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#ef4444',
                    color: 'white',
                  },
                },
                // ✅ TOASTS ESPECÍFICOS PARA PWA
                loading: {
                  duration: 2000,
                  style: {
                    background: '#3b82f6',
                    color: 'white',
                  },
                },
              }}
            />
          </div>
        </AppInitializer>
      </AuthProvider>
    </AnimatePresence>
  );
}

export default MyApp;