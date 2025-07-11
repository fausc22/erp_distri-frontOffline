// context/EgresosContext.js
import { createContext, useContext, useReducer } from 'react';

const EgresosContext = createContext();

// Reducer para manejar el estado de egresos
function egresosReducer(state, action) {
  switch (action.type) {
    case 'SET_EGRESOS':
      return { ...state, egresos: action.payload };
    
    case 'SET_CUENTAS':
      return { ...state, cuentas: action.payload };
    
    case 'SET_TOTAL_EGRESOS':
      return { ...state, totalEgresos: action.payload };
    
    case 'SET_TOTAL_REGISTROS':
      return { ...state, totalRegistros: action.payload };
    
    case 'SET_FILTROS':
      return { ...state, filtros: { ...state.filtros, ...action.payload } };
    
    case 'RESET_FILTROS':
      return { 
        ...state, 
        filtros: {
          desde: '',
          hasta: '',
          tipo: 'todos',
          cuenta: 'todas',
          busqueda: ''
        }
      };
    
    case 'SET_PAGINACION':
      return { ...state, paginacion: { ...state.paginacion, ...action.payload } };
    
    case 'SET_MOSTRAR_FILTROS':
      return { ...state, mostrarFiltros: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    
    case 'SET_MODAL':
      return { 
        ...state, 
        modales: { ...state.modales, [action.payload.modal]: action.payload.estado } 
      };
    
    case 'SET_DETALLE':
      return { 
        ...state, 
        detalle: {
          data: action.payload.data,
          tipo: action.payload.tipo
        }
      };
    
    default:
      return state;
  }
}

const initialState = {
  egresos: [],
  cuentas: [],
  totalEgresos: 0,
  totalRegistros: 0,
  filtros: {
    desde: '',
    hasta: '',
    tipo: 'todos',
    cuenta: 'todas',
    busqueda: ''
  },
  paginacion: {
    paginaActual: 1,
    registrosPorPagina: 10
  },
  mostrarFiltros: false,
  loading: {
    egresos: false,
    cuentas: false,
    operacion: false
  },
  modales: {
    nuevoEgreso: false,
    detalle: false
  },
  detalle: {
    data: null,
    tipo: ''
  }
};

export function EgresosProvider({ children }) {
  const [state, dispatch] = useReducer(egresosReducer, initialState);

  const actions = {
    setEgresos: (egresos) => dispatch({ type: 'SET_EGRESOS', payload: egresos }),
    setCuentas: (cuentas) => dispatch({ type: 'SET_CUENTAS', payload: cuentas }),
    setTotalEgresos: (total) => dispatch({ type: 'SET_TOTAL_EGRESOS', payload: total }),
    setTotalRegistros: (total) => dispatch({ type: 'SET_TOTAL_REGISTROS', payload: total }),
    setFiltros: (filtros) => dispatch({ type: 'SET_FILTROS', payload: filtros }),
    resetFiltros: () => dispatch({ type: 'RESET_FILTROS' }),
    setPaginacion: (paginacion) => dispatch({ type: 'SET_PAGINACION', payload: paginacion }),
    setMostrarFiltros: (mostrar) => dispatch({ type: 'SET_MOSTRAR_FILTROS', payload: mostrar }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setModal: (modal, estado) => dispatch({ type: 'SET_MODAL', payload: { modal, estado } }),
    setDetalle: (data, tipo) => dispatch({ type: 'SET_DETALLE', payload: { data, tipo } })
  };

  return (
    <EgresosContext.Provider value={{ ...state, ...actions }}>
      {children}
    </EgresosContext.Provider>
  );
}

export function useEgresos() {
  const context = useContext(EgresosContext);
  if (!context) {
    throw new Error('useEgresos debe ser usado dentro de EgresosProvider');
  }
  return context;
}