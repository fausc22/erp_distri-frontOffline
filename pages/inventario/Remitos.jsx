// pages/inventario/Remitos.jsx - IMPLEMENTACIÓN COMPLETA CON MODAL PDF
import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useRemitos } from '../../hooks/remitos/useRemitos';
import { useFiltrosRemitos } from '../../hooks/remitos/useFiltrosRemitos';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useDetalleRemito } from '../../hooks/remitos/useDetalleRemito';
import { useGenerarPDFRemito } from '../../hooks/remitos/useGenerarPDFRemito';

// Componentes
import FiltrosHistorialRemitos from '../../components/remitos/FiltrosHistorialRemitos';
import TablaRemitos from '../../components/remitos/TablaRemitos';
import { Paginacion } from '../../components/Paginacion';
import { ModalDetalleRemito } from '../../components/remitos/ModalDetalleRemito';
import { BotonAccionesRemitos } from '../../components/remitos/BotonAccionesRemitos';
import { ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';

function HistorialRemitosContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  const { user, loading: authLoading } = useAuth();

  // Hooks personalizados
  const { 
    remitos, 
    selectedRemitos, 
    loading, 
    handleSelectRemito, 
    handleSelectAllRemitos, 
    clearSelection 
  } = useRemitos();
  
  // Hook de filtros para remitos
  const { 
    filtros, 
    remitosFiltrados, 
    handleFiltrosChange, 
    limpiarFiltros 
  } = useFiltrosRemitos(remitos);
  
  const {
    datosActuales: remitosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(remitosFiltrados, 10);

  const {
    selectedRemito,
    productos,
    loading: loadingProductos,
    cargarProductosRemito,
    cerrarDetalle
  } = useDetalleRemito();

  // ✅ HOOK ADAPTADO para PDFs con modal múltiple
  const {
    // PDF Individual
    generandoPDF,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    generarPDFIndividualConModal,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF,
    
    // PDF Múltiple
    imprimiendoMultiple,
    mostrarModalPDFMultiple,
    pdfURLMultiple,
    nombreArchivoMultiple,
    tituloModalMultiple,
    subtituloModalMultiple,
    generarPDFsMultiplesConModal,
    descargarPDFMultiple,
    compartirPDFMultiple,
    cerrarModalPDFMultiple
  } = useGenerarPDFRemito();

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (remito) => {
    try {
      await cargarProductosRemito(remito);
      setMostrarModalDetalle(true);
    } catch (error) {
      toast.error('Error al cargar detalles del remito');
    }
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarDetalle();
  };

  // ✅ HANDLER ADAPTADO para generar PDF individual
  const handleGenerarPDF = async () => {
    if (!selectedRemito || productos.length === 0) {
      toast.error("Seleccione un remito con productos");
      return;
    }

    console.log('🖨️ Generando PDF individual con modal para remito:', selectedRemito.id);
    await generarPDFIndividualConModal(selectedRemito, productos);
  };

  // ✅ FUNCIÓN ADAPTADA para imprimir múltiples CON MODAL
  const handleImprimirMultiple = async () => {
    const remitosSeleccionados = remitosFiltrados.filter(remito => 
      selectedRemitos.includes(remito.id)
    );
    
    if (remitosSeleccionados.length === 0) {
      toast.error("Seleccione al menos un remito para imprimir");
      return;
    }

    console.log('🖨️ Remitos seleccionados para imprimir con modal:', remitosSeleccionados.map(r => ({ id: r.id, cliente: r.cliente_nombre })));
    
    const exito = await generarPDFsMultiplesConModal(remitosSeleccionados);
    
    if (exito) {
      clearSelection();
    }
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    setMostrarConfirmacionSalida(true);
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // Limpiar selección cuando cambian los filtros
  const handleFiltrosChangeConLimpieza = (nuevosFiltros) => {
    handleFiltrosChange(nuevosFiltros);
    clearSelection();
    cambiarPagina(1);
  };

  const handleLimpiarFiltrosConSeleccion = () => {
    limpiarFiltros();
    clearSelection();
    cambiarPagina(1);
  };

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE REMITOS</title>
        <meta name="description" content="Historial de remitos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          HISTORIAL DE REMITOS
        </h1>
        
        {/* Componente de filtros */}
        <FiltrosHistorialRemitos
          filtros={filtros}
          onFiltrosChange={handleFiltrosChangeConLimpieza}
          onLimpiarFiltros={handleLimpiarFiltrosConSeleccion}
          user={user}
          totalRemitos={remitos.length}
          remitosFiltrados={remitosFiltrados.length}
          remitosOriginales={remitos}
        />
        
        <TablaRemitos
          remitos={remitosActuales}
          selectedRemitos={selectedRemitos}
          onSelectRemito={handleSelectRemito}
          onSelectAll={() => handleSelectAllRemitos(remitosActuales)}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
        />
        
        <Paginacion
          datosOriginales={remitosFiltrados}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        {/* ✅ BOTÓN ADAPTADO CON PROPS PARA MODAL MÚLTIPLE */}
        <BotonAccionesRemitos
          selectedRemitos={selectedRemitos}
          onImprimirMultiple={handleImprimirMultiple}
          imprimiendo={imprimiendoMultiple}
          onVolverMenu={handleConfirmarSalida}
          // ✅ Props para modal PDF múltiple
          mostrarModalPDFMultiple={mostrarModalPDFMultiple}
          pdfURLMultiple={pdfURLMultiple}
          nombreArchivoMultiple={nombreArchivoMultiple}
          tituloModalMultiple={tituloModalMultiple}
          subtituloModalMultiple={subtituloModalMultiple}
          onDescargarPDFMultiple={descargarPDFMultiple}
          onCompartirPDFMultiple={compartirPDFMultiple}
          onCerrarModalPDFMultiple={cerrarModalPDFMultiple}
        />
      </div>
      
      {/* ✅ MODAL DE DETALLE ADAPTADO */}
      <ModalDetalleRemito
        remito={selectedRemito}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onGenerarPDF={handleGenerarPDF}
        generandoPDF={generandoPDF}
        // ✅ Props para modal PDF individual
        mostrarModalPDF={mostrarModalPDF}
        pdfURL={pdfURL}
        nombreArchivo={nombreArchivo}
        tituloModal={tituloModal}
        subtituloModal={subtituloModal}
        onDescargarPDF={descargarPDF}
        onCompartirPDF={compartirPDF}
        onCerrarModalPDF={cerrarModalPDF}
      />

      {/* Modal confirmación salida */}
      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function HistorialRemitos() {
  return <HistorialRemitosContent />;
}