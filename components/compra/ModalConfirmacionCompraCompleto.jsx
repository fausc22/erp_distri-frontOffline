import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useCuentasSimple } from '../../hooks/compra/useCuentasSimple'; // Hook independiente

export function ModalConfirmacionCompraCompleto({ 
  mostrar, 
  onClose, 
  proveedor, 
  productos, 
  totalInicial,
  onConfirmarCompra,
  loading = false
}) {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
  const [subtotalSinIva, setSubtotalSinIva] = useState(0);
  const [ivaTotal, setIvaTotal] = useState(0);
  const [totalConIva, setTotalConIva] = useState(0);
  const [actualizarStock, setActualizarStock] = useState(true);
  const [observaciones, setObservaciones] = useState('');

  const { cuentas, cargarCuentas, loadingCuentas } = useCuentasSimple();

  useEffect(() => {
    if (mostrar && productos && productos.length > 0) {
      // Calcular totales iniciales desde los productos
      const subtotal = productos.reduce((acc, prod) => acc + (Number(prod.subtotal) || 0), 0);
      const iva = subtotal * 0.21; // IVA del 21%
      const total = subtotal + iva;

      setSubtotalSinIva(subtotal);
      setIvaTotal(iva);
      setTotalConIva(total);
    }
  }, [mostrar, productos]);

  useEffect(() => {
    if (mostrar) {
      cargarCuentas();
    }
  }, [mostrar]);

  const actualizarMontos = (campo, valor) => {
    const numeroValor = parseFloat(valor) || 0;
    switch (campo) {
      case 'subtotal':
        setSubtotalSinIva(numeroValor);
        const nuevoIva = numeroValor * 0.21;
        setIvaTotal(nuevoIva);
        setTotalConIva(numeroValor + nuevoIva);
        break;
      case 'iva':
        setIvaTotal(numeroValor);
        setTotalConIva(subtotalSinIva + numeroValor);
        break;
      case 'total':
        setTotalConIva(numeroValor);
        const proporcionIva = ivaTotal / (subtotalSinIva + ivaTotal) || 0.21;
        const nuevoIvaCalculado = numeroValor * proporcionIva;
        const nuevoSubtotal = numeroValor - nuevoIvaCalculado;
        setSubtotalSinIva(nuevoSubtotal);
        setIvaTotal(nuevoIvaCalculado);
        break;
      default:
        break;
    }
  };

  const handleConfirmar = async () => {
    if (!cuentaSeleccionada) {
      toast.error('Debe seleccionar una cuenta de origen para el egreso');
      return;
    }

    if (totalConIva <= 0) {
      toast.error('El total debe ser mayor a cero');
      return;
    }

    const datosCompra = {
      proveedor_id: proveedor.id,
      proveedor_nombre: proveedor.nombre,
      proveedor_cuit: proveedor.cuit,
      total: totalConIva.toFixed(2),
      subtotal: subtotalSinIva.toFixed(2),
      iva_total: ivaTotal.toFixed(2),
      fecha: new Date().toISOString().slice(0, 10),
      productos: productos,
      cuentaId: cuentaSeleccionada,
      actualizarStock: actualizarStock,
      observaciones: observaciones || 'Compra registrada desde sistema'
    };

    console.log('🛒 Enviando datos de compra:', datosCompra);
    const resultado = await onConfirmarCompra(datosCompra);
    
    if (resultado) {
      limpiarFormulario();
      onClose();
    }
  };

  const limpiarFormulario = () => {
    setCuentaSeleccionada('');
    setSubtotalSinIva(0);
    setIvaTotal(0);
    setTotalConIva(0);
    setActualizarStock(true);
    setObservaciones('');
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              🛒 Confirmar Compra - {proveedor?.nombre}
            </h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-xl p-1"
            >
              ✕
            </button>
          </div>

          {/* Información del Proveedor */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Información del Proveedor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Proveedor:</span> {proveedor?.nombre}
              </div>
              <div>
                <span className="font-medium">CUIT:</span> {proveedor?.cuit || 'No informado'}
              </div>
              <div>
                <span className="font-medium">Productos:</span> {productos?.length || 0}
              </div>
              <div>
                <span className="font-medium">Estado:</span> <span className="text-green-600">Registrada</span>
              </div>
            </div>
          </div>

          {/* Configuración de Compra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta de origen (egreso) *
              </label>
              {loadingCuentas ? (
                <div className="border p-2 rounded bg-gray-100 text-center text-sm">
                  Cargando cuentas...
                </div>
              ) : (
                <select
                  value={cuentaSeleccionada}
                  onChange={(e) => setCuentaSeleccionada(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar cuenta...</option>
                  {cuentas.map(cuenta => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre} - Saldo: ${Number(cuenta.saldo).toFixed(2)}
                    </option>
                  ))}
                </select>
              )}
              {!cuentaSeleccionada && (
                <p className="text-xs text-red-500 mt-1">Debe seleccionar una cuenta</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actualizar Stock
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={actualizarStock}
                    onChange={() => setActualizarStock(true)}
                    className="mr-2 text-green-600"
                  />
                  <span className="text-sm">✅ Sí, actualizar stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!actualizarStock}
                    onChange={() => setActualizarStock(false)}
                    className="mr-2"
                  />
                  <span className="text-sm">❌ No actualizar</span>
                </label>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full text-sm h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Observaciones adicionales sobre la compra..."
            />
          </div>

          {/* Montos de Compra */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">💰 Montos de Compra</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtotal (sin IVA)
                </label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600 font-medium">$</span>
                  <input
                    type="number"
                    value={subtotalSinIva.toFixed(2)}
                    onChange={(e) => actualizarMontos('subtotal', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IVA Total (21%)
                </label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600 font-medium">$</span>
                  <input
                    type="number"
                    value={ivaTotal.toFixed(2)}
                    onChange={(e) => actualizarMontos('iva', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total (con IVA)
                </label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600 font-medium">$</span>
                  <input
                    type="number"
                    value={totalConIva.toFixed(2)}
                    onChange={(e) => actualizarMontos('total', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Final */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">📊 Resumen Final (Egreso)</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotalSinIva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%):</span>
                <span className="font-medium">${ivaTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total a Egresar:</span>
                <span className="text-red-600">${totalConIva.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span>{actualizarStock ? '✅ Se actualizará' : '❌ No se actualizará'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cuenta:</span>
                  <span>{cuentaSeleccionada ? 
                    cuentas.find(c => c.id == cuentaSeleccionada)?.nombre || 'Seleccionada' 
                    : '❌ No seleccionada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmar}
              disabled={!cuentaSeleccionada || totalConIva <= 0 || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-1/2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                '✅ CONFIRMAR COMPRA'
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-1/2"
            >
              ❌ CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}