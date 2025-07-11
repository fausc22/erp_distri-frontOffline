import { useState } from 'react';
import { toast } from 'react-hot-toast';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useProveedorSearch() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const buscarProveedor = async () => {
    if (!busqueda.trim()) {
      toast.error('Ingrese un nombre para buscar');
      return;
    }

    setLoading(true);
    try {
      const  data = await fetchAuth(`/personas/buscar-proveedor?search=${encodeURIComponent(busqueda)}`);
      
      
      
      if (data.success) {
        setResultados(data.data);
        if (data.data.length === 0) {
          toast.error('No se encontraron proveedores con ese nombre');
        } else {
          setMostrarModal(true);
        }
      } else {
        toast.error(data.message || 'Error al buscar proveedor');
      }
    } catch (error) {
      console.error('Error al buscar proveedor:', error);
      toast.error('Error al conectar con el servidor');
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
    buscarProveedor,
    limpiarBusqueda
  };
}