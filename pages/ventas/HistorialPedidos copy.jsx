// pages/HistorialPedidos.jsx - Versión con filtrado por rol
import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialPedidos } from '../../hooks/pedidos/useHistorialPedidos';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarPedido } from '../../hooks/pedidos/useEditarPedido';
import { useGenerarPDFPedido } from 'hooks/pedidos/useGenerarPdfPedido';

// Componentes
import TablaPedidos from '../../components/pedidos/TablaPedidos';
import { Paginacion } from '../../components/Paginacion';
import { 
  ModalDetallePedido, 
  ModalEditarProductoPedido, 
  ModalEliminarProductoPedido, 
  ModalAgregarProductoPedido 
} from '../../components/pedidos/ModalesHistorialPedidos';
import { ModalConfirmacionSalidaPedidos } from '../../components/pedidos/ModalesConfirmacion';
import { BotonAccionesPedidos } from '../../components/pedidos/BotonAccionesPedidos';

function HistorialPedidosContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalAgregarProducto, setMostrarModalAgregarProducto] = useState(false);
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  // NEW: State for the Facturacion Modal
  const [mostrarModalFacturacion, setMostrarModalFacturacion] = useState(false);

  // Estados para productos en edición
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoEliminando, setProductoEliminando] = useState(null);

  // Hook de autenticación
  const { user, loading: authLoading } = useAuth();

  const {
      generandoPDF,
      generarPDFPedido
    } = useGenerarPDFPedido();

  // Determinar si debe filtrar por empleado
  // Solo los GERENTES pueden ver todos los pedidos, los demás solo ven los suyos
  const filtroEmpleado = user && user.rol !== 'GERENTE' ? user.id : null;

  console.log('🔍 Filtro aplicado:', {
    usuario: user?.nombre,
    rol: user?.rol,
    filtroEmpleado: filtroEmpleado,
    verTodos: user?.rol === 'GERENTE'
  });

  // Hooks personalizados
  const { 
    pedidos, 
    selectedPedidos, 
    loading, 
    handleSelectPedido, 
    handleSelectAllPedidos, 
    clearSelection,
    cambiarEstadoMultiple,
    eliminarMultiple,
    getEstadisticas
  } = useHistorialPedidos(filtroEmpleado); // Aquí pasamos el filtro
  
  const {
    datosActuales: pedidosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(pedidos, 10);

  const {
    selectedPedido,
    productos,
    loading: loadingProductos,
    cargarProductosPedido,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    cerrarEdicion
  } = useEditarPedido();

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (pedido) => {
    
    try {
      
      await cargarProductosPedido(pedido);
      
      setMostrarModalDetalle(true);
    } catch (error) {
      
      toast.error('Error al cargar detalles del pedido');
    }
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  // Handlers para productos
  const handleAgregarProducto = () => {
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalAgregarProducto(true), 300);
  };

  const handleEditarProducto = (producto) => {
    setProductoEditando({ ...producto });
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalEditarProducto(true), 300);
  };

  const handleEliminarProducto = (producto) => {
    setProductoEliminando(producto);
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalEliminarProducto(true), 300);
  };

  // Handlers para modales de productos
  const handleCloseModalAgregarProducto = () => {
    setMostrarModalAgregarProducto(false);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleCloseModalEditarProducto = () => {
    setMostrarModalEditarProducto(false);
    setProductoEditando(null);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleCloseModalEliminarProducto = () => {
    setMostrarModalEliminarProducto(false);
    setProductoEliminando(null);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  // Handlers para acciones de productos
  const handleConfirmarAgregarProducto = async (producto, cantidad) => {
    const exito = await agregarProducto(producto, cantidad);
    if (exito) {
      handleCloseModalAgregarProducto();
    }
    return exito;
  };

  const handleConfirmarEditarProducto = async () => {
    if (!productoEditando) return;
    
    const exito = await actualizarProducto(productoEditando);
    if (exito) {
      handleCloseModalEditarProducto();
    }
  };

  const handleConfirmarEliminarProducto = async () => {
    if (!productoEliminando) return;
    
    const exito = await eliminarProducto(productoEliminando);
    if (exito) {
      handleCloseModalEliminarProducto();
    }
  };

  const handleGenerarPDF = async () => {
    if (!selectedPedido || productos.length === 0) {
      toast.error("Seleccione un pedido con productos");
      return;
    }
     
    await generarPDFPedido(selectedPedido, productos);
  };

  // Handler para cambiar estado del pedido individual (desde el modal detalle)
  const handleCambiarEstadoPedido = async (nuevoEstado) => {
    if (!selectedPedido) {
      toast.error("No hay pedido seleccionado");
      return;
    }

    try {
      // Temporalmente seleccionar este pedido para la operación
      const pedidoAnterior = selectedPedidos;
      handleSelectPedido(selectedPedido.id); // This will add the selectedPedido to selectedPedidos
      
      const exito = await cambiarEstadoMultiple(nuevoEstado);
      if (exito) {
        setMostrarModalDetalle(false);
        toast.success(`Pedido #${selectedPedido.id} marcado como ${nuevoEstado}`);
        // Restore previous selection
        clearSelection();
        pedidoAnterior.forEach(id => handleSelectPedido(id)); // This might re-select the original ones
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado del pedido');
    }
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    setMostrarConfirmacionSalida(true);
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // Handler para cambio de estado múltiple
  const handleCambiarEstadoMultiple = async (nuevoEstado) => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido');
      return;
    }
    
    const exito = await cambiarEstadoMultiple(nuevoEstado);
    if (exito) {
      clearSelection();
    }
  };

  // Handler para eliminar múltiples
  const handleEliminarMultiple = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido para eliminar');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar ${selectedPedidos.length} pedidos? Esta acción no se puede deshacer.`)) {
      const exito = await eliminarMultiple();
      if (exito) {
        clearSelection();
      }
    }
  };

  // Handler para exportar pedidos seleccionados
  const handleExportarPedidos = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido para exportar');
      return;
    }
    
    toast.info('Generando exportación de pedidos...');
    // Aquí implementarías la lógica de exportación
    console.log('Pedidos seleccionados para exportar:', selectedPedidos);
  };

  const estadisticas = getEstadisticas();

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Función para obtener el título dinámico
  const getTitulo = () => {
    if (user?.rol === 'GERENTE') {
      return 'HISTORIAL DE PEDIDOS - TODOS LOS PEDIDOS';
    }
    return `HISTORIAL DE PEDIDOS - ${user?.nombre?.toUpperCase() || 'MIS PEDIDOS'}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE PEDIDOS</title>
        <meta name="description" content="Historial de pedidos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          {getTitulo()}
        </h1>
        
        
        
        <TablaPedidos
          pedidos={pedidosActuales}
          selectedPedidos={selectedPedidos}
          onSelectPedido={handleSelectPedido}
          onSelectAll={() => handleSelectAllPedidos(pedidosActuales)}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
          mostrarPermisos={true}
          isPedidoFacturado={selectedPedido?.estado === 'Facturado'}
        />
        
        <Paginacion
          datosOriginales={pedidos}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        {/* BOTONES CORREGIDOS */}
        <BotonAccionesPedidos
          contexto="historial"
          selectedPedidos={selectedPedidos}
          onCambiarEstado={handleCambiarEstadoMultiple}
          onEliminarMultiple={handleEliminarMultiple}
          onExportarPedidos={handleExportarPedidos}
          onVolverMenu={handleConfirmarSalida}
          loading={loading}
          mostrarEstadisticas={true}
          estadisticas={estadisticas}
        />
      </div>
      
      {/* Modal de detalles de pedido */}
      <ModalDetallePedido
        pedido={selectedPedido}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onAgregarProducto={handleAgregarProducto}
        onEditarProducto={handleEditarProducto}
        onEliminarProducto={handleEliminarProducto}
        onCambiarEstado={handleCambiarEstadoPedido}
        onGenerarPDF={handleGenerarPDF}
        generandoPDF={generandoPDF}
        // PASAR LOS ESTADOS Y FUNCIONES PARA EL MODAL DE FACTURACIÓN
        mostrarModalFacturacion={mostrarModalFacturacion}
        setMostrarModalFacturacion={setMostrarModalFacturacion}
        isPedidoFacturado={selectedPedido?.estado === 'Facturado'}
      />

      {/* Modal agregar producto */}
      <ModalAgregarProductoPedido
        mostrar={mostrarModalAgregarProducto}
        onClose={handleCloseModalAgregarProducto}
        onAgregarProducto={handleConfirmarAgregarProducto}
      />

      {/* Modal editar producto */}
      <ModalEditarProductoPedido
        producto={productoEditando}
        onClose={handleCloseModalEditarProducto}
        onGuardar={handleConfirmarEditarProducto}
        onChange={setProductoEditando}
      />

      {/* Modal eliminar producto */}
      <ModalEliminarProductoPedido
        producto={productoEliminando}
        onClose={handleCloseModalEliminarProducto}
        onConfirmar={handleConfirmarEliminarProducto}
      />

      {/* Modal confirmación salida */}
      <ModalConfirmacionSalidaPedidos
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function HistorialPedidos() {
  return <HistorialPedidosContent />;
}