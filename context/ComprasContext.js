import { createContext, useContext, useReducer } from 'react';

const CompraContext = createContext();

// Reducer para manejar el estado de la compra
function compraReducer(state, action) {
  switch (action.type) {
    case 'SET_PROVEEDOR':
      return { ...state, proveedor: action.payload };
    
    case 'CLEAR_PROVEEDOR':
      return { ...state, proveedor: null };
    
    case 'ADD_PRODUCTO':
      const nuevoProducto = {
        id: action.payload.producto.id,
        nombre: action.payload.producto.nombre,
        unidad_medida: action.payload.producto.unidad_medida,
        cantidad: action.payload.cantidad,
        precio_costo: action.payload.precioCosto,
        precio_venta: action.payload.precioVenta,
        subtotal: action.payload.subtotal
      };
      return {
        ...state,
        productos: [...state.productos, nuevoProducto],
        total: parseFloat((state.total + action.payload.subtotal).toFixed(2))
      };
    
    case 'REMOVE_PRODUCTO':
      const productoEliminado = state.productos[action.payload];
      return {
        ...state,
        productos: state.productos.filter((_, index) => index !== action.payload),
        total: parseFloat((state.total - productoEliminado.subtotal).toFixed(2))
      };
    
    case 'UPDATE_CANTIDAD':
      const productosActualizados = [...state.productos];
      const producto = productosActualizados[action.payload.index];
      const nuevoSubtotal = parseFloat((producto.precio_costo * action.payload.cantidad).toFixed(2));
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
    
    case 'CLEAR_COMPRA':
      return {
        proveedor: null,
        productos: [],
        total: 0
      };
    
    default:
      return state;
  }
}

const initialState = {
  proveedor: null,
  productos: [],
  total: 0
};

export function CompraProvider({ children }) {
  const [state, dispatch] = useReducer(compraReducer, initialState);

  const actions = {
    setProveedor: (proveedor) => dispatch({ type: 'SET_PROVEEDOR', payload: proveedor }),
    clearProveedor: () => dispatch({ type: 'CLEAR_PROVEEDOR' }),
    addProducto: (producto, cantidad, precioCosto, precioVenta, subtotal) => 
      dispatch({ type: 'ADD_PRODUCTO', payload: { producto, cantidad, precioCosto, precioVenta, subtotal } }),
    removeProducto: (index) => dispatch({ type: 'REMOVE_PRODUCTO', payload: index }),
    updateCantidad: (index, cantidad) => 
      dispatch({ type: 'UPDATE_CANTIDAD', payload: { index, cantidad } }),
    clearCompra: () => dispatch({ type: 'CLEAR_COMPRA' })
  };

  return (
    <CompraContext.Provider value={{ ...state, ...actions }}>
      {children}
    </CompraContext.Provider>
  );
}

export function useCompra() {
  const context = useContext(CompraContext);
  if (!context) {
    throw new Error('useCompra debe ser usado dentro de CompraProvider');
  }
  return context;
}