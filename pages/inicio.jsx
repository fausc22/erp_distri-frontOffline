// pages/inicio.jsx - Modificado para funcionar solo online
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import InstallButton from '../components/InstallButton';
import { useConnection } from '../utils/ConnectionManager';
import { getAppMode, offlineManager } from '../utils/offlineManager';
import { LinkGuard } from '../components/OfflineGuard';

export default function Inicio() {
  const router = useRouter();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalogStats, setCatalogStats] = useState(null);
  
  // ✅ CONNECTION MANAGER
  const { isOnline, eventType } = useConnection();
  const isPWA = getAppMode() === 'pwa';

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const empleadoData = localStorage.getItem('empleado');

        if (!token) {
          router.replace('/login');
          return;
        }

        if (empleadoData) {
          try {
            const parsedEmpleado = JSON.parse(empleadoData);
            setEmpleado(parsedEmpleado);
          } catch (error) {
            console.error('Error parsing empleado data:', error);
            setEmpleado({
              nombre: 'Usuario',
              apellido: '',
              rol: localStorage.getItem('role') || 'EMPLEADO'
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast.error('Error verificando autenticación');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ✅ CARGAR ESTADÍSTICAS DEL CATÁLOGO OFFLINE
  useEffect(() => {
    if (isPWA) {
      const stats = offlineManager.getStorageStats();
      setCatalogStats(stats);
      
      console.log('📊 Estadísticas del catálogo offline:', stats);
    }
  }, [isPWA]);

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD SIMPLIFICADO
  useEffect(() => {
    if (!eventType) return;

    switch (eventType) {
      case 'connection_lost_redirect':
        // OfflineGuard se encarga de la redirección a /offline
        console.log('📴 Redirección a /offline manejada por OfflineGuard');
        break;
        
      case 'connection_restored_normal':
        // Notificación normal - no hacer nada especial
        console.log('🌐 Conexión restaurada en inicio');
        break;
        
      default:
        break;
    }
  }, [eventType]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleDescription = (rol) => {
    switch (rol) {
      case 'GERENTE':
        return 'Gerente - Acceso completo al sistema';
      case 'VENDEDOR':
        return 'Vendedor - Acceso a ventas e inventario';
      default:
        return 'Empleado';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Head>
        <title>VERTIMAR | INICIO</title>
      </Head>
      
      {/* ✅ HEADER NORMAL (ya no hay modo offline aquí) */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {getGreeting()}, {empleado?.nombre} {empleado?.apellido}
            </h1>
            <p className="text-blue-100">
              {getRoleDescription(empleado?.rol)}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 text-right">
            <InstallButton />
            <p className="text-blue-100 text-sm">
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ PANEL DE ACCESOS ONLINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ✅ VENTAS - SOLO ONLINE AHORA */}
        {(empleado?.rol === 'GERENTE' || empleado?.rol === 'VENDEDOR') && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ml-3">Ventas</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Gestión de notas de pedido y facturación
            </p>
            
            <div className="space-y-2">
              <LinkGuard href="/ventas/RegistrarPedido" className="block text-blue-600 hover:text-blue-800 text-sm">• Registrar Nota de Pedido</LinkGuard>
              <LinkGuard href="/ventas/HistorialPedidos" className="block text-blue-600 hover:text-blue-800 text-sm">• Historial de Pedidos</LinkGuard>
              {empleado?.rol === 'GERENTE' && (
                <>
                  <LinkGuard href="/ventas/ListaPrecios" className="block text-blue-600 hover:text-blue-800 text-sm">• Lista de Precios</LinkGuard>
                  <LinkGuard href="/ventas/Facturacion" className="block text-blue-600 hover:text-blue-800 text-sm">• Facturación</LinkGuard>
                </>
              )}
            </div>
          </div>
        )}

        {/* ✅ INVENTARIO - SOLO ONLINE */}
        {(empleado?.rol === 'GERENTE' || empleado?.rol === 'VENDEDOR') && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ml-3">Inventario</h3>
            </div>
            <p className="text-gray-600 mb-4">Control de stock y productos</p>
            <div className="space-y-2">
              {empleado?.rol === 'GERENTE' && (
                <>
                  <LinkGuard href="/inventario/Productos" className="block text-blue-600 hover:text-blue-800 text-sm">• Gestión de Productos</LinkGuard>
                  <LinkGuard href="/compras/RegistrarCompra" className="block text-blue-600 hover:text-blue-800 text-sm">• Compra Proveedores</LinkGuard>
                </>
              )}
              <LinkGuard href="/inventario/consultaStock" className="block text-blue-600 hover:text-blue-800 text-sm">• Consulta de Stock</LinkGuard>
              <LinkGuard href="/inventario/Remitos" className="block text-blue-600 hover:text-blue-800 text-sm">• Remitos</LinkGuard>
            </div>
          </div>
        )}

        {/* ✅ COMPRAS - SOLO ONLINE */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 ml-3">Compras</h3>
          </div>
          <p className="text-gray-600 mb-4">Gestión de compras y gastos</p>
          <div className="space-y-2">
            {empleado?.rol === 'GERENTE' && (
              <>
                <LinkGuard href="/compras/RegistrarCompra" className="block text-blue-600 hover:text-blue-800 text-sm">• Registrar Compra</LinkGuard>
                <LinkGuard href="/compras/HistorialCompras" className="block text-blue-600 hover:text-blue-800 text-sm">• Historial de Compras</LinkGuard>
              </>
            )}
            <LinkGuard href="/compras/RegistrarGasto" className="block text-blue-600 hover:text-blue-800 text-sm">• Registrar Gasto</LinkGuard>
          </div>
        </div>

        {/* ✅ ADMINISTRACIÓN - SOLO ONLINE GERENTES */}
        {empleado?.rol === 'GERENTE' && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ml-3">Administración</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestión y configuración del sistema</p>
            <div className="space-y-2">
              <LinkGuard href="/edicion/Empleados" className="block text-blue-600 hover:text-blue-800 text-sm">• Gestión de Empleados</LinkGuard>
              <LinkGuard href="/edicion/Clientes" className="block text-blue-600 hover:text-blue-800 text-sm">• Gestión de Clientes</LinkGuard>
              <LinkGuard href="/edicion/Proveedores" className="block text-blue-600 hover:text-blue-800 text-sm">• Gestión de Proveedores</LinkGuard>
              <LinkGuard href="/finanzas/fondos" className="block text-blue-600 hover:text-blue-800 text-sm">• Tesorería</LinkGuard>
              <LinkGuard href="/finanzas/reportes" className="block text-blue-600 hover:text-blue-800 text-sm">• Reportes Financieros</LinkGuard>
            </div>
          </div>
        )}

        {/* ✅ VENDEDOR ADMINISTRACIÓN - SOLO ONLINE */}
        {empleado?.rol === 'VENDEDOR' && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ml-3">Administración</h3>
            </div>
            <p className="text-gray-600 mb-4">Ingreso de Gastos y Edición de Clientes</p>
            <div className="space-y-2">
              <LinkGuard href="/compras/RegistrarGasto" className="block text-blue-600 hover:text-blue-800 text-sm">• Registrar Gasto</LinkGuard>
              <LinkGuard href="/edicion/Clientes" className="block text-blue-600 hover:text-blue-800 text-sm">• Gestión de Clientes</LinkGuard>
            </div>
          </div>
        )}

        {/* ✅ FINANZAS - SOLO ONLINE Y GERENTES */}
        {empleado?.rol === 'GERENTE' && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ml-3">Finanzas</h3>
            </div>
            <p className="text-gray-600 mb-4">Control financiero y reportes</p>
            <div className="space-y-2">
              <LinkGuard href="/finanzas/fondos" className="block text-blue-600 hover:text-blue-800 text-sm">• Fondos</LinkGuard>
              <LinkGuard href="/finanzas/ingresos" className="block text-blue-600 hover:text-blue-800 text-sm">• Historial de Ingresos</LinkGuard>
              <LinkGuard href="/finanzas/egresos" className="block text-blue-600 hover:text-blue-800 text-sm">• Historial de Egresos</LinkGuard>
              <LinkGuard href="/finanzas/reportes" className="block text-blue-600 hover:text-blue-800 text-sm">• Reportes Financieros</LinkGuard>
            </div>
          </div>
        )}
      </div>

      {/* ✅ INFORMACIÓN DEL SISTEMA NORMAL */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Información del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-gray-600">
            <strong>Usuario:</strong> {empleado?.usuario || 'N/A'}
          </div>
          <div className="text-gray-600">
            <strong>Rol:</strong> {empleado?.rol || 'N/A'}
          </div>
          <div className="text-gray-600">
            <strong>Email:</strong> {empleado?.email || 'No configurado'}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-gray-600">
              <strong>Modo:</strong> 🌐 Web Online
            </div>
            <div className="text-gray-600">
              <strong>Estado:</strong> {isOnline ? '✅ Conectado' : '📴 Sin conexión'}
            </div>
            {isPWA && catalogStats && (
              <>
                <div className="text-gray-600">
                  <strong>Catálogo:</strong> {catalogStats.clientes} clientes, {catalogStats.productos} productos
                </div>
                <div className="text-gray-600">
                  <strong>Storage:</strong> {catalogStats.storageUsed?.mb}MB utilizados
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}