// pages/finanzas/ingresos.jsx - Versión Refactorizada
import { useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Context y Hooks
import { IngresosProvider, useIngresos } from '../../context/IngresosContext';
import { useHistorialIngresos } from '../../hooks/ingresos/useHistorialIngresos';
import { useDetalleIngresos } from '../../hooks/ingresos/useDetalleIngresos';
import { useNuevoIngreso } from '../../hooks/ingresos/useNuevoIngreso';
import { useCuentasIngresos } from '../../hooks/ingresos/useCuentasIngresos';

// Componentes
import BarraAccionesIngresos from '../../components/ingresos/BarraAccionesIngresos';
import FiltrosIngresos from '../../components/ingresos/FiltrosIngresos';
import TablaIngresos from '../../components/ingresos/TablaIngresos';
import ModalNuevoIngreso from '../../components/ingresos/ModalNuevoIngreso';
import ModalDetalleIngreso from '../../components/ingresos/ModalDetalleIngreso';
import { Paginacion } from '../../components/Paginacion'; // Reutilizando componente existente

function HistorialIngresosContent() {
  const {
    mostrarFiltros,
    loading,
    modales,
    detalle,
    setMostrarFiltros
  } = useIngresos();

  // Hooks para operaciones
  const {
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
  } = useHistorialIngresos();

  const {
    verDetalle,
    cerrarDetalle,
    imprimirDetalle
  } = useDetalleIngresos();

  const {
    formData,
    registrarIngreso,
    handleInputChange,
    abrirModal,
    cerrarModal
  } = useNuevoIngreso();

  const {
    cuentas,
    cargarCuentas
  } = useCuentasIngresos();

  useAuth();

  // Cargar datos iniciales
  useEffect(() => {
    cargarIngresos();
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
    cargarIngresos();
  };

  // Handler para registrar ingreso
  const handleRegistrarIngreso = async () => {
    const exito = await registrarIngreso();
    if (exito) {
      await cargarIngresos(); // Recargar lista
    }
  };

  // Handler para imprimir
  const handleImprimir = (ingreso) => {
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
        <title>VERTIMAR | HISTORIAL DE INGRESOS</title>
        <meta name="description" content="Historial de ingresos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE INGRESOS</h1>
        
        {/* Barra de acciones */}
        <BarraAccionesIngresos
          busqueda={filtros.busqueda}
          mostrarFiltros={mostrarFiltros}
          onBusquedaChange={handleBusquedaChange}
          onBuscar={handleBuscar}
          onToggleFiltros={handleToggleFiltros}
          onNuevoIngreso={abrirModal}
          onActualizar={handleActualizar}
        />
        
        {/* Filtros avanzados */}
        <FiltrosIngresos
          mostrar={mostrarFiltros}
          filtros={filtros}
          cuentas={cuentas}
          onFiltroChange={handleFiltroChange}
          onAplicarFiltros={aplicarFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />
        
        {/* Tabla de ingresos */}
        <TablaIngresos
          ingresos={ingresos}
          totalIngresos={totalIngresos}
          loading={loading.ingresos}
          onVerDetalle={verDetalle}
          onImprimir={handleImprimir}
        />
        
        {/* Paginación - Reutilizando componente existente */}
        {ingresos.length > 0 && (
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
      
      {/* Modal para nuevo ingreso */}
      <ModalNuevoIngreso
        mostrar={modales.nuevoIngreso}
        formData={formData}
        cuentas={cuentas}
        loading={loading.operacion}
        onInputChange={handleInputChange}
        onRegistrar={handleRegistrarIngreso}
        onCerrar={cerrarModal}
      />
      
      {/* Modal de detalle */}
      <ModalDetalleIngreso
        mostrar={modales.detalle}
        detalle={detalle}
        onCerrar={cerrarDetalle}
        onImprimir={imprimirDetalle}
      />
    </div>
  );
}

export default function HistorialIngresos() {
  return (
    <IngresosProvider>
      <HistorialIngresosContent />
    </IngresosProvider>
  );
}