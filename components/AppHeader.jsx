import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiX, FiMenu, FiRefreshCw, FiUpload } from 'react-icons/fi';
import Head from 'next/head';
import { useOfflineCatalog, useOfflinePedidos } from '../hooks/useOfflineCatalog';
import { getAppMode } from '../utils/offlineManager';

function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [role, setRole] = useState(null);
  const [empleado, setEmpleado] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isPWA, setIsPWA] = useState(false);
  const router = useRouter();

  // ✅ HOOKS OFFLINE
  const {
    loading: catalogLoading,
    needsUpdate,
    updateCatalogManual,
    lastUpdateFormatted
  } = useOfflineCatalog();

  const {
    hasPendientes,
    cantidadPendientes,
    syncPedidosPendientes,
    syncing
  } = useOfflinePedidos();

  useEffect(() => {
    // Obtener rol y datos del empleado
    const roleFromStorage = localStorage.getItem("role");
    const empleadoFromStorage = localStorage.getItem("empleado");
    
    setRole(roleFromStorage);
    setIsPWA(getAppMode() === 'pwa');
    
    if (empleadoFromStorage) {
      try {
        const empleadoData = JSON.parse(empleadoFromStorage);
        setEmpleado(empleadoData);
      } catch (error) {
        console.error('Error parsing empleado data:', error);
        setEmpleado(null);
      }
    }
  }, []);

  // Nuevo useEffect para cerrar menús al cambiar de ruta
  useEffect(() => {
    // Cierra todos los menús cuando cambia la ruta
    const handleRouteChange = () => {
      setShowMenu(false);
      setOpenSubMenu(null);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleLogout = () => {
    // Limpiar todos los datos del localStorage
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("empleado");
    
    // Resetear estados
    setRole(null);
    setEmpleado(null);
    
    router.push("/");
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setOpenSubMenu(null);
  };

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  // ✅ HANDLERS PARA BOTONES OFFLINE
  const handleUpdateCatalog = async () => {
    console.log('🔄 Actualizando catálogo manualmente...');
    await updateCatalogManual();
  };

  const handleSyncPedidos = async () => {
    console.log('🔄 Sincronizando pedidos pendientes...');
    await syncPedidosPendientes();
  };

  // Nuevo método para cerrar menús al hacer clic en un enlace
  const handleMenuItemClick = () => {
    setShowMenu(false);
    setOpenSubMenu(null);
  };

  const subMenuVariants = {
    open: { opacity: 1, y: 0, display: 'block' },
    closed: { opacity: 0, y: -10, display: 'none' },
  };

  const logoVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
  };

  const menuItemVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const logoutVariants = {
    hover: { scale: 1.1, backgroundColor: 'rgba(255, 0, 0, 0.2)' },
    tap: { scale: 0.9 },
  };

  // ✅ VARIANTES PARA BOTONES OFFLINE
  const offlineButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    if (empleado?.nombre) {
      return `${empleado.nombre} ${empleado.apellido || ''}`.trim();
    }
    return 'Usuario';
  };

  // Componente personalizado para Link que cierra los menús al hacer clic
  const MenuLink = ({ href, className, children }) => {
    return (
      <Link href={href} className={className} onClick={handleMenuItemClick}>
        {children}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-blue-500 text-white py-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo (pegado a la izquierda y recarga la página) */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/" className="text-xl sm:text-3xl font-bold">
              VERTIMAR SRL
            </Link>
          </motion.div>

          {/* Menú para pantallas pequeñas (a la derecha) */}
          <div className="sm:hidden ml-auto">
            <motion.button onClick={toggleMenu} className="text-white focus:outline-none">
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>

          {/* Menú para pantallas grandes (centrado) */}
          <div className="hidden sm:flex flex-grow justify-center space-x-6 items-center">
            {/* VENTAS */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('ventas')} className="text-white focus:outline-none font-bold">
                  VENTAS
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'ventas' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/ventas/RegistrarPedido" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Registrar Nota de Pedido</MenuLink>
                  <MenuLink href="/ventas/HistorialPedidos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-black-200">Modificar Nota de Pedido</MenuLink>
                  {(role === 'GERENTE') && (
                    <>
                      <MenuLink href="/ventas/ListaPrecios" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap ">Generar Lista de Precios</MenuLink>
                      <MenuLink href="/ventas/Facturacion" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap mt-1">Facturación</MenuLink>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* INVENTARIO */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('inventario')} className="text-white focus:outline-none font-bold">
                  INVENTARIO
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'inventario' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  {(role === 'GERENTE') && ( 
                    <MenuLink href="/inventario/Productos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Productos</MenuLink>
                  )}
                  <MenuLink href="/inventario/consultaStock" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">Consulta de STOCK</MenuLink>
                  <MenuLink href="/inventario/Remitos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Remitos</MenuLink>
                </motion.div>
              </motion.div>
            )}

            {/* COMPRAS - Visible para todos los roles */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('compras')} className="text-white focus:outline-none font-bold">
                COMPRAS
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'compras' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                {/* Solo GERENTE puede ver Registrar Compra */}
                {role === 'GERENTE' && (
                  <MenuLink href="/compras/RegistrarCompra" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">
                    Registrar Compra
                  </MenuLink>
                )}
                
                {/* Todos los roles pueden ver Registrar Gasto */}
                <MenuLink href="/compras/RegistrarGasto" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">
                  Registrar Gasto
                </MenuLink>
                
                {/* Solo GERENTE puede ver Historial de Compras */}
                {role === 'GERENTE' && (
                  <MenuLink href="/compras/HistorialCompras" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">
                    Historial de Compras
                  </MenuLink>
                )}
              </motion.div>
            </motion.div>

            {/* FINANZAS */}
            {role === 'GERENTE' && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button onClick={() => toggleSubMenu('finanzas')} className="text-white focus:outline-none font-bold">
                  FINANZAS
                </button>
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'finanzas' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/finanzas/fondos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Fondos</MenuLink>
                  <MenuLink href="/finanzas/ingresos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Historial de Ingresos</MenuLink>
                  <MenuLink href="/finanzas/egresos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">Historial de Egresos</MenuLink>
                  <MenuLink href="/finanzas/reportes" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Reportes Financieros</MenuLink>
                </motion.div>
              </motion.div>
            )}

            {/* EDICION - Clientes para todos, resto solo para GERENTE */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => toggleSubMenu('edicion')} className="text-white focus:outline-none font-bold">
                EDICION
              </button>
              <motion.div
                className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'edicion' ? 'open' : 'closed'}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minWidth: '200px' }}
              >
                {/* Clientes visible para todos los roles */}
                <MenuLink href="/edicion/Clientes" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Clientes</MenuLink>
                
                {/* Proveedores y Empleados solo para GERENTE */}
                {role === 'GERENTE' && (
                  <>
                    <MenuLink href="/edicion/Proveedores" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Proveedores</MenuLink>
                    <MenuLink href="/edicion/Empleados" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Empleados</MenuLink>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* ✅ INFORMACIÓN DEL USUARIO Y BOTONES OFFLINE */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* ✅ BOTÓN ACTUALIZAR CATÁLOGO (Solo si PWA y necesita actualización) */}
            {isPWA && needsUpdate && (
              <motion.button
                onClick={handleUpdateCatalog}
                disabled={catalogLoading}
                className={`text-white focus:outline-none px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors ${
                  catalogLoading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                variants={offlineButtonVariants}
                whileHover="hover"
                whileTap="tap"
                title={`Última actualización: ${lastUpdateFormatted}`}
              >
                <FiRefreshCw className={catalogLoading ? 'animate-spin' : ''} size={14} />
                <span className="hidden md:inline">
                  {catalogLoading ? 'Actualizando...' : 'ACTUALIZAR CATÁLOGO'}
                </span>
              </motion.button>
            )}

            {/* ✅ BOTÓN IMPORTAR PEDIDOS (Solo si PWA y hay pendientes) */}
            {isPWA && hasPendientes && (
              <motion.button
                onClick={handleSyncPedidos}
                disabled={syncing}
                className={`text-white focus:outline-none px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors ${
                  syncing 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                variants={offlineButtonVariants}
                whileHover="hover"
                whileTap="tap"
                title={`${cantidadPendientes} pedidos pendientes de sincronizar`}
              >
                <FiUpload className={syncing ? 'animate-pulse' : ''} size={14} />
                <span className="hidden md:inline">
                  {syncing ? 'Sincronizando...' : `IMPORTAR PEDIDOS (${cantidadPendientes})`}
                </span>
                <span className="md:hidden">
                  {syncing ? 'Sync...' : cantidadPendientes}
                </span>
              </motion.button>
            )}

            {/* Información del usuario */}
            <div className="text-right text-sm">
              <p className="font-medium">{getUserName()}</p>
              <p className="text-blue-200 text-xs">{role}</p>
              {/* ✅ INDICADOR PWA */}
              {isPWA && (
                <p className="text-blue-200 text-xs">📱 PWA</p>
              )}
            </div>
            
            {/* Cerrar sesión */}
            <motion.button
              onClick={handleLogout}
              className="text-white focus:outline-none bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold"
              variants={logoutVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cerrar Sesión
            </motion.button>
          </div>
        </div>

        {/* ✅ MENU MÓVIL CON BOTONES OFFLINE */}
        {showMenu && (
          <div className="sm:hidden bg-blue-500 py-2 px-4 flex flex-col items-center">
            {/* Información del usuario en móvil */}
            <div className="w-full text-center mb-4 bg-blue-600 rounded p-3">
              <p className="font-medium text-white">{getUserName()}</p>
              <p className="text-blue-200 text-sm">{role}</p>
              {isPWA && <p className="text-blue-200 text-xs">📱 PWA</p>}
            </div>

            {/* ✅ BOTONES OFFLINE EN MÓVIL */}
            {isPWA && (needsUpdate || hasPendientes) && (
              <div className="w-full mb-4 space-y-2">
                {needsUpdate && (
                  <motion.button
                    onClick={handleUpdateCatalog}
                    disabled={catalogLoading}
                    className={`w-full text-white py-2 px-4 rounded font-medium flex items-center justify-center gap-2 ${
                      catalogLoading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                    variants={offlineButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FiRefreshCw className={catalogLoading ? 'animate-spin' : ''} size={16} />
                    {catalogLoading ? 'Actualizando Catálogo...' : 'ACTUALIZAR CATÁLOGO'}
                  </motion.button>
                )}

                {hasPendientes && (
                  <motion.button
                    onClick={handleSyncPedidos}
                    disabled={syncing}
                    className={`w-full text-white py-2 px-4 rounded font-medium flex items-center justify-center gap-2 ${
                      syncing 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    variants={offlineButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FiUpload className={syncing ? 'animate-pulse' : ''} size={16} />
                    {syncing ? 'Sincronizando...' : `IMPORTAR PEDIDOS (${cantidadPendientes})`}
                  </motion.button>
                )}
              </div>
            )}

            {/* RESTO DE MENÚS MÓVILES (sin cambios) */}
            {/* VENTAS MÓVIL */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('ventas-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  VENTAS
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'ventas-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/ventas/RegistrarPedido" className="block py-2 px-4 hover:bg-blue-600 text-white">Registrar Nota de Pedido</MenuLink>
                  <MenuLink href="/ventas/HistorialPedidos" className="block py-2 px-4 hover:bg-blue-600 text-white">Modificar Nota de Pedido</MenuLink>
                  {(role === 'GERENTE') && (
                    <>
                      <MenuLink href="/ventas/ListaPrecios" className="block py-2 px-4 hover:bg-blue-600 text-white">Generar Lista de Precios</MenuLink>
                      <MenuLink href="/ventas/Facturacion" className="block py-2 px-4 hover:bg-blue-600 text-white">Facturación</MenuLink>
                    </>
                  )}
                </motion.div>
              </div>
            )}

            {/* INVENTARIO MÓVIL */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('inventario-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  INVENTARIO
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'inventario-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {role === 'GERENTE' && (
                    <MenuLink href="/inventario/Productos" className="block py-2 px-4 hover:bg-blue-600 text-white">Productos</MenuLink>
                  )}
                  <MenuLink href="/inventario/consultaStock" className="block py-2 px-4 hover:bg-blue-600 text-white">Consulta de STOCK</MenuLink>
                  <MenuLink href="/inventario/Remitos" className="block py-2 px-4 hover:bg-blue-600 text-white">Remitos</MenuLink>
                </motion.div>
              </div>
            )}

            {/* COMPRAS MÓVIL - Visible para todos los roles */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('compras-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold"
              >
                COMPRAS
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'compras-mobile' ? 'open' : 'closed'}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {/* Solo GERENTE puede ver Registrar Compra */}
                {role === 'GERENTE' && (
                  <MenuLink href="/compras/RegistrarCompra" className="block py-2 px-4 hover:bg-blue-600 text-white">Registrar Compra</MenuLink>
                )}
                
                {/* Todos los roles pueden ver Registrar Gasto */}
                <MenuLink href="/compras/RegistrarGasto" className="block py-2 px-4 hover:bg-blue-600 text-white">Registrar Gasto</MenuLink>
                
                {/* Solo GERENTE puede ver Historial de Compras */}
                {role === 'GERENTE' && (
                  <MenuLink href="/compras/HistorialCompras" className="block py-2 px-4 hover:bg-blue-600 text-white">Historial de Compras</MenuLink>
                )}
              </motion.div>
            </div>

            {/* FINANZAS MÓVIL */}
            {role === 'GERENTE' && (
              <div className="w-full mb-2">
                <motion.button
                  onClick={() => toggleSubMenu('finanzas-mobile')}
                  className="w-full text-white py-2 focus:outline-none text-left font-bold"
                >
                  FINANZAS
                </motion.button>
                <motion.div
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'finanzas-mobile' ? 'open' : 'closed'}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <MenuLink href="/finanzas/fondos" className="block py-2 px-4 hover:bg-blue-600 text-white">Fondos</MenuLink>
                  <MenuLink href="/finanzas/ingresos" className="block py-2 px-4 hover:bg-blue-600 text-white">Historial de Ingresos</MenuLink>
                  <MenuLink href="/finanzas/egresos" className="block py-2 px-4 hover:bg-blue-600 text-white">Historial de Egresos</MenuLink>
                  <MenuLink href="/finanzas/reportes" className="block py-2 px-4 hover:bg-blue-600 text-white">Reportes Financieros</MenuLink>
                </motion.div>
              </div>
            )}

            {/* EDICION MÓVIL - Clientes para todos, resto solo para GERENTE */}
            <div className="w-full mb-2">
              <motion.button
                onClick={() => toggleSubMenu('edicion-mobile')}
                className="w-full text-white py-2 focus:outline-none text-left font-bold"
              >
                EDICION
              </motion.button>
              <motion.div
                variants={subMenuVariants}
                initial="closed"
                animate={openSubMenu === 'edicion-mobile' ? 'open' : 'closed'}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {/* Clientes visible para todos los roles */}
                <MenuLink href="/edicion/Clientes" className="block py-2 px-4 hover:bg-blue-600 text-white">Clientes</MenuLink>
                
                {/* Proveedores y Empleados solo para GERENTE */}
                {role === 'GERENTE' && (
                  <>
                    <MenuLink href="/edicion/Proveedores" className="block py-2 px-4 hover:bg-blue-600 text-white">Proveedores</MenuLink>
                    <MenuLink href="/edicion/Empleados" className="block py-2 px-4 hover:bg-blue-600 text-white">Empleados</MenuLink>
                  </>
                )}
              </motion.div>
            </div>

            <motion.button
              onClick={handleLogout}
              className="w-full text-white py-2 focus:outline-none bg-red-500 hover:bg-red-600 rounded font-bold mt-4"
              variants={logoutVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cerrar Sesión
            </motion.button>
          </div>
        )}
      </nav>
    </>
  );
}

export default AppHeader;