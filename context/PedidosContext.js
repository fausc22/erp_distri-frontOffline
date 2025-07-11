// context/PedidosContext.js
import { createContext, useContext, useReducer } from 'react';

const PedidosContext = createContext();

// Reducer para manejar el estado de pedidos
function pedidosReducer(state, action) {
  switch (action.type) {
    case 'SET_CLIENTE':
      return { ...state, cliente: action.payload };
    
    case 'CLEAR_CLIENTE':
      return { ...state, cliente: null };
    
    case 'ADD_PRODUCTO':
      const subtotalSinIva = parseFloat((action.payload.cantidad * action.payload.precio).toFixed(2));
      const porcentajeIva = action.payload.iva || 21; // Viene de la DB como porcentaje
      const ivaCalculado = parseFloat((subtotalSinIva * (porcentajeIva / 100)).toFixed(2));
      
      const nuevoProducto = {
        id: action.payload.id,
        nombre: action.payload.nombre,
        unidad_medida: action.payload.unidad_medida || 'Unidad',
        cantidad: action.payload.cantidad,
        precio: parseFloat(action.payload.precio),
        porcentaje_iva: porcentajeIva, // Guardar el porcentaje original
        iva_calculado: ivaCalculado,   // IVA en pesos
        subtotal: subtotalSinIva       // Subtotal sin IVA
      };
      return {
        ...state,
        productos: [...state.productos, nuevoProducto]
      };
    
    case 'REMOVE_PRODUCTO':
      return {
        ...state,
        productos: state.productos.filter((_, index) => index !== action.payload)
      };
    
    case 'UPDATE_CANTIDAD':
      const productosActualizados = [...state.productos];
      const producto = productosActualizados[action.payload.index];
      
      // Recalcular subtotal e IVA con la nueva cantidad
      const nuevoSubtotal = parseFloat((producto.precio * action.payload.cantidad).toFixed(2));
      const nuevoIvaCalculado = parseFloat((nuevoSubtotal * (producto.porcentaje_iva / 100)).toFixed(2));
      
      productosActualizados[action.payload.index] = {
        ...producto,
        cantidad: action.payload.cantidad,
        subtotal: nuevoSubtotal,
        iva_calculado: nuevoIvaCalculado
      };
      
      return {
        ...state,
        productos: productosActualizados
      };
    
    case 'SET_OBSERVACIONES':
      return { ...state, observaciones: action.payload };
    
    case 'CLEAR_PEDIDO':
      return {
        cliente: null,
        productos: [],
        observaciones: ''
      };
    
    default:
      return state;
  }
}

const initialState = {
  cliente: null,
  productos: [],
  observaciones: ''
};

export function PedidosProvider({ children }) {
  const [state, dispatch] = useReducer(pedidosReducer, initialState);

  // Calcular totales dinámicamente
  const subtotal = state.productos.reduce((acc, prod) => acc + prod.subtotal, 0); // Suma subtotales SIN IVA
  const totalIva = state.productos.reduce((acc, prod) => acc + prod.iva_calculado, 0); // Suma IVAs calculados
  const total = subtotal + totalIva; // Total con IVA incluido
  const totalProductos = state.productos.reduce((acc, prod) => acc + prod.cantidad, 0);

  const actions = {
    // Acciones del cliente
    setCliente: (cliente) => dispatch({ type: 'SET_CLIENTE', payload: cliente }),
    clearCliente: () => dispatch({ type: 'CLEAR_CLIENTE' }),
    
    // Acciones de productos
    addProducto: (producto, cantidad) => {
      const productoConCantidad = {
        ...producto,
        cantidad: cantidad || 1
        // El porcentaje de IVA ya viene en producto.iva desde la DB
      };
      dispatch({ type: 'ADD_PRODUCTO', payload: productoConCantidad });
    },
    
    removeProducto: (index) => dispatch({ type: 'REMOVE_PRODUCTO', payload: index }),
    
    updateCantidad: (index, cantidad) => {
      const cantidadValida = Math.max(1, cantidad);
      dispatch({ type: 'UPDATE_CANTIDAD', payload: { index, cantidad: cantidadValida } });
    },
    
    // Acciones de observaciones
    setObservaciones: (observaciones) => dispatch({ type: 'SET_OBSERVACIONES', payload: observaciones }),
    
    // Limpiar todo
    clearPedido: () => dispatch({ type: 'CLEAR_PEDIDO' }),
    
    // Obtener datos para envío
    getDatosPedido: () => ({
      cliente: state.cliente,
      productos: state.productos,
      observaciones: state.observaciones,
      subtotal,
      totalIva,
      total,
      totalProductos
    })
  };

  return (
    <PedidosContext.Provider value={{ 
      ...state, 
      subtotal,
      totalIva,
      total,
      totalProductos,
      ...actions 
    }}>
      {children}
    </PedidosContext.Provider>
  );
}

export function usePedidosContext() {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidosContext debe ser usado dentro de PedidosProvider');
  }
  return context;
}