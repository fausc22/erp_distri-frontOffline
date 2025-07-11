// hooks/egresos/useHistorialEgresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useEgresos } from '../../context/EgresosContext';



import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useHistorialEgresos() {
  const {
    egresos,
    totalEgresos,
    totalRegistros,
    filtros,
    paginacion,
    setEgresos,
    setTotalEgresos,
    setTotalRegistros,
    setFiltros,
    resetFiltros,
    setPaginacion,
    setLoading
  } = useEgresos();

  const cargarEgresos = async (page = null, filtrosActuales = null) => {
    const paginaAUsar = page || paginacion.paginaActual;
    const filtrosAUsar = filtrosActuales || filtros;
    
    setLoading({ egresos: true });
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        limit: paginacion.registrosPorPagina,
        page: paginaAUsar
      });
      
      // Añadir filtros
      if (filtrosAUsar.desde) params.append('desde', filtrosAUsar.desde);
      if (filtrosAUsar.hasta) params.append('hasta', filtrosAUsar.hasta);
      if (filtrosAUsar.tipo !== 'todos') params.append('tipo', filtrosAUsar.tipo);
      if (filtrosAUsar.cuenta !== 'todas') params.append('cuenta', filtrosAUsar.cuenta);
      if (filtrosAUsar.busqueda) params.append('busqueda', filtrosAUsar.busqueda);
      
      const response = await axiosAuth.get(`/finanzas/egresos/historial?${params.toString()}`);
      
      if (response.data.success) {
        setEgresos(response.data.data);
        setTotalEgresos(response.data.total);
        setTotalRegistros(response.data.count || response.data.data.length);
        
        // Actualizar página actual si se especificó
        if (page) {
          setPaginacion({ paginaActual: page });
        }
      } else {
        toast.error("Error al cargar los egresos");
      }
    } catch (error) {
      console.error("Error al obtener egresos:", error);
      toast.error("No se pudieron cargar los egresos");
    } finally {
      setLoading({ egresos: false });
    }
  };

  const aplicarFiltros = () => {
    setPaginacion({ paginaActual: 1 });
    cargarEgresos(1, filtros);
  };

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      desde: '',
      hasta: '',
      tipo: 'todos',
      cuenta: 'todas',
      busqueda: ''
    };
    resetFiltros();
    setPaginacion({ paginaActual: 1 });
    cargarEgresos(1, filtrosLimpios);
  };

  const cambiarPagina = (pagina) => {
    setPaginacion({ paginaActual: pagina });
    cargarEgresos(pagina);
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setPaginacion({ 
      registrosPorPagina: cantidad, 
      paginaActual: 1 
    });
    cargarEgresos(1);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ [campo]: valor });
  };

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalRegistros / paginacion.registrosPorPagina);

  return {
    egresos,
    totalEgresos,
    totalRegistros,
    filtros,
    paginacion,
    totalPaginas,
    cargarEgresos,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarRegistrosPorPagina,
    handleFiltroChange
  };
}