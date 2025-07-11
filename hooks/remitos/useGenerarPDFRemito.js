import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';
import { useGenerarPDFUniversal } from '../shared/useGenerarPDFUniversal';

export function useGenerarPDFRemito() {
  const [imprimiendoMultiple, setImprimiendoMultiple] = useState(false);

  // Hook unificado para PDF individual
  const {
    loading: generandoPDF,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    generarPDF,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF
  } = useGenerarPDFUniversal();

  // ✅ NUEVO Hook para PDFs múltiples con modal
  const {
    loading: loadingMultiple,
    pdfURL: pdfURLMultiple,
    mostrarModalPDF: mostrarModalPDFMultiple,
    nombreArchivo: nombreArchivoMultiple,
    tituloModal: tituloModalMultiple,
    subtituloModal: subtituloModalMultiple,
    generarPDF: generarPDFMultipleInterno,
    descargarPDF: descargarPDFMultiple,
    compartirPDF: compartirPDFMultiple,
    cerrarModalPDF: cerrarModalPDFMultiple
  } = useGenerarPDFUniversal();

  // Función para generar PDF individual con modal
  const generarPDFIndividualConModal = async (remito, productos) => {
    if (!remito || productos.length === 0) {
      toast.error("Seleccione un remito con productos");
      return false;
    }

    const apiCall = () => axiosAuth.post(
      `/productos/generarpdf-remito`,
      { remito, productos },
      { responseType: "blob" }
    );

    const configuracion = {
      nombreArchivo: `Remito_${remito.cliente_nombre}_${remito.id}.pdf`,
      titulo: 'Remito Generado',
      subtitulo: `Remito #${remito.id} - ${remito.cliente_nombre}`,
      mensajeExito: 'Remito generado con éxito',
      mensajeError: 'Error al generar el remito'
    };

    return await generarPDF(apiCall, configuracion);
  };

  // ✅ NUEVA FUNCIÓN: Generar múltiples PDFs CON MODAL
  const generarPDFsMultiplesConModal = async (remitosSeleccionados) => {
    if (!remitosSeleccionados || remitosSeleccionados.length === 0) {
      toast.error("Seleccione al menos un remito para imprimir");
      return false;
    }

    const remitosIds = remitosSeleccionados.map(remito => {
      if (typeof remito === 'object' && remito !== null) {
        return remito.id;
      }
      return remito;
    }).filter(id => id && !isNaN(parseInt(id)));

    if (remitosIds.length === 0) {
      toast.error("No se encontraron IDs válidos de remitos");
      return false;
    }

    const apiCall = () => axiosAuth.post(
      `/productos/generarpdf-remitos-multiples`,
      { remitosIds },
      { responseType: "blob" }
    );

    const configuracion = {
      nombreArchivo: `Remitos-Multiples.pdf`,
      titulo: 'Remitos Múltiples',
      subtitulo: `${remitosIds.length} remitos generados`,
      mensajeExito: `${remitosIds.length} remitos generados con éxito`,
      mensajeError: 'Error al generar los remitos'
    };

    return await generarPDFMultipleInterno(apiCall, configuracion);
  };

  // Función original para descargas directas (MANTENER para compatibilidad)
  const generarPDFIndividual = async (remito, productos) => {
    if (!remito || productos.length === 0) {
      toast.error("Seleccione un remito con productos");
      return false;
    }

    try {
      const response = await axiosAuth.post(
        `/productos/generarpdf-remito`,
        { remito, productos },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `REMITO_${remito.cliente_nombre}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("PDF de remito generado con éxito");
      return true;
    } catch (error) {
      console.error("Error al generar PDF del remito:", error);
      toast.error("Error al generar el PDF del remito");
      return false;
    }
  };

  // Función original para múltiples (MANTENER para compatibilidad)
  const generarPDFsMultiples = async (remitosSeleccionados) => {
    if (!remitosSeleccionados || remitosSeleccionados.length === 0) {
      toast.error("Seleccione al menos un remito para imprimir");
      return false;
    }

    setImprimiendoMultiple(true);

    try {
      const remitosIds = remitosSeleccionados.map(remito => {
        if (typeof remito === 'object' && remito !== null) {
          return remito.id;
        }
        return remito;
      }).filter(id => id && !isNaN(parseInt(id)));

      if (remitosIds.length === 0) {
        toast.error("No se encontraron IDs válidos de remitos");
        return false;
      }

      const response = await axiosAuth.post(
        `/productos/generarpdf-remitos-multiples`,
        { remitosIds },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Remitos-Multiples.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`${remitosIds.length} remitos generados con éxito`);
      return true;
    } catch (error) {
      console.error("Error al generar múltiples PDFs de remitos:", error);
      toast.error(`Error al generar los remitos: ${error.response?.data?.error || error.message}`);
      return false;
    } finally {
      setImprimiendoMultiple(false);
    }
  };

  return {
    // Estados del modal PDF individual
    generandoPDF,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    
    // ✅ Estados del modal PDF múltiple
    imprimiendoMultiple: loadingMultiple,
    mostrarModalPDFMultiple,
    pdfURLMultiple,
    nombreArchivoMultiple,
    tituloModalMultiple,
    subtituloModalMultiple,
    
    // Estados originales
    imprimiendoMultipleOriginal: imprimiendoMultiple,
    
    // Funciones del modal PDF individual
    generarPDFIndividualConModal,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF,
    
    // ✅ Funciones del modal PDF múltiple
    generarPDFsMultiplesConModal,
    descargarPDFMultiple,
    compartirPDFMultiple,
    cerrarModalPDFMultiple,
    
    // Funciones originales (compatibilidad)
    generarPDFIndividual,
    generarPDFsMultiples
  };
}