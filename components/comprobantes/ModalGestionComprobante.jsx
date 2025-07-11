// components/comprobantes/ModalGestionComprobante.jsx
import { useEffect } from 'react';
import { MdRemoveRedEye, MdCloudUpload, MdDelete, MdClose } from "react-icons/md";
import { useComprobantes } from '../../hooks/useComprobantes';

export default function ModalGestionComprobante({
  mostrar,
  onCerrar,
  id,
  tipo,
  titulo
}) {
  const {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificandoComprobante,
    handleFileChange,
    verificarComprobante,
    subirComprobante,
    verComprobante,
    eliminarComprobante,
    limpiarEstados,
    getArchivoInfo
  } = useComprobantes();

  // Verificar comprobante existente al abrir el modal
  useEffect(() => {
    if (mostrar && id && tipo) {
      verificarComprobante(id, tipo);
    }
  }, [mostrar, id, tipo]);

  // Limpiar estados al cerrar el modal
  useEffect(() => {
    if (!mostrar) {
      limpiarEstados();
    }
  }, [mostrar]);

  if (!mostrar) return null;

  const archivoInfo = getArchivoInfo();

  // Generar título dinámico
  const getTitulo = () => {
    if (titulo) return titulo;
    
    const tipoTexto = tipo === 'compra' ? 'Compra' : 
                     tipo === 'gasto' ? 'Gasto' : 
                     tipo === 'venta' ? 'Venta' : 'Registro';
    
    return `Gestión de Comprobante - ${tipoTexto}`;
  };

  const getTipoTexto = () => {
    return tipo === 'compra' ? 'compra' : 
           tipo === 'gasto' ? 'gasto' : 
           tipo === 'venta' ? 'venta' : 'registro';
  };

  const getColorTema = () => {
    return tipo === 'compra' ? 'green' : 
           tipo === 'gasto' ? 'blue' : 
           tipo === 'venta' ? 'purple' : 'gray';
  };

  const handleSubir = async () => {
    const exito = await subirComprobante(id, tipo);
    if (exito) {
      setTimeout(onCerrar, 1500);
    }
  };

  const handleVer = () => {
    verComprobante(id, tipo);
  };

  const handleEliminar = async () => {
    const exito = await eliminarComprobante(id, tipo);
    if (exito) {
      onCerrar();
    }
  };

  const colorTema = getColorTema();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className={`bg-${colorTema}-500 text-white p-4 rounded-t-lg`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{getTitulo()}</h2>
            <button 
              onClick={onCerrar}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <MdClose size={24} />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">
            {getTipoTexto().charAt(0).toUpperCase() + getTipoTexto().slice(1)} #{id}
          </p>
        </div>
        
        {/* Contenido del modal */}
        <div className="p-6">
          {/* Estado del comprobante existente */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            {verificandoComprobante ? (
              <div className="text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                <p className="text-gray-600">Verificando comprobante...</p>
              </div>
            ) : comprobanteExistente ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 bg-${colorTema}-100 rounded-full`}>
                    <MdRemoveRedEye size={32} className={`text-${colorTema}-600`} />
                  </div>
                </div>
                <p className={`mb-4 text-${colorTema}-700 font-medium`}>
                  Este {getTipoTexto()} ya tiene un comprobante cargado.
                </p>
                <div className="flex gap-2 justify-center mb-4 flex-wrap">
                  <button 
                    onClick={handleVer}
                    className={`bg-${colorTema}-600 hover:bg-${colorTema}-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors`}
                  >
                    <MdRemoveRedEye size={16} />
                    Ver Comprobante
                  </button>
                  <button 
                    onClick={handleEliminar}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                  >
                    <MdDelete size={16} />
                    Eliminar
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Si necesitas reemplazar el comprobante, selecciona un nuevo archivo abajo.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 bg-${colorTema}-100 rounded-full`}>
                    <MdCloudUpload size={32} className={`text-${colorTema}-600`} />
                  </div>
                </div>
                <p className="mb-2 text-gray-700">
                  No hay ningún comprobante cargado para este {getTipoTexto()}.
                </p>
                <p className="text-sm text-gray-500">
                  Selecciona un archivo para cargar el comprobante.
                </p>
              </div>
            )}
          </div>
          
          {/* Selector de archivo */}
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6">
            <input 
              type="file"
              id={`comprobante-modal-input-${id}-${tipo}`}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label 
              htmlFor={`comprobante-modal-input-${id}-${tipo}`}
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <MdCloudUpload size={48} className="text-gray-400 mb-3" />
              <span className={`text-${colorTema}-600 hover:text-${colorTema}-800 font-medium mb-2 transition-colors`}>
                Haz clic aquí para seleccionar un archivo
              </span>
              <span className="text-xs text-gray-500">
                Formatos: PDF, JPG, JPEG, PNG, DOC, DOCX (Máx. 10MB)
              </span>
            </label>
            
            {/* Información del archivo seleccionado */}
            {comprobante && archivoInfo && (
              <div className={`mt-4 p-3 bg-${colorTema}-50 rounded-lg border border-${colorTema}-200`}>
                <div className="flex items-center space-x-3">
                  {/* Preview del archivo */}
                  <div className="flex-shrink-0">
                    {archivoInfo.preview ? (
                      <img 
                        src={archivoInfo.preview} 
                        alt="Vista previa" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Info del archivo */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium text-${colorTema}-900 truncate`}>
                      {archivoInfo.nombre}
                    </p>
                    <p className={`text-xs text-${colorTema}-700`}>
                      {archivoInfo.tamaño}
                    </p>
                  </div>
                  
                  {/* Icono de check */}
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button 
              onClick={onCerrar}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            
            <button 
              onClick={handleSubir}
              disabled={!comprobante || uploadingComprobante}
              className={`px-6 py-2 rounded text-white transition-colors order-1 sm:order-2 ${
                !comprobante || uploadingComprobante 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : `bg-${colorTema}-600 hover:bg-${colorTema}-700`
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
              ) : (
                comprobanteExistente ? "Reemplazar Comprobante" : "Subir Comprobante"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}