import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { axiosAuth, fetchAuth } from '../../utils/apiClient';

export function useHistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [selectedVentas, setSelectedVentas] = useState([]); // Array de IDs
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const response = await axiosAuth.get(`/ventas/obtener-ventas`);
      setVentas(response.data);
      console.log('✅ Ventas cargadas:', response.data.length);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      toast.error("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  // 🔧 CORREGIDO: Manejar selección por ID
  const handleSelectVenta = (ventaId) => {
    if (selectedVentas.includes(ventaId)) {
      setSelectedVentas(selectedVentas.filter(id => id !== ventaId));
    } else {
      setSelectedVentas([...selectedVentas, ventaId]);
    }
  };

  // 🔧 CORREGIDO: Manejar selección múltiple
  const handleSelectAllVentas = (ventasVisibles) => {
    const idsVisibles = ventasVisibles.map(v => v.id);
    const todosSeleccionados = idsVisibles.every(id => selectedVentas.includes(id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los visibles
      setSelectedVentas(selectedVentas.filter(id => !idsVisibles.includes(id)));
    } else {
      // Seleccionar todos los visibles que no estén ya seleccionados
      const nuevosIds = idsVisibles.filter(id => !selectedVentas.includes(id));
      setSelectedVentas([...selectedVentas, ...nuevosIds]);
    }
  };

  const clearSelection = () => {
    setSelectedVentas([]);
  };

  // 🆕 Obtener ventas seleccionadas completas
  const getVentasSeleccionadas = () => {
    return ventas.filter(venta => selectedVentas.includes(venta.id));
  };

  return {
    ventas,
    selectedVentas,
    loading,
    cargarVentas,
    handleSelectVenta,
    handleSelectAllVentas,
    clearSelection,
    getVentasSeleccionadas // Nueva función helper
  };
}