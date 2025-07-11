// hooks/useProductoSearchHybrid.js - Hook híbrido para búsqueda de productos PWA/Web
import { useState, useEffect } from 'react';
import { useOfflineCatalog } from './useOfflineCatalog';
import { getAppMode } from '../utils/offlineManager';

export function useProductoSearchHybrid() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const appMode = getAppMode();
  const isPWA = appMode === 'pwa';

  // Hook del catálogo offline
  const { buscarProductos } = useOfflineCatalog();

  // ✅ MONITOREAR CONECTIVIDAD SOLO EN PWA
  useEffect(() => {
    if (isPWA) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isPWA]);

  // ✅ BÚSQUEDA HÍBRIDA DE PRODUCTOS
  const buscarProducto = async () => {
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      console.log(`🔍 Buscando productos en modo ${appMode}:`, busqueda);
      
      const resultados = await buscarProductos(busqueda);
      
      setResultados(resultados);
      setMostrarModal(true);
      
      console.log(`✅ Productos encontrados: ${resultados.length}`);
    } catch (error) {
      console.error('❌ Error buscando productos:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
    setSubtotal(parseFloat(Number(producto.precio).toFixed(2)));
  };

  const actualizarCantidad = (nuevaCantidad) => {
    const cantidadValida = Math.max(1, nuevaCantidad);
    setCantidad(cantidadValida);
    if (productoSeleccionado) {
      setSubtotal(parseFloat((productoSeleccionado.precio * cantidadValida).toFixed(2)));
    }
  };

  const limpiarSeleccion = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
    setSubtotal(0);
    setBusqueda('');
    setMostrarModal(false);
  };

  return {
    // Estados
    busqueda,
    setBusqueda,
    resultados,
    productoSeleccionado,
    cantidad,
    subtotal,
    loading,
    mostrarModal,
    setMostrarModal,
    isPWA,
    isOnline,
    
    // Funciones
    buscarProducto,
    seleccionarProducto,
    actualizarCantidad,
    limpiarSeleccion
  };
}