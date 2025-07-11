// pages/edicion/Empleados.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import CRUDMaestro from '../../components/CRUD/CRUDMaestro';
import { empleadosConfig } from '../../config/entitiesConfig';

export default function Empleados() {
  const { user, loading: authLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Verificar que el usuario esté autenticado y sea gerente
    if (!authLoading) {
      if (!user) {
        toast.error('Debe iniciar sesión para acceder');
        return;
      }

      if (user.rol !== 'GERENTE') {
        toast.error('Solo los gerentes pueden gestionar empleados');
        window.history.back(); // Volver a la página anterior
        return;
      }

      setAuthorized(true);
    }
  }, [user, authLoading]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading || !authorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Head>
          <title>VERTIMAR | VERIFICANDO PERMISOS</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <span className="mt-3 block text-gray-600">Verificando permisos...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>VERTIMAR | GESTIÓN DE EMPLEADOS</title>
        <meta name="description" content="Gestión de empleados y usuarios del sistema VERTIMAR" />
      </Head>
      
      <CRUDMaestro config={empleadosConfig} />
    </>
  );
}