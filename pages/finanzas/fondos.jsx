// pages/finanzas/fondos.jsx - Versión Refactorizada
import { useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Context y Hooks
import { FondosProvider, useFondos } from '../../context/FondosContext';
import { useCuentas } from '../../hooks/fondos/useCuentas';
import { useMovimientos } from '../../hooks/fondos/useMovimientos';
import { useTransferencias } from '../../hooks/fondos/useTransferencias';

// Componentes
import TablaCuentas from '../../components/fondos/TablaCuentas';
import TablaMovimientos from '../../components/fondos/TablaMovimientos';
import FiltrosMovimientos from '../../components/fondos/FiltrosMovimientos';
import AccionesRapidas from '../../components/fondos/AccionesRapidas';
import ModalCuenta from '../../components/fondos/ModalCuenta';
import ModalMovimiento from '../../components/fondos/ModalMovimiento';
import ModalTransferencia from '../../components/fondos/ModalTransferencia';

function FondosContent() {
  const {
    vistaActiva,
    cuentaSeleccionada,
    loading,
    modales,
    setVistaActiva,
    setModal
  } = useFondos();

  // Hooks para operaciones
  const {
    cuentas,
    formData: formDataCuenta,
    totalSaldos,
    cargarCuentas,
    crearCuenta,
    handleInputChange: handleCuentaChange,
    resetForm: resetCuentaForm
  } = useCuentas();

  const {
    movimientos,
    formData: formDataMovimiento,
    filtros,
    cargarMovimientos,
    registrarMovimiento,
    handleInputChange: handleMovimientoChange,
    handleFiltroChange,
    aplicarFiltros,
    limpiarFiltros,
    resetForm: resetMovimientoForm,
    precargarFormulario
  } = useMovimientos();

  const {
    formData: formDataTransferencia,
    realizarTransferencia,
    handleInputChange: handleTransferenciaChange,
    resetForm: resetTransferenciaForm,
    precargarCuentaOrigen
  } = useTransferencias();

  useAuth();

  // Cargar datos al iniciar
  useEffect(() => {
    cargarCuentas();
    cargarMovimientos();
  }, []);

  // Handlers para modales
  const handleOpenModal = (modal) => {
    setModal(modal, true);
  };

  const handleCloseModal = (modal) => {
    setModal(modal, false);
    // Reset formularios al cerrar
    if (modal === 'cuenta') resetCuentaForm();
    if (modal === 'movimiento') resetMovimientoForm();
    if (modal === 'transferencia') resetTransferenciaForm();
  };

  // Handlers para acciones de cuentas
  const handleIngreso = (cuentaId = '') => {
    if (cuentaId) {
      precargarFormulario(cuentaId, 'INGRESO');
    } else {
      resetMovimientoForm();
    }
    handleOpenModal('movimiento');
  };

  const handleEgreso = (cuentaId = '') => {
    if (cuentaId) {
      precargarFormulario(cuentaId, 'EGRESO');
    } else {
      resetMovimientoForm();
      handleMovimientoChange({ target: { name: 'tipo', value: 'EGRESO' } });
    }
    handleOpenModal('movimiento');
  };

  const handleTransferencia = (cuentaId = '') => {
    if (cuentaId) {
      precargarCuentaOrigen(cuentaId);
    } else {
      resetTransferenciaForm();
    }
    handleOpenModal('transferencia');
  };

  const handleVerDetalleCuenta = async (cuenta) => {
    // Implementar lógica para ver detalle de cuenta
    toast.info('Funcionalidad de detalle de cuenta pendiente');
  };

  // Handlers para guardar
  const handleGuardarCuenta = async () => {
    const exito = await crearCuenta();
    if (exito) {
      handleCloseModal('cuenta');
    }
  };

  const handleGuardarMovimiento = async () => {
    const exito = await registrarMovimiento();
    if (exito) {
      await cargarCuentas(); // Actualizar saldos
      handleCloseModal('movimiento');
    }
  };

  const handleGuardarTransferencia = async () => {
    const exito = await realizarTransferencia();
    if (exito) {
      await cargarCuentas(); // Actualizar saldos
      await cargarMovimientos(); // Actualizar movimientos
      handleCloseModal('transferencia');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | TESORERÍA</title>
        <meta name="description" content="Gestión de tesorería en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">GESTIÓN DE FONDOS</h1>
        
        {/* Pestañas de navegación */}
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-medium transition-colors ${
              vistaActiva === 'cuentas' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-green-500'
            }`}
            onClick={() => setVistaActiva('cuentas')}
          >
            Cuentas y Saldos
          </button>
          <button 
            className={`py-2 px-4 font-medium transition-colors ${
              vistaActiva === 'movimientos' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
            onClick={() => setVistaActiva('movimientos')}
          >
            Historial de Movimientos
          </button>
        </div>
        
        {/* Vista de Cuentas y Saldos */}
        {vistaActiva === 'cuentas' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cuentas Disponibles</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleOpenModal('cuenta')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center transition-colors"
                >
                  <span className="mr-1">+</span> Nueva Cuenta
                </button>
                <button 
                  onClick={cargarCuentas}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center transition-colors"
                >
                  <span className="mr-1">⟳</span> Actualizar
                </button>
              </div>
            </div>
            
            <TablaCuentas
              cuentas={cuentas}
              totalSaldos={totalSaldos}
              loading={loading.cuentas}
              onIngreso={handleIngreso}
              onEgreso={handleEgreso}
              onTransferencia={handleTransferencia}
              onVerDetalle={handleVerDetalleCuenta}
            />
            
            <AccionesRapidas
              onIngreso={() => handleIngreso()}
              onEgreso={() => handleEgreso()}
              onTransferencia={() => handleTransferencia()}
            />
          </div>
        )}
        
        {/* Vista de Historial de Movimientos */}
        {vistaActiva === 'movimientos' && (
          <div>
            <FiltrosMovimientos
              cuentas={cuentas}
              filtros={filtros}
              onFiltroChange={handleFiltroChange}
              onAplicarFiltros={aplicarFiltros}
              onLimpiarFiltros={limpiarFiltros}
            />
            
            <TablaMovimientos
              movimientos={movimientos}
              cuentas={cuentas}
              loading={loading.movimientos}
            />
          </div>
        )}
      </div>
      
      {/* Modales */}
      <ModalCuenta
        mostrar={modales.cuenta}
        formData={formDataCuenta}
        loading={loading.operacion}
        onInputChange={handleCuentaChange}
        onGuardar={handleGuardarCuenta}
        onCerrar={() => handleCloseModal('cuenta')}
      />
      
      <ModalMovimiento
        mostrar={modales.movimiento}
        cuentas={cuentas}
        formData={formDataMovimiento}
        loading={loading.operacion}
        onInputChange={handleMovimientoChange}
        onGuardar={handleGuardarMovimiento}
        onCerrar={() => handleCloseModal('movimiento')}
      />
      
      <ModalTransferencia
        mostrar={modales.transferencia}
        cuentas={cuentas}
        formData={formDataTransferencia}
        loading={loading.operacion}
        onInputChange={handleTransferenciaChange}
        onGuardar={handleGuardarTransferencia}
        onCerrar={() => handleCloseModal('transferencia')}
      />
    </div>
  );
}

export default function Fondos() {
  return (
    <FondosProvider>
      <FondosContent />
    </FondosProvider>
  );
}