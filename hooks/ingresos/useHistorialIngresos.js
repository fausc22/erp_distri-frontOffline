// hooks/ingresos/useHistorialIngresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useIngresos } from '../../context/IngresosContext';


import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useHistorialIngresos() {
  const {
    ingresos,
    totalIngresos,
    totalRegistros,
    filtros,
    paginacion,
    setIngresos,
    setTotalIngresos,
    setTotalRegistros,
    setFiltros,
    resetFiltros,
    setPaginacion,
    setLoading
  } = useIngresos();

  const cargarIngresos = async (page = null, filtrosActuales = null) => {
    const paginaAUsar = page || paginacion.paginaActual;
    const filtrosAUsar = filtrosActuales || filtros;
    
    setLoading({ ingresos: true });
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
      
      const response = await axiosAuth.get(`/finanzas/ingresos/historial?${params.toString()}`);
      
      if (response.data.success) {
        setIngresos(response.data.data);
        setTotalIngresos(response.data.total);
        setTotalRegistros(response.data.count || response.data.data.length);
        
        // Actualizar página actual si se especificó
        if (page) {
          setPaginacion({ paginaActual: page });
        }
      } else {
        toast.error("Error al cargar los ingresos");
      }
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
      toast.error("No se pudieron cargar los ingresos");
    } finally {
      setLoading({ ingresos: false });
    }
  };

  const aplicarFiltros = () => {
    setPaginacion({ paginaActual: 1 });
    cargarIngresos(1, filtros);
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
    cargarIngresos(1, filtrosLimpios);
  };

  const cambiarPagina = (pagina) => {
    setPaginacion({ paginaActual: pagina });
    cargarIngresos(pagina);
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setPaginacion({ 
      registrosPorPagina: cantidad, 
      paginaActual: 1 
    });
    cargarIngresos(1);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ [campo]: valor });
  };

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalRegistros / paginacion.registrosPorPagina);

  return {
    ingresos,
    totalIngresos,
    totalRegistros,
    filtros,
    paginacion,
    totalPaginas,
    cargarIngresos,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarRegistrosPorPagina,
    handleFiltroChange
  };
}