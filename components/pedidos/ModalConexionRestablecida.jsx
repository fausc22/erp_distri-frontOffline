// components/pedidos/ModalConexionRestablecida.jsx
import { motion } from 'framer-motion';

export default function ModalConexionRestablecida({ 
  mostrar, 
  onIrAMenu, 
  onSeguirRegistrando,
  loading = false 
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[70] p-4">
      <motion.div 
        className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header con indicador de conexión */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
              />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            ¡CONEXIÓN RESTABLECIDA!
          </motion.h2>
          
          <motion.p 
            className="text-green-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Tu dispositivo se reconectó a internet
          </motion.p>
        </div>

        {/* Body */}
        <div className="p-6">
          <motion.div 
            className="text-center mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              ¿Qué deseas hacer ahora?
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">📱 Tu pedido se guardó correctamente offline</p>
                <p>• Puedes continuar registrando más pedidos sin conexión</p>
                <p>• O ir al menú principal para sincronizar y gestionar</p>
              </div>
            </div>
          </motion.div>

          {/* Botones */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <button
              onClick={onIrAMenu}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
                  </svg>
                  IR A MENÚ PRINCIPAL
                </>
              )}
            </button>
            
            <button
              onClick={onSeguirRegistrando}
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              SEGUIR REGISTRANDO
            </button>
          </motion.div>

          {/* Información adicional */}
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
              <p><strong>💡 Tip:</strong> Aunque tengas conexión, puedes seguir trabajando offline</p>
              <p>Todos los pedidos se sincronizarán automáticamente cuando vayas al menú</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}