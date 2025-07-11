// hooks/shared/useGenerarPDFUniversal.js
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function useGenerarPDFUniversal() {
  const [loading, setLoading] = useState(false);
  const [pdfURL, setPdfURL] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [tituloModal, setTituloModal] = useState('PDF Generado Exitosamente');
  const [subtituloModal, setSubtituloModal] = useState('');

  const generarPDF = async (apiCall, configuracion = {}) => {
    const {
      nombreArchivo: nombre = 'documento.pdf',
      titulo = 'PDF Generado Exitosamente',
      subtitulo = '',
      mensajeExito = 'PDF generado con éxito',
      mensajeError = 'Error al generar el PDF'
    } = configuracion;

    setLoading(true);
    
    try {
      // apiCall debe retornar la respuesta del axios con responseType: 'blob'
      const response = await apiCall();

      // Crear una URL para el blob del PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Guardar tanto la URL como el blob original
      setPdfBlob(blob);
      setPdfURL(url);
      setNombreArchivo(nombre);
      setTituloModal(titulo);
      setSubtituloModal(subtitulo);
      setMostrarModalPDF(true);
      
      toast.success(mensajeExito);
      return true;
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error(mensajeError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    if (!pdfURL || !nombreArchivo) return;
    
    try {
      const link = document.createElement('a');
      link.href = pdfURL;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar el PDF');
    }
  };

  const compartirPDF = async () => {
    if (!pdfBlob || !nombreArchivo) {
      toast.error('No hay PDF disponible para compartir');
      return;
    }

    try {
      const file = new File([pdfBlob], nombreArchivo, { type: 'application/pdf' });

      // Verificar si el dispositivo soporta la Web Share API con archivos
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Usar Web Share API (móviles principalmente)
        await navigator.share({
          title: tituloModal,
          text: subtituloModal || `Documento: ${nombreArchivo}`,
          files: [file]
        });
        
        toast.success('PDF compartido exitosamente');
      } else if (navigator.share) {
        // Si soporta Web Share API pero no archivos, crear URL temporal
        const tempUrl = window.URL.createObjectURL(pdfBlob);
        await navigator.share({
          title: tituloModal,
          text: subtituloModal || `Documento: ${nombreArchivo}`,
          url: tempUrl
        });
        
        // Limpiar la URL temporal después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(tempUrl);
        }, 30000); // 30 segundos
        
        toast.success('Enlace compartido exitosamente');
      } else {
        // Fallback para navegadores de escritorio
        await compartirFallback(pdfBlob, nombreArchivo);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Usuario canceló el compartir
        return;
      }
      
      console.error('Error al compartir:', error);
      
      // Si falla todo, intentar fallback
      try {
        await compartirFallback(pdfBlob, nombreArchivo);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        toast.error('No se pudo compartir el archivo. Intenta descargarlo en su lugar.');
      }
    }
  };

  const compartirFallback = async (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    
    // Intentar copiar al portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles. Puedes pegarlo para compartir.');
        
        // Limpiar la URL después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 300000); // 5 minutos
        
        return;
      } catch (clipboardError) {
        console.log('No se pudo copiar al portapapeles:', clipboardError);
      }
    }
    
    // Si no se puede copiar, abrir en nueva ventana
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      toast.success('El PDF se abrió en una nueva ventana. Puedes compartir desde ahí.');
      
      // Limpiar la URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 300000); // 5 minutos
    } else {
      // Última alternativa: descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('El archivo se descargó. Puedes compartirlo desde tu gestor de archivos.');
    }
  };

  const cerrarModalPDF = () => {
    setMostrarModalPDF(false);
    
    // Limpiar las URLs para liberar memoria
    if (pdfURL) {
      window.URL.revokeObjectURL(pdfURL);
      setPdfURL(null);
    }
    
    // Limpiar estados
    setPdfBlob(null);
    setNombreArchivo('');
    setTituloModal('PDF Generado Exitosamente');
    setSubtituloModal('');
  };

  return {
    // Estados
    loading,
    pdfURL,
    mostrarModalPDF,
    nombreArchivo,
    tituloModal,
    subtituloModal,
    
    // Funciones
    generarPDF,
    descargarPDF,
    compartirPDF,
    cerrarModalPDF
  };
}