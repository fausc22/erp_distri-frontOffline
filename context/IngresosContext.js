// context/IngresosContext.js
import { createContext, useContext, useReducer } from 'react';

const IngresosContext = createContext();

// Reducer para manejar el estado de ingresos
function ingresosReducer(state, action) {
  switch (action.type) {
    case 'SET_INGRESOS':
      return { ...state, ingresos: action.payload };
    
    case 'SET_CUENTAS':
      return { ...state, cuentas: action.payload };
    
    case 'SET_TOTAL_INGRESOS':
      return { ...state, totalIngresos: action.payload };
    
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
  ingresos: [],
  cuentas: [],
  totalIngresos: 0,
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
    ingresos: false,
    cuentas: false,
    operacion: false
  },
  modales: {
    nuevoIngreso: false,
    detalle: false
  },
  detalle: {
    data: null,
    tipo: ''
  }
};

export function IngresosProvider({ children }) {
  const [state, dispatch] = useReducer(ingresosReducer, initialState);

  const actions = {
    setIngresos: (ingresos) => dispatch({ type: 'SET_INGRESOS', payload: ingresos }),
    setCuentas: (cuentas) => dispatch({ type: 'SET_CUENTAS', payload: cuentas }),
    setTotalIngresos: (total) => dispatch({ type: 'SET_TOTAL_INGRESOS', payload: total }),
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
    <IngresosContext.Provider value={{ ...state, ...actions }}>
      {children}
    </IngresosContext.Provider>
  );
}

export function useIngresos() {
  const context = useContext(IngresosContext);
  if (!context) {
    throw new Error('useIngresos debe ser usado dentro de IngresosProvider');
  }
  return context;
}