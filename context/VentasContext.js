
import { createContext, useContext, useReducer } from 'react';

const VentaContext = createContext();

// Reducer para manejar el estado de la venta
function ventaReducer(state, action) {
  switch (action.type) {
    case 'SET_CLIENTE':
      return { ...state, cliente: action.payload };
    
    case 'CLEAR_CLIENTE':
      return { ...state, cliente: null };
    
    case 'ADD_PRODUCTO':
      const nuevoProducto = {
        ...action.payload.producto,
        cantidad: action.payload.cantidad,
        subtotal: action.payload.subtotal
      };
      return {
        ...state,
        productos: [...state.productos, nuevoProducto],
        total: state.total + action.payload.subtotal
      };
    
    case 'REMOVE_PRODUCTO':
      const productoEliminado = state.productos[action.payload];
      return {
        ...state,
        productos: state.productos.filter((_, index) => index !== action.payload),
        total: state.total - productoEliminado.subtotal
      };
    
    case 'UPDATE_CANTIDAD':
      const productosActualizados = [...state.productos];
      const producto = productosActualizados[action.payload.index];
      const nuevoSubtotal = parseFloat((producto.precio * action.payload.cantidad).toFixed(2));
      const diferencia = nuevoSubtotal - producto.subtotal;
      
      productosActualizados[action.payload.index] = {
        ...producto,
        cantidad: action.payload.cantidad,
        subtotal: nuevoSubtotal
      };
      
      return {
        ...state,
        productos: productosActualizados,
        total: parseFloat((state.total + diferencia).toFixed(2))
      };
    
    case 'CLEAR_VENTA':
      return {
        cliente: null,
        productos: [],
        total: 0
      };
    
    default:
      return state;
  }
}

const initialState = {
  cliente: null,
  productos: [],
  total: 0
};

export function VentaProvider({ children }) {
  const [state, dispatch] = useReducer(ventaReducer, initialState);

  const actions = {
    setCliente: (cliente) => dispatch({ type: 'SET_CLIENTE', payload: cliente }),
    clearCliente: () => dispatch({ type: 'CLEAR_CLIENTE' }),
    addProducto: (producto, cantidad, subtotal) => 
      dispatch({ type: 'ADD_PRODUCTO', payload: { producto, cantidad, subtotal } }),
    removeProducto: (index) => dispatch({ type: 'REMOVE_PRODUCTO', payload: index }),
    updateCantidad: (index, cantidad) => 
      dispatch({ type: 'UPDATE_CANTIDAD', payload: { index, cantidad } }),
    clearVenta: () => dispatch({ type: 'CLEAR_VENTA' })
  };

  return (
    <VentaContext.Provider value={{ ...state, ...actions }}>
      {children}
    </VentaContext.Provider>
  );
}

export function useVenta() {
  const context = useContext(VentaContext);
  if (!context) {
    throw new Error('useVenta debe ser usado dentro de VentaProvider');
  }
  return context;
}