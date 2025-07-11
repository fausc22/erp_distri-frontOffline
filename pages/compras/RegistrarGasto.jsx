import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { GastoProvider, useGasto } from '../../context/GastosContext';
import { useRegistrarGasto } from '../../hooks/gastos/useRegistrarGasto';
import { useFormularioGasto } from '../../hooks/gastos/useFormularioGasto';

import FormularioGasto from '../../components/gastos/FormularioGasto';
import SelectorArchivosGasto from '../../components/gastos/SelectorArchivosGasto';
import { ModalConfirmacionGasto, ModalConfirmacionSalidaGasto } from '../../components/gastos/ModalesConfirmacionGasto';
import { BotonAccionesGasto } from '../../components/gastos/BotonAccionesGasto';

function RegistrarGastoContent() {
  // Usar el contexto actualizado que incluye archivos
  const { 
    formData, 
    resetForm, 
    obtenerArchivo, 
    hayArchivo, 
    limpiarArchivo,
    hasUnsavedData,
    isValidForm,
    getArchivoInfo 
  } = useGasto();
  
  const { registrarGasto, loading } = useRegistrarGasto();
  const { 
    esFormularioValido, 
    hayDatosNoGuardados, 
    obtenerResumen, 
    validarRangoMonto 
  } = useFormularioGasto();
  
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  useAuth();

  const handleConfirmarGasto = () => {
    // Validar formulario básico
    if (!esFormularioValido()) {
      toast.error('Por favor complete los campos obligatorios: Descripción, Monto y Forma de Pago');
      return;
    }
    
    // Validar rango del monto
    const validacionMonto = validarRangoMonto();
    if (!validacionMonto.valido) {
      toast.error(validacionMonto.mensaje);
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarGasto = async () => {
    try {
      // Obtener el archivo del contexto
      const archivo = obtenerArchivo();
      
      console.log('🚀 Iniciando registro de gasto:', {
        formData,
        tieneArchivo: !!archivo,
        nombreArchivo: archivo?.name
      });
      
      // Registrar gasto con archivo (si existe)
      const exito = await registrarGasto(formData, archivo);
      
      if (exito) {
        // Limpiar formulario Y archivo después del registro exitoso
        resetForm(); // Esto ahora limpia todo incluyendo el archivo
        setMostrarConfirmacion(false);
        
        // Mostrar mensaje adicional sobre el flujo
        setTimeout(() => {
          toast.success('Puede registrar otro gasto o volver al menú principal');
        }, 2000);
      }
    } catch (error) {
      console.error('💥 Error en handleRegistrarGasto:', error);
      toast.error('Error inesperado al registrar el gasto');
    }
  };

  const handleLimpiarFormulario = () => {
    // Usar la función del contexto que verifica tanto datos como archivos
    const tieneDatos = hasUnsavedData();
    
    if (tieneDatos) {
      if (confirm('¿Está seguro de que desea limpiar el formulario? Se perderán todos los datos ingresados y el archivo seleccionado.')) {
        resetForm(); // Esto limpia todo: datos + archivo
        toast.success('Formulario limpiado');
      }
    } else {
      toast.info('El formulario ya está vacío');
    }
  };

  const handleConfirmarSalida = () => {
    // Usar la función del contexto que verifica tanto datos como archivos
    const tieneDatos = hasUnsavedData();
    
    if (tieneDatos) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // Obtener resumen para el modal de confirmación
  const resumenGasto = obtenerResumen();
  
  // Agregar información del archivo al resumen
  const archivoInfo = getArchivoInfo();
  const resumenCompleto = {
    ...resumenGasto,
    tieneComprobante: hayArchivo(),
    nombreComprobante: archivoInfo?.nombre || null
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Registrar Gasto</title>
        <meta name="description" content="Registro de gastos VERTIMAR" />
      </Head>
      
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-blue-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">REGISTRAR GASTO</h1>
          <p className="text-blue-200 mt-2">Complete el formulario para registrar un nuevo gasto</p>
          <p className="text-blue-100 mt-1 text-sm">
            Todos los campos marcados con <span className="text-red-300">*</span> son obligatorios
          </p>
        </div>
        
        {/* Formulario */}
        <FormularioGasto />
        
        {/* Selector de archivos */}
        <SelectorArchivosGasto />
        
        {/* Botones de acción */}
        <BotonAccionesGasto
          onRegistrarGasto={handleConfirmarGasto}
          onLimpiarFormulario={handleLimpiarFormulario}
          onVolverMenu={handleConfirmarSalida}
          loading={loading}
          disabled={!esFormularioValido()}
        />
      </div>
      
      {/* Modal de confirmación de gasto */}
      <ModalConfirmacionGasto
        mostrar={mostrarConfirmacion}
        resumen={resumenCompleto}
        onConfirmar={handleRegistrarGasto}
        onCancelar={() => setMostrarConfirmacion(false)}
        loading={loading}
      />
      
      {/* Modal de confirmación de salida */}
      <ModalConfirmacionSalidaGasto
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function RegistrarGasto() {
  return (
    <GastoProvider>
      <RegistrarGastoContent />
    </GastoProvider>
  );
}