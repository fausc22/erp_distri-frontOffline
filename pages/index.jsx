// pages/index.js (pantalla de inicio)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        const token = localStorage.getItem('token');
        const empleado = localStorage.getItem('empleado');
        
        if (token && empleado) {
          // Usuario ya logueado - redirigir a inicio
          router.replace('/inicio');
        } else {
          // No logueado - limpiar cualquier dato corrupto y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('empleado');
          router.replace('/login');
        }
      } catch (error) {
        // Error accediendo al localStorage - redirigir al login
        console.error('Error accediendo al localStorage:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>VERTIMAR | Cargando...</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return null; // No renderizar nada después del redirect
}