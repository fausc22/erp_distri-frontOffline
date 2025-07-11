import { useState } from 'react';

import { axiosAuth, fetchAuth } from '../utils/apiClient';
  
export function useProductoSearch() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const buscarProducto = async () => {
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      const data =  await fetchAuth(`/pedidos/filtrar-producto?search=${encodeURIComponent(busqueda)}`);
      

      
      setResultados(data.data);
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al buscar producto:', error);
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
    busqueda,
    setBusqueda,
    resultados,
    productoSeleccionado,
    cantidad,
    subtotal,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarProducto,
    seleccionarProducto,
    actualizarCantidad,
    limpiarSeleccion
  };
}

