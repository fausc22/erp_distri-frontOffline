// pages/inicio.jsx - Modificado para manejar modo offline
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
  
  // ✅ DETERMINAR SI ESTAMOS EN MODO OFFLINE
  const isOfflineMode = router.query.mode === 'offline' || (!isOnline && isPWA);

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

  // ✅ MANEJO DE EVENTOS DE CONECTIVIDAD
  useEffect(() => {
    if (!eventType) return;

    switch (eventType) {
      case 'connection_restored_redirect':
        // Recarga para ir al modo online
        console.log('🔄 Recargando para modo online...');
        window.location.href = '/inicio';
        break;
        
      case 'connection_lost_redirect':
        // Ya estamos en inicio, solo cambiar la URL
        if (!router.query.mode) {
          router.replace('/inicio?mode=offline', undefined, { shallow: true });
        }
        break;
    }
  }, [eventType, router]);

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
        <title>VERTIMAR | {isOfflineMode ? 'INICIO OFFLINE' : 'INICIO'}</title>
      </Head>
      
      {/* ✅ HEADER ADAPTATIVO SEGÚN MODO */}
      <div className={`text-white rounded-lg p-6 mb-8 transition-all duration-300 ${
        isOfflineMode 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-l-4 border-orange-400' 
          : 'bg-gradient-to-r from-blue-500 to-blue-600'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {getGreeting()}, {empleado?.nombre} {empleado?.apellido}
            </h1>
            <p className={isOfflineMode ? 'text-orange-100' : 'text-blue-100'}>
              {getRoleDescription(empleado?.rol)}
            </p>
            
            {/* ✅ INDICADOR DE MODO */}
            {isOfflineMode && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse"></div>
                <span className="text-orange-100 text-sm font-medium">
                  📱 MODO OFFLINE - Solo registro de pedidos disponible
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 text-right">
            {!isOfflineMode && <InstallButton />}
            <p className={`text-sm ${isOfflineMode ? 'text-orange-100' : 'text-blue-100'}`}>
              {new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        {/* ✅ BOTÓN "IR A ONLINE" ARRIBA DEL TODO */}
        {isOfflineMode && isOnline && (
          <div className="mt-4 pt-4 border-t border-orange-400">
            <div className="flex items-center justify-center">
              <button
                onClick={() => window.location.href = '/inicio'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-bold transition-colors shadow-lg"
              >
                🌐 IR A MODO ONLINE
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-orange-100 text-sm">
                💡 Conexión detectada - Puedes volver al modo completo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ INFORMACIÓN OFFLINE */}
      {isOfflineMode && catalogStats && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
            📦 Catálogo Offline Disponible
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-orange-600 font-medium">Clientes:</span>
              <div className="text-orange-800 font-bold">{catalogStats.clientes}</div>
            </div>
            <div>
              <span className="text-orange-600 font-medium">Productos:</span>
              <div className="text-orange-800 font-bold">{catalogStats.productos}</div>
            </div>
            <div>
              <span className="text-orange-600 font-medium">Pendientes:</span>
              <div className="text-orange-800 font-bold">{catalogStats.pedidosPendientes}</div>
            </div>
            <div>
              <span className="text-orange-600 font-medium">Storage:</span>
              <div className="text-orange-800 font-bold">{catalogStats.storageUsed?.mb}MB</div>
            </div>
          </div>
          
          {catalogStats.pedidosPendientes > 0 && (
            <div className="mt-2 text-sm text-orange-700">
              💡 Los pedidos pendientes se sincronizarán automáticamente cuando se recupere la conexión
            </div>
          )}
        </div>
      )}

      {/* ✅ PANEL DE ACCESOS ADAPTATIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ✅ VENTAS - ADAPTADO PARA MODO OFFLINE */}
        {(empleado?.rol === 'GERENTE' || empleado?.rol === 'VENDEDOR') && (
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-full ${
                isOfflineMode ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  isOfflineMode ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ml-3">
                {isOfflineMode ? 'Pedidos Offline' : 'Ventas'}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              {isOfflineMode 
                ? 'Registro de pedidos sin conexión a internet' 
                : 'Gestión de notas de pedido y facturación'
              }
            </p>
            
            <div className="space-y-2">
              {isOfflineMode ? (
                // Solo registrar pedidos en modo offline
                <>
                  <LinkGuard 
                    href="/ventas/RegistrarPedido" 
                    className="block text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    📱 • Registrar Pedido Offline
                  </LinkGuard>
                  <div className="text-xs text-gray-500 mt-2">
                    Los pedidos se guardarán localmente y se sincronizarán al reconectarse
                  </div>
                </>
              ) : (
                // Menú completo en modo online
                <>
                  <LinkGuard href="/ventas/RegistrarPedido" className="block text-blue-600 hover:text-blue-800 text-sm">• Registrar Nota de Pedido</LinkGuard>
                  <LinkGuard href="/ventas/HistorialPedidos" className="block text-blue-600 hover:text-blue-800 text-sm">• Historial de Pedidos</LinkGuard>
                  {empleado?.rol === 'GERENTE' && (
                    <>
                      <LinkGuard href="/ventas/ListaPrecios" className="block text-blue-600 hover:text-blue-800 text-sm">• Lista de Precios</LinkGuard>
                      <LinkGuard href="/ventas/Facturacion" className="block text-blue-600 hover:text-blue-800 text-sm">• Facturación</LinkGuard>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ✅ INVENTARIO - SOLO ONLINE */}
        {!isOfflineMode && (empleado?.rol === 'GERENTE' || empleado?.rol === 'VENDEDOR') && (
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

        {/* ✅ ADMINISTRACIÓN - SOLO ONLINE GERENTES */}
        {!isOfflineMode && empleado?.rol === 'GERENTE' && (
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
        {!isOfflineMode && empleado?.rol === 'VENDEDOR' && (
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

        {/* ✅ MENSAJE INFORMATIVO EN MODO OFFLINE */}
        {isOfflineMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-yellow-800 ml-3">Modo Offline</h3>
            </div>
            <div className="text-yellow-700 space-y-2 text-sm">
              <p>• 📱 Solo puedes registrar pedidos sin conexión</p>
              <p>• 💾 Los pedidos se guardan localmente en tu dispositivo</p>
              <p>• 🔄 Se sincronizarán automáticamente al recuperar conexión</p>
              <p>• 📊 Tienes acceso al catálogo completo offline</p>
              <p>• 🌐 Las demás funciones requieren conexión a internet</p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ INFORMACIÓN DEL SISTEMA ADAPTATIVA */}
      <div className={`mt-8 rounded-lg p-6 ${
        isOfflineMode ? 'bg-orange-50' : 'bg-gray-50'
      }`}>
        <h3 className={`text-lg font-semibold mb-3 ${
          isOfflineMode ? 'text-orange-800' : 'text-gray-800'
        }`}>
          Información del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
            <strong>Usuario:</strong> {empleado?.usuario || 'N/A'}
          </div>
          <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
            <strong>Rol:</strong> {empleado?.rol || 'N/A'}
          </div>
          <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
            <strong>Email:</strong> {empleado?.email || 'No configurado'}
          </div>
        </div>
        
        {/* ✅ INFORMACIÓN ESPECÍFICA DEL MODO */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
              <strong>Modo:</strong> {isOfflineMode ? '📱 PWA Offline' : '🌐 Web Online'}
            </div>
            <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
              <strong>Estado:</strong> {isOnline ? '✅ Conectado' : '📴 Sin conexión'}
            </div>
            {isPWA && catalogStats && (
              <>
                <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
                  <strong>Catálogo:</strong> {catalogStats.clientes} clientes, {catalogStats.productos} productos
                </div>
                <div className={isOfflineMode ? 'text-orange-700' : 'text-gray-600'}>
                  <strong>Storage:</strong> {catalogStats.storageUsed?.mb}MB utilizados
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ ACCIONES ESPECÍFICAS DEL MODO */}
        {/* BOTÓN MOVIDO ARRIBA - Ya no se muestra aquí */}
      </div>
    </div>
  );
}