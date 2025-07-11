// components/ModalPDF.jsx
import { MdSave, MdShare, MdPictureAsPdf } from "react-icons/md";

export function ModalPDF({ 
  mostrar, 
  pdfURL, 
  nombreCliente,
  onDescargar, 
  onCompartir, 
  onCerrar 
}) {
  if (!mostrar || !pdfURL) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-center">PDF Generado Exitosamente</h3>
        
        {/* Vista previa del PDF */}
        <div className="mb-4 h-64 overflow-hidden rounded border border-gray-300">
          <iframe 
            src={pdfURL} 
            className="w-full h-full"
            title="Vista previa del PDF"
          ></iframe>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            onClick={() => onDescargar(nombreCliente)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold flex items-center justify-center gap-2"
          >
            <MdSave size={20} />
            Guardar PDF
          </button>
          <button
            onClick={() => onCompartir(nombreCliente)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold flex items-center justify-center gap-2"
          >
            <MdShare size={20} />
            Compartir
          </button>
          <button
            onClick={onCerrar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function BotonGenerarPDF({ onGenerar, loading }) {
  return (
    <button 
      className="bg-blue-600 hover:bg-blue-800 px-6 py-2 rounded text-white font-semibold flex items-center justify-center gap-2"
      onClick={onGenerar}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          Generando...
        </>
      ) : (
        <>
          <MdPictureAsPdf size={20} />
          Generar Lista de Precios
        </>
      )}
    </button>
  );
}