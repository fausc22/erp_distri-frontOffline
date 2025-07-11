import { useState } from 'react';
import { axiosAuth, fetchAuth } from '../utils/apiClient'; 




export function useClienteSearch() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const buscarCliente = async () => {
    if (!busqueda.trim()) return;

    setLoading(true);
    try {
      
      const data = await fetchAuth(`/pedidos/filtrar-cliente?search=${encodeURIComponent(busqueda)}`);
      setResultados(data.data);
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setResultados([]);
    setMostrarModal(false);
  };

  return {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarCliente,
    limpiarBusqueda
  };
}