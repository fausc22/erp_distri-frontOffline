// context/FondosContext.js
import { createContext, useContext, useReducer } from 'react';

const FondosContext = createContext();

// Reducer para manejar el estado de fondos
function fondosReducer(state, action) {
  switch (action.type) {
    case 'SET_CUENTAS':
      return { ...state, cuentas: action.payload };
    
    case 'SET_MOVIMIENTOS':
      return { ...state, movimientos: action.payload };
    
    case 'SET_VISTA_ACTIVA':
      return { ...state, vistaActiva: action.payload };
    
    case 'SET_FILTROS':
      return { ...state, filtros: { ...state.filtros, ...action.payload } };
    
    case 'RESET_FILTROS':
      return { 
        ...state, 
        filtros: {
          cuenta_id: 'todas',
          tipo: 'todos',
          desde: '',
          hasta: '',
          busqueda: ''
        }
      };
    
    case 'SET_CUENTA_SELECCIONADA':
      return { ...state, cuentaSeleccionada: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    
    case 'SET_MODAL':
      return { 
        ...state, 
        modales: { ...state.modales, [action.payload.modal]: action.payload.estado } 
      };
    
    default:
      return state;
  }
}

const initialState = {
  cuentas: [],
  movimientos: [],
  vistaActiva: 'cuentas',
  cuentaSeleccionada: null,
  filtros: {
    cuenta_id: 'todas',
    tipo: 'todos',
    desde: '',
    hasta: '',
    busqueda: ''
  },
  loading: {
    cuentas: false,
    movimientos: false,
    operacion: false
  },
  modales: {
    cuenta: false,
    movimiento: false,
    transferencia: false,
    detalle: false
  }
};

export function FondosProvider({ children }) {
  const [state, dispatch] = useReducer(fondosReducer, initialState);

  const actions = {
    setCuentas: (cuentas) => dispatch({ type: 'SET_CUENTAS', payload: cuentas }),
    setMovimientos: (movimientos) => dispatch({ type: 'SET_MOVIMIENTOS', payload: movimientos }),
    setVistaActiva: (vista) => dispatch({ type: 'SET_VISTA_ACTIVA', payload: vista }),
    setFiltros: (filtros) => dispatch({ type: 'SET_FILTROS', payload: filtros }),
    resetFiltros: () => dispatch({ type: 'RESET_FILTROS' }),
    setCuentaSeleccionada: (cuenta) => dispatch({ type: 'SET_CUENTA_SELECCIONADA', payload: cuenta }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setModal: (modal, estado) => dispatch({ type: 'SET_MODAL', payload: { modal, estado } })
  };

  return (
    <FondosContext.Provider value={{ ...state, ...actions }}>
      {children}
    </FondosContext.Provider>
  );
}

export function useFondos() {
  const context = useContext(FondosContext);
  if (!context) {
    throw new Error('useFondos debe ser usado dentro de FondosProvider');
  }
  return context;
}