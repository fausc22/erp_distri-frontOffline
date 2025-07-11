import { MdCloudUpload, MdRemoveRedEye } from "react-icons/md";

export function ModalComprobantesVenta({
  mostrar,
  venta,
  comprobante,
  comprobantePreview,
  comprobanteExistente,
  uploadingComprobante,
  onClose,
  onFileChange,
  onUpload,
  onView
}) {
  if (!mostrar || !venta) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-center">Gestión de Comprobante</h2>
        
        <div className="text-center mb-4">
          <p className="text-gray-700">
            Venta #{venta.id} - {venta.cliente_nombre}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          {comprobanteExistente ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MdRemoveRedEye size={36} className="text-blue-600" />
              </div>
              <p className="mb-4 text-green-700 font-medium">
                Esta venta ya tiene un comprobante cargado.
              </p>
              <button 
                onClick={onView}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 w-full sm:w-auto"
              >
                Ver Comprobante
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Si necesitas reemplazar el comprobante, selecciona un nuevo archivo.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MdCloudUpload size={48} className="text-blue-600" />
              </div>
              <p className="mb-4">
                No hay ningún comprobante cargado para esta venta.
              </p>
            </div>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6">
          <input 
            type="file"
            id="comprobante-input"
            className="hidden"
            onChange={onFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <label 
            htmlFor="comprobante-input"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-blue-600 hover:text-blue-800 font-medium mb-2">
              Haz clic aquí para seleccionar un archivo
            </span>
            <span className="text-xs text-gray-500">
              Formatos aceptados: PDF, JPG, JPEG, PNG
            </span>
          </label>
          
          {comprobante && (
            <div className="mt-4 p-2 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Archivo seleccionado:</p>
              <p className="text-sm text-gray-600 truncate">{comprobante.name}</p>
              
              {comprobantePreview && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={comprobantePreview} 
                    alt="Vista previa" 
                    className="h-32 object-contain rounded border" 
                  />
                </div>
              )}
              
              {!comprobantePreview && comprobante.type === 'application/pdf' && (
                <div className="mt-2 flex justify-center">
                  <p className="text-xs text-gray-500">
                    Vista previa no disponible para archivos PDF
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded order-2 sm:order-1"
          >
            Cancelar
          </button>
          
          <button 
            onClick={onUpload}
            disabled={!comprobante || uploadingComprobante}
            className={`px-4 py-2 rounded text-white order-1 sm:order-2 ${
              !comprobante || uploadingComprobante 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {uploadingComprobante ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </div>
            ) : "Subir Comprobante"}
          </button>
        </div>
      </div>
    </div>
  );
}