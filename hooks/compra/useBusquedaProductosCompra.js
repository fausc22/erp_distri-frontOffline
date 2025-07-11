import { useState } from 'react';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useProductoSearchCompra() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioCosto, setPrecioCosto] = useState(0);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const buscarProducto = async () => {
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      const data = await fetchAuth(`/productos/buscar-producto?search=${encodeURIComponent(busqueda)}`);
      

      
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
    setPrecioCosto(producto.costo || 0);
    setPrecioVenta(producto.precio || 0);
    calcularSubtotal(1, producto.costo || 0);
    setMostrarModal(false);
  };

  const calcularSubtotal = (cant = cantidad, costo = precioCosto) => {
    const subtotalCalculado = parseFloat(Number(cant * costo).toFixed(2));
    setSubtotal(subtotalCalculado);
  };

  const actualizarCantidad = (nuevaCantidad) => {
    const cantidadValida = Math.max(1, nuevaCantidad);
    setCantidad(cantidadValida);
    calcularSubtotal(cantidadValida, precioCosto);
  };

  const actualizarPrecioCosto = (nuevoPrecio) => {
    const precioValido = Math.max(0, nuevoPrecio);
    setPrecioCosto(precioValido);
    calcularSubtotal(cantidad, precioValido);
  };

  const limpiarSeleccion = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecioCosto(0);
    setPrecioVenta(0);
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
    precioCosto,
    precioVenta,
    subtotal,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarProducto,
    seleccionarProducto,
    actualizarCantidad,
    actualizarPrecioCosto,
    setPrecioVenta,
    limpiarSeleccion
  };
}