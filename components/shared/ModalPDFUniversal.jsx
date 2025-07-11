// components/shared/ModalPDFUniversal.jsx
import { MdSave, MdShare, MdPictureAsPdf } from "react-icons/md";

export function ModalPDFUniversal({ 
  mostrar, 
  pdfURL, 
  nombreArchivo,
  titulo = "PDF Generado Exitosamente",
  subtitulo,
  onDescargar, 
  onCompartir, 
  onCerrar,
  zIndex = 60 // Para manejar stack de modales
}) {
  if (!mostrar || !pdfURL) return null;

  const handleCompartir = async () => {
    try {
      // Convertir la URL blob a un archivo Blob
      const response = await fetch(pdfURL);
      const blob = await response.blob();
      
      // Crear un archivo File desde el blob
      const fileName = nombreArchivo || 'documento.pdf';
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // Verificar si el dispositivo soporta la Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Usar Web Share API (móviles principalmente)
        await navigator.share({
          title: titulo,
          text: subtitulo || `Documento: ${fileName}`,
          files: [file]
        });
      } else {
        // Fallback para navegadores de escritorio
        await compartirFallback(blob, fileName);
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      
      // Si falla todo, intentar descargar como alternativa
      try {
        const response = await fetch(pdfURL);
        const blob = await response.blob();
        await compartirFallback(blob, nombreArchivo || 'documento.pdf');
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        alert('No se pudo compartir el archivo. Intenta descargarlo en su lugar.');
      }
    }
  };

  const compartirFallback = async (blob, fileName) => {
    // Para navegadores de escritorio, copiar enlace o abrir en nueva ventana
    const url = URL.createObjectURL(blob);
    
    // Intentar copiar al portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles. Puedes pegarlo para compartir.');
        return;
      } catch (clipboardError) {
        console.log('No se pudo copiar al portapapeles:', clipboardError);
      }
    }
    
    // Si no se puede copiar, abrir en nueva ventana
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      alert('El PDF se abrió en una nueva ventana. Puedes compartir desde ahí.');
    } else {
      // Última alternativa: crear enlace temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('El archivo se descargó. Puedes compartirlo desde tu gestor de archivos.');
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
      style={{ zIndex }}
    >
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-lg mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-center flex-1">{titulo}</h3>
            <button 
              onClick={onCerrar}
              className="text-gray-500 hover:text-gray-700 text-xl p-1 ml-2"
            >
              ✕
            </button>
          </div>
          
          {subtitulo && (
            <p className="text-sm text-gray-600 text-center mb-4">{subtitulo}</p>
          )}
          
          {/* Vista previa del PDF - Responsiva */}
          <div className="mb-4 h-48 sm:h-64 lg:h-80 overflow-hidden rounded border border-gray-300">
            <iframe 
              src={pdfURL} 
              className="w-full h-full"
              title="Vista previa del PDF"
            />
          </div>
          
          {/* Botones responsivos */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={onDescargar}
              className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-1"
            >
              <MdSave size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Guardar PDF</span>
              <span className="sm:hidden">Guardar</span>
            </button>
            
            <button
              onClick={handleCompartir}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-2"
            >
              <MdShare size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Compartir</span>
              <span className="sm:hidden">Compartir</span>
            </button>
            
            <button
              onClick={onCerrar}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold text-sm sm:text-base order-3 sm:order-3"
            >
              <span className="hidden sm:inline">Cerrar</span>
              <span className="sm:hidden">Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BotonGenerarPDFUniversal({ 
  onGenerar, 
  loading, 
  texto = "Generar PDF",
  className = "bg-blue-600 hover:bg-blue-800 px-6 py-2",
  disabled = false,
  icono = null // 🆕 Nuevo prop para ícono
}) {
  return (
    <button 
      className={`rounded text-white font-semibold flex items-center justify-center gap-2 transition-colors ${className} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onGenerar}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          Generando...
        </>
      ) : (
        <>
          {icono && <span className="text-lg">{icono}</span>}
          {!icono && (
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          )}
          {texto}
        </>
      )}
    </button>
  );
}