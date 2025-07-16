import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiX, FiMenu, FiWifi, FiWifiOff } from 'react-icons/fi';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { getAppMode } from '../utils/offlineManager';
import { useConnection } from '../utils/ConnectionManager';
import { LinkGuard } from './OfflineGuard';

function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [role, setRole] = useState(null);
  const [empleado, setEmpleado] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isPWA, setIsPWA] = useState(false);
  const router = useRouter();

  // ✅ CONNECTION MANAGER (solo para indicadores visuales)
  const { isOnline } = useConnection();

  // ✅ NAVEGACIÓN OFFLINE INTELIGENTE
  const handleOfflineNavigation = (href) => {
    // Lista de rutas que SÍ funcionan offline
    const offlineRoutes = [
      '/ventas/RegistrarPedido',
      '/inicio',
      '/login',
      '/'
    ];
    
    if (offlineRoutes.includes(href)) {
      // Navegación segura offline
      console.log(`🔄 Navegación offline segura a: ${href}`);
      window.location.href = href;
    } else {
      // Mostrar mensaje para rutas no disponibles offline
      toast.warning('Esta sección requiere conexión a internet', {
        duration: 3000,
        icon: '📴'
      });
      console.log(`⚠️ Ruta bloqueada offline: ${href}`);
    }
  };

  // ✅ COMPONENTE LINK CON NAVEGACIÓN OFFLINE
  const MenuLink = ({ href, className, children }) => {
    const handleClick = (e) => {
      if (isPWA && !isOnline) {
        e.preventDefault();
        handleOfflineNavigation(href);
      } else {
        // Navegación normal online
        handleMenuItemClick();
      }
    };

    return (
      <LinkGuard href={href} className={className} onClick={handleClick}>
        {children}
      </LinkGuard>
    );
  };

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

  useEffect(() => {
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
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("empleado");
    
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

  const handleMenuItemClick = () => {
    setShowMenu(false);
    setOpenSubMenu(null);
  };

  const getUserName = () => {
    if (empleado?.nombre) {
      return `${empleado.nombre} ${empleado.apellido || ''}`.trim();
    }
    return 'Usuario';
  };

  // ✅ VARIANTES DE ANIMACIÓN
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

  // ✅ DETERMINAR TEMA SEGÚN CONECTIVIDAD
  const getNavbarTheme = () => {
    if (!isPWA) return 'bg-blue-500'; // Tema normal para web
    
    return isOnline ? 'bg-blue-500' : 'bg-orange-500'; // Azul online, naranja offline
  };

  // ✅ OBTENER ESTILO DE MENÚ SEGÚN DISPONIBILIDAD OFFLINE
  const getMenuItemStyle = (requiresOnline = false) => {
    if (!isPWA || isOnline) {
      return "text-white focus:outline-none font-bold"; // Normal
    }
    
    if (requiresOnline) {
      return "text-orange-200 focus:outline-none font-bold opacity-60 cursor-not-allowed"; // Deshabilitado
    }
    
    return "text-white focus:outline-none font-bold"; // Disponible offline
  };

  return (
    <>
      <nav className={`${getNavbarTheme()} text-white py-4 sticky top-0 z-50 transition-colors duration-300`}>
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/" className="text-xl sm:text-3xl font-bold">
              VERTIMAR SRL
            </Link>
          </motion.div>

          {/* ✅ INDICADOR DE CONECTIVIDAD PROMINENTE */}
          {isPWA && (
            <div className="flex items-center gap-2 bg-black bg-opacity-20 px-3 py-1 rounded-full">
              {isOnline ? (
                <>
                  <FiWifi className="text-green-300" size={16} />
                  <span className="text-green-300 text-sm font-medium">ONLINE</span>
                </>
              ) : (
                <>
                  <FiWifiOff className="text-orange-300" size={16} />
                  <span className="text-orange-300 text-sm font-medium">OFFLINE</span>
                </>
              )}
            </div>
          )}

          {/* Menú para pantallas pequeñas */}
          <div className="sm:hidden ml-auto">
            <motion.button onClick={toggleMenu} className="text-white focus:outline-none">
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>

          {/* Menú para pantallas grandes */}
          <div className="hidden sm:flex flex-grow justify-center space-x-6 items-center">
            {/* VENTAS - SIEMPRE DISPONIBLE (RegistrarPedido funciona offline) */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button 
                  onClick={() => toggleSubMenu('ventas')} 
                  className={getMenuItemStyle(false)}
                  disabled={isPWA && !isOnline ? false : false} // Siempre habilitado
                >
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
                  <MenuLink href="/ventas/RegistrarPedido" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">
                    📱 Registrar Pedido (Universal)
                  </MenuLink>
                  <MenuLink href="/ventas/HistorialPedidos" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-black-200">
                    Modificar Nota de Pedido
                  </MenuLink>
                  {(role === 'GERENTE') && (
                    <>
                      <MenuLink href="/ventas/ListaPrecios" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">
                        Generar Lista de Precios
                      </MenuLink>
                      <MenuLink href="/ventas/Facturacion" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap mt-1">
                        Facturación
                      </MenuLink>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* INVENTARIO - Requiere online */}
            {(role === 'GERENTE' || role === 'VENDEDOR') && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button 
                  onClick={() => isPWA && !isOnline ? null : toggleSubMenu('inventario')} 
                  className={getMenuItemStyle(true)}
                  disabled={isPWA && !isOnline}
                  title={isPWA && !isOnline ? "Requiere conexión a internet" : ""}
                >
                  INVENTARIO
                  {isPWA && !isOnline && <span className="ml-1 text-xs">🔒</span>}
                </button>
                {isOnline && (
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
                )}
              </motion.div>
            )}

            {/* COMPRAS - Requiere online */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button 
                onClick={() => isPWA && !isOnline ? null : toggleSubMenu('compras')} 
                className={getMenuItemStyle(true)}
                disabled={isPWA && !isOnline}
                title={isPWA && !isOnline ? "Requiere conexión a internet" : ""}
              >
                COMPRAS
                {isPWA && !isOnline && <span className="ml-1 text-xs">🔒</span>}
              </button>
              {isOnline && (
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'compras' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  {role === 'GERENTE' && (
                    <MenuLink href="/compras/RegistrarCompra" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">
                      Registrar Compra
                    </MenuLink>
                  )}
                  
                  <MenuLink href="/compras/RegistrarGasto" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap border-b border-gray-200">
                    Registrar Gasto
                  </MenuLink>
                  
                  {role === 'GERENTE' && (
                    <MenuLink href="/compras/HistorialCompras" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">
                      Historial de Compras
                    </MenuLink>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* FINANZAS - Solo gerentes y requiere online */}
            {role === 'GERENTE' && (
              <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
                <button 
                  onClick={() => isPWA && !isOnline ? null : toggleSubMenu('finanzas')} 
                  className={getMenuItemStyle(true)}
                  disabled={isPWA && !isOnline}
                  title={isPWA && !isOnline ? "Requiere conexión a internet" : ""}
                >
                  FINANZAS
                  {isPWA && !isOnline && <span className="ml-1 text-xs">🔒</span>}
                </button>
                {isOnline && (
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
                )}
              </motion.div>
            )}

            {/* EDICION - Requiere online */}
            <motion.div className="relative" variants={menuItemVariants} whileHover="hover" whileTap="tap">
              <button 
                onClick={() => isPWA && !isOnline ? null : toggleSubMenu('edicion')} 
                className={getMenuItemStyle(true)}
                disabled={isPWA && !isOnline}
                title={isPWA && !isOnline ? "Requiere conexión a internet" : ""}
              >
                EDICION
                {isPWA && !isOnline && <span className="ml-1 text-xs">🔒</span>}
              </button>
              {isOnline && (
                <motion.div
                  className="absolute top-full left-0 bg-white text-black shadow-md rounded-md p-2 mt-1 origin-top transition duration-200 ease-in-out"
                  variants={subMenuVariants}
                  initial="closed"
                  animate={openSubMenu === 'edicion' ? 'open' : 'closed'}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ minWidth: '200px' }}
                >
                  <MenuLink href="/edicion/Clientes" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Clientes</MenuLink>
                  
                  {role === 'GERENTE' && (
                    <>
                      <MenuLink href="/edicion/Proveedores" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Proveedores</MenuLink>
                      <MenuLink href="/edicion/Empleados" className="block py-2 px-4 hover:bg-gray-100 text-sm whitespace-nowrap">Empleados</MenuLink>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ✅ INFORMACIÓN DEL USUARIO */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Información del usuario */}
            <div className="text-right text-sm">
              <p className="font-medium">{getUserName()}</p>
              <p className={`text-xs ${isOnline ? 'text-blue-200' : 'text-orange-200'}`}>{role}</p>
              {isPWA && (
                <p className={`text-xs ${isOnline ? 'text-blue-200' : 'text-orange-200'}`}>
                  📱 PWA {isOnline ? '(Online)' : '(Offline)'}
                </p>
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

        {/* ✅ MENU MÓVIL CON NAVEGACIÓN OFFLINE */}
        {showMenu && (
          <div className="sm:hidden bg-blue-500 py-2 px-4 flex flex-col items-center">
            {/* Información del usuario en móvil */}
            <div className={`w-full text-center mb-4 rounded p-3 ${
              isOnline ? 'bg-blue-600' : 'bg-orange-600'
            }`}>
              <p className="font-medium text-white">{getUserName()}</p>
              <p className="text-blue-200 text-sm">{role}</p>
              {isPWA && (
                <div className="flex items-center justify-center gap-2 mt-1">
                  {isOnline ? (
                    <FiWifi className="text-green-300" size={14} />
                  ) : (
                    <FiWifiOff className="text-orange-300" size={14} />
                  )}
                  <span className="text-xs">📱 PWA {isOnline ? 'Online' : 'Offline'}</span>
                </div>
              )}
            </div>

            {/* VENTAS MÓVIL - SIEMPRE DISPONIBLE */}
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
                  <MenuLink href="/ventas/RegistrarPedido" className="block py-2 px-4 hover:bg-blue-600 text-white">📱 Registrar Pedido (Universal)</MenuLink>
                  {isOnline && (
                    <>
                      <MenuLink href="/ventas/HistorialPedidos" className="block py-2 px-4 hover:bg-blue-600 text-white">Modificar Nota de Pedido</MenuLink>
                      {(role === 'GERENTE') && (
                        <>
                          <MenuLink href="/ventas/ListaPrecios" className="block py-2 px-4 hover:bg-blue-600 text-white">Generar Lista de Precios</MenuLink>
                          <MenuLink href="/ventas/Facturacion" className="block py-2 px-4 hover:bg-blue-600 text-white">Facturación</MenuLink>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            )}

            {/* RESTO DE MENÚS MÓVILES - Solo cuando online */}
            {isOnline && (
              <>
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

                {/* COMPRAS MÓVIL */}
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
                    {role === 'GERENTE' && (
                      <MenuLink href="/compras/RegistrarCompra" className="block py-2 px-4 hover:bg-blue-600 text-white">Registrar Compra</MenuLink>
                    )}
                    
                    <MenuLink href="/compras/RegistrarGasto" className="block py-2 px-4 hover:bg-blue-600 text-white">Registrar Gasto</MenuLink>
                    
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

                {/* EDICION MÓVIL */}
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
                    <MenuLink href="/edicion/Clientes" className="block py-2 px-4 hover:bg-blue-600 text-white">Clientes</MenuLink>
                    
                    {role === 'GERENTE' && (
                      <>
                        <MenuLink href="/edicion/Proveedores" className="block py-2 px-4 hover:bg-blue-600 text-white">Proveedores</MenuLink>
                        <MenuLink href="/edicion/Empleados" className="block py-2 px-4 hover:bg-blue-600 text-white">Empleados</MenuLink>
                      </>
                    )}
                  </motion.div>
                </div>
              </>
            )}

            {/* ✅ MENSAJE INFORMATIVO OFFLINE EN MÓVIL */}
            {isPWA && !isOnline && (
              <div className="w-full mb-4 p-3 bg-orange-600 bg-opacity-50 rounded text-center">
                <p className="text-xs text-orange-100">
                  🔒 Algunas secciones requieren conexión a internet
                </p>
              </div>
            )}

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