// pages/finanzas/egresos.jsx - Versión Refactorizada
import { useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Context y Hooks
import { EgresosProvider, useEgresos } from '../../context/EgresosContext';
import { useHistorialEgresos } from '../../hooks/egresos/useHistorialEgresos';
import { useDetalleEgresos } from '../../hooks/egresos/useDetalleEgresos';
import { useNuevoEgreso } from '../../hooks/egresos/useNuevoEgreso';
import { useCuentasEgresos } from '../../hooks/egresos/useCuentasEgresos';

// Componentes
import BarraAccionesEgresos from '../../components/egresos/BarraAccionesEgresos';
import FiltrosEgresos from '../../components/egresos/FiltrosEgresos';
import TablaEgresos from '../../components/egresos/TablaEgresos';
import ModalNuevoEgreso from '../../components/egresos/ModalNuevoEgreso';
import ModalDetalleEgreso from '../../components/egresos/ModalDetalleEgreso';
import { Paginacion } from '../../components/Paginacion'; // Reutilizando componente existente

function HistorialEgresosContent() {
  const {
    mostrarFiltros,
    loading,
    modales,
    detalle,
    setMostrarFiltros
  } = useEgresos();

  // Hooks para operaciones
  const {
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
  } = useHistorialEgresos();

  const {
    verDetalle,
    cerrarDetalle,
    imprimirDetalle
  } = useDetalleEgresos();

  const {
    formData,
    registrarEgreso,
    handleInputChange,
    abrirModal,
    cerrarModal
  } = useNuevoEgreso();

  const {
    cuentas,
    cargarCuentas
  } = useCuentasEgresos();

  useAuth();

  // Cargar datos iniciales
  useEffect(() => {
    cargarEgresos();
    cargarCuentas();
  }, []);

  // Handlers para barra de acciones
  const handleBusquedaChange = (e) => {
    handleFiltroChange('busqueda', e.target.value);
  };

  const handleBuscar = () => {
    aplicarFiltros();
  };

  const handleToggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const handleActualizar = () => {
    cargarEgresos();
  };

  // Handler para registrar egreso
  const handleRegistrarEgreso = async () => {
    const exito = await registrarEgreso();
    if (exito) {
      await cargarEgresos(); // Recargar lista
    }
  };

  // Handler para imprimir
  const handleImprimir = (egreso) => {
    toast.info("Funcionalidad de impresión en desarrollo");
  };

  // Calcular índices para paginación
  const indexOfPrimero = (paginacion.paginaActual - 1) * paginacion.registrosPorPagina;
  const indexOfUltimo = Math.min(
    indexOfPrimero + paginacion.registrosPorPagina, 
    totalRegistros
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE EGRESOS</title>
        <meta name="description" content="Historial de egresos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE EGRESOS</h1>
        
        {/* Barra de acciones */}
        <BarraAccionesEgresos
          busqueda={filtros.busqueda}
          mostrarFiltros={mostrarFiltros}
          onBusquedaChange={handleBusquedaChange}
          onBuscar={handleBuscar}
          onToggleFiltros={handleToggleFiltros}
          onNuevoEgreso={abrirModal}
          onActualizar={handleActualizar}
        />
        
        {/* Filtros avanzados */}
        <FiltrosEgresos
          mostrar={mostrarFiltros}
          filtros={filtros}
          cuentas={cuentas}
          onFiltroChange={handleFiltroChange}
          onAplicarFiltros={aplicarFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />
        
        {/* Tabla de egresos */}
        <TablaEgresos
          egresos={egresos}
          totalEgresos={totalEgresos}
          loading={loading.egresos}
          onVerDetalle={verDetalle}
          onImprimir={handleImprimir}
        />
        
        {/* Paginación - Reutilizando componente existente */}
        {egresos.length > 0 && (
          <Paginacion
            datosOriginales={{ length: totalRegistros }} // Simular array para compatibilidad
            paginaActual={paginacion.paginaActual}
            registrosPorPagina={paginacion.registrosPorPagina}
            totalPaginas={totalPaginas}
            indexOfPrimero={indexOfPrimero}
            indexOfUltimo={indexOfUltimo}
            onCambiarPagina={cambiarPagina}
            onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
          />
        )}
      </div>
      
      {/* Modal para nuevo egreso */}
      <ModalNuevoEgreso
        mostrar={modales.nuevoEgreso}
        formData={formData}
        cuentas={cuentas}
        loading={loading.operacion}
        onInputChange={handleInputChange}
        onRegistrar={handleRegistrarEgreso}
        onCerrar={cerrarModal}
      />
      
      {/* Modal de detalle */}
      <ModalDetalleEgreso
        mostrar={modales.detalle}
        detalle={detalle}
        onCerrar={cerrarDetalle}
        onImprimir={imprimirDetalle}
      />
    </div>
  );
}

export default function HistorialEgresos() {
  return (
    <EgresosProvider>
      <HistorialEgresosContent />
    </EgresosProvider>
  );
}