// components/pedidos/ModalFacturacion.jsx
import { useState, useEffect } from 'react';

// Modal para aplicar descuentos
export function ModalDescuentos({
  mostrar, 
  onClose, 
  onAplicarDescuento, 
  subtotalSinIva = 0, 
  ivaTotal = 0, 
  totalConIva = 0 
}) {
  const [tipoDescuento, setTipoDescuento] = useState('numerico'); // 'numerico' o 'porcentaje'
  const [valorDescuento, setValorDescuento] = useState('');
  const [descuentoCalculado, setDescuentoCalculado] = useState(0);

  useEffect(() => {
    if (!valorDescuento || valorDescuento === '') {
      setDescuentoCalculado(0);
      return;
    }

    const valor = parseFloat(valorDescuento) || 0;
    
    if (tipoDescuento === 'numerico') {
      // Descuento directo sobre el total con IVA
      setDescuentoCalculado(Math.min(valor, totalConIva || 0));
    } else {
      // Porcentaje sobre el SUBTOTAL (sin IVA)
      const porcentaje = Math.min(Math.max(valor, 0), 100);
      setDescuentoCalculado(((subtotalSinIva || 0) * porcentaje) / 100);
    }
  }, [valorDescuento, tipoDescuento, subtotalSinIva, totalConIva]);

  const handleAplicar = () => {
    onAplicarDescuento({
      tipo: tipoDescuento,
      valor: parseFloat(valorDescuento) || 0,
      descuentoCalculado: descuentoCalculado
    });
    onClose();
  };

  const limpiarFormulario = () => {
    setTipoDescuento('numerico');
    setValorDescuento('');
    setDescuentoCalculado(0);
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  if (!mostrar) return null;

  const nuevoTotal = (totalConIva || 0) - descuentoCalculado;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-xs sm:max-w-md w-full">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Aplicar Descuento</h3>
          
          {/* Tipo de descuento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de descuento:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDescuento"
                  value="numerico"
                  checked={tipoDescuento === 'numerico'}
                  onChange={(e) => setTipoDescuento(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">💰 Descuento numérico (en pesos)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDescuento"
                  value="porcentaje"
                  checked={tipoDescuento === 'porcentaje'}
                  onChange={(e) => setTipoDescuento(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">📊 Descuento porcentual (% sobre IVA)</span>
              </label>
            </div>
          </div>

          {/* Input del valor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tipoDescuento === 'numerico' ? 'Monto a descontar ($):' : 'Porcentaje (1-100%):'}
            </label>
            <div className="flex items-center">
              {tipoDescuento === 'numerico' && <span className="mr-2 text-gray-600">$</span>}
              <input
                type="number"
                value={valorDescuento}
                onChange={(e) => setValorDescuento(e.target.value)}
                min="0"
                max={tipoDescuento === 'numerico' ? (totalConIva || 0) : 100}
                step={tipoDescuento === 'numerico' ? '0.01' : '1'}
                className="border p-2 rounded w-full text-sm"
                placeholder={tipoDescuento === 'numerico' ? '0.00' : '0'}
              />
              {tipoDescuento === 'porcentaje' && <span className="ml-2 text-gray-600">%</span>}
            </div>
            {tipoDescuento === 'porcentaje' && (
              <p className="text-xs text-gray-500 mt-1">
                Se aplicará sobre el IVA total: ${(ivaTotal || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Preview del descuento */}
          {descuentoCalculado > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-sm mb-2">Vista previa del descuento:</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total original:</span>
                  <span>${(totalConIva || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Descuento:</span>
                  <span>-${descuentoCalculado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total final:</span>
                  <span className="text-green-600">${nuevoTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAplicar}
             disabled={!valorDescuento || valorDescuento === '' || parseFloat(valorDescuento) < 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors text-sm w-full sm:w-auto"
            >
              ✅ Aplicar Descuento
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm w-full sm:w-auto"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal principal de facturación
export default function ModalFacturacion({ 
  mostrar, 
  onClose, 
  pedido, 
  productos,
  onConfirmarFacturacion 
}) {
  // Estados para los selects
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
  const [tipoFiscal, setTipoFiscal] = useState(''); // Se actualizará automáticamente
  const [cuentas, setCuentas] = useState([]); // Se cargarán desde la BD

  // Estados para los montos
  const [subtotalSinIva, setSubtotalSinIva] = useState(0);
  const [ivaTotal, setIvaTotal] = useState(0);
  const [totalConIva, setTotalConIva] = useState(0);

  // Estados para descuentos
  const [mostrarModalDescuentos, setMostrarModalDescuentos] = useState(false);
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  // ✅ FUNCIÓN PARA DETERMINAR TIPO FISCAL AUTOMÁTICAMENTE
  const determinarTipoFiscal = (condicionIva) => {
    if (!condicionIva) return 'A'; // Por defecto

    const condicion = condicionIva.toLowerCase().trim();
    
    console.log('🧾 Determinando tipo fiscal para condición:', condicion);

    // Mapeo de condiciones IVA a tipos fiscales
    if (condicion.includes('consumidor final') || 
        condicion.includes('consumidor') || 
        condicion.includes('final')) {
      console.log('✅ Tipo fiscal seleccionado: C (Consumidor Final)');
      return 'C';
    }
    
    if (condicion.includes('monotributo') || 
        condicion.includes('monotributista')) {
      console.log('✅ Tipo fiscal seleccionado: C (Monotributo = Consumidor Final)');
      return 'C';
    }
    
    if (condicion.includes('responsable inscripto') || 
        condicion.includes('responsable inscrito') ||
        condicion.includes('inscripto') ||
        condicion.includes('inscrito')) {
      console.log('✅ Tipo fiscal seleccionado: A (Responsable Inscripto)');
      return 'A';
    }
    
    if (condicion.includes('exento') || 
        condicion.includes('no inscripto') ||
        condicion.includes('no inscrito')) {
      console.log('✅ Tipo fiscal seleccionado: B (No Inscripto)');
      return 'B';
    }

    // Por defecto, Responsable Inscripto
    console.log('⚠️ Condición no reconocida, usando tipo fiscal por defecto: A');
    return 'A';
  };

  // ✅ INICIALIZAR MONTOS Y TIPO FISCAL AL ABRIR EL MODAL
  useEffect(() => {
    if (mostrar && productos && productos.length > 0) {
      console.log('🧾 Inicializando modal de facturación...');
      console.log('📋 Datos del pedido:', {
        id: pedido?.id,
        cliente: pedido?.cliente_nombre,
        condicionIva: pedido?.cliente_condicion
      });

      // Calcular montos
      const subtotal = productos.reduce((acc, prod) => acc + (Number(prod.subtotal) || 0), 0);
      const iva = productos.reduce((acc, prod) => acc + (Number(prod.iva) || 0), 0);
      const total = subtotal + iva;

      setSubtotalSinIva(subtotal);
      setIvaTotal(iva);
      setTotalConIva(total);
      
      // ✅ DETERMINAR Y ESTABLECER TIPO FISCAL AUTOMÁTICAMENTE
      const tipoFiscalAuto = determinarTipoFiscal(pedido.cliente_condicion);
      setTipoFiscal(tipoFiscalAuto);

      console.log('💰 Montos calculados:', {
        subtotal: subtotal.toFixed(2),
        iva: iva.toFixed(2),
        total: total.toFixed(2),
        tipoFiscalSeleccionado: tipoFiscalAuto
      });
      
      // Limpiar descuentos previos
      setDescuentoAplicado(null);
    }
  }, [mostrar, productos, pedido]);

  // Cargar cuentas desde la BD (placeholder)
  useEffect(() => {
    if (mostrar) {
      cargarCuentas();
    }
  }, [mostrar]);

  const cargarCuentas = async () => {
    setLoadingCuentas(true);
    try {
      // Aquí irá la llamada a la API para cargar las cuentas
      // Por ahora uso datos de ejemplo
      const cuentasEjemplo = [
        { id: 1, nombre: 'Caja Principal', numero: '001' },
        { id: 2, nombre: 'Banco Nación', numero: '002' },
        { id: 3, nombre: 'Banco Galicia', numero: '003' },
        { id: 4, nombre: 'Mercado Pago', numero: '004' }
      ];
      
      // Simular delay de carga
      setTimeout(() => {
        setCuentas(cuentasEjemplo);
        setLoadingCuentas(false);
      }, 500);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      setLoadingCuentas(false);
    }
  };

  // Función para actualizar montos cuando se editan manualmente
  const actualizarMontos = (campo, valor) => {
    const numeroValor = parseFloat(valor) || 0;
    
    switch (campo) {
      case 'subtotal':
        setSubtotalSinIva(numeroValor);
        // Recalcular IVA (21% por defecto)
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
        // Mantener la proporción de IVA
        const proporcionIva = ivaTotal / (subtotalSinIva + ivaTotal);
        const nuevoIvaCalculado = numeroValor * proporcionIva;
        const nuevoSubtotal = numeroValor - nuevoIvaCalculado;
        setSubtotalSinIva(nuevoSubtotal);
        setIvaTotal(nuevoIvaCalculado);
        break;
        
      default:
        break;
    }
  };

  // Aplicar descuento
  const handleAplicarDescuento = (descuento) => {
    setDescuentoAplicado(descuento);
    
    // Actualizar el total con el descuento
    const totalOriginal = subtotalSinIva + ivaTotal;
    const nuevoTotal = totalOriginal - descuento.descuentoCalculado;
    setTotalConIva(nuevoTotal);
  };

  // Limpiar descuento
  const limpiarDescuento = () => {
    setDescuentoAplicado(null);
    // Restaurar total original
    setTotalConIva(subtotalSinIva + ivaTotal);
  };

  // Confirmar facturación
  const handleConfirmar = () => {
    const datosFacturacion = {
      cuentaId: cuentaSeleccionada,
      tipoFiscal,
      subtotalSinIva,
      ivaTotal,
      totalConIva,
      descuentoAplicado,
      pedidoId: pedido.id
    };

    console.log('🧾 Datos de facturación:', datosFacturacion);
    
    if (onConfirmarFacturacion) {
      onConfirmarFacturacion(datosFacturacion);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setCuentaSeleccionada('');
    setTipoFiscal('A'); // Reset al valor por defecto
    setSubtotalSinIva(0);
    setIvaTotal(0);
    setTotalConIva(0);
    setDescuentoAplicado(null);
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  if (!mostrar) return null;

  const totalFinalConDescuento = descuentoAplicado 
    ? totalConIva 
    : subtotalSinIva + ivaTotal;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                🧾 Facturar Pedido #{pedido?.id}
              </h2>
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Información del pedido */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Información del Pedido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span> {pedido?.cliente_nombre}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {pedido?.fecha}
                </div>
                <div>
                  <span className="font-medium">Estado:</span> {pedido?.estado}
                </div>
                <div>
                  <span className="font-medium">Productos:</span> {productos?.length || 0}
                </div>
                {/* ✅ MOSTRAR CONDICIÓN IVA DEL CLIENTE */}
                <div className="sm:col-span-2">
                  <span className="font-medium">Condición IVA:</span> 
                  <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    {pedido?.cliente_condicion || 'No especificada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Select de cuenta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuenta de destino *
                </label>
                {loadingCuentas ? (
                  <div className="border p-2 rounded bg-gray-100 text-center text-sm">
                    Cargando cuentas...
                  </div>
                ) : (
                  <select
                    value={cuentaSeleccionada}
                    onChange={(e) => setCuentaSeleccionada(e.target.value)}
                    className="border p-2 rounded w-full text-sm"
                    required
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {cuentas.map(cuenta => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.numero} - {cuenta.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* ✅ SELECT DE TIPO FISCAL CON PRESELECCIÓN AUTOMÁTICA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo fiscal * 
                  <span className="text-xs text-green-600 ml-1">
                    (Auto-seleccionado según condición IVA)
                  </span>
                </label>
                <select
                  value={tipoFiscal}
                  onChange={(e) => setTipoFiscal(e.target.value)}
                  className="border p-2 rounded w-full text-sm font-medium"
                  required
                >
                  <option value="A">A - Responsable Inscripto</option>
                  <option value="B">B - Responsable No Inscripto</option>
                  <option value="C">C - Consumidor Final</option>
                </select>
                
              </div>
            </div>

            {/* Campos de montos */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Montos de Facturación</h3>
              <div className="space-y-4">
                {/* Subtotal sin IVA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal (sin IVA)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={subtotalSinIva.toFixed(2)}
                      onChange={(e) => actualizarMontos('subtotal', e.target.value)}
                      className="border p-2 rounded w-full text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* IVA Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA Total
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={ivaTotal.toFixed(2)}
                      onChange={(e) => actualizarMontos('iva', e.target.value)}
                      className="border p-2 rounded w-full text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Total con IVA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total (con IVA)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={totalConIva.toFixed(2)}
                      onChange={(e) => actualizarMontos('total', e.target.value)}
                      className="border p-2 rounded w-full text-sm font-semibold"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de descuentos */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">Descuentos</h3>
                <button
                  onClick={() => setMostrarModalDescuentos(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🏷️ APLICAR DESCUENTO
                </button>
              </div>
              
              {descuentoAplicado ? (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Descuento aplicado:
                      </p>
                      <p className="text-sm text-yellow-700">
                        {descuentoAplicado.tipo === 'numerico' 
                          ? `Descuento fijo: $${descuentoAplicado.descuentoCalculado.toFixed(2)}`
                          : `${descuentoAplicado.valor}% sobre IVA: $${descuentoAplicado.descuentoCalculado.toFixed(2)}`
                        }
                      </p>
                    </div>
                    <button
                      onClick={limpiarDescuento}
                      className="text-red-600 hover:text-red-800 text-sm ml-2"
                      title="Quitar descuento"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No hay descuentos aplicados</p>
              )}
            </div>

            {/* Resumen final */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Resumen Final</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotalSinIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>${ivaTotal.toFixed(2)}</span>
                </div>
                {descuentoAplicado && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>-${descuentoAplicado.descuentoCalculado.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-1">
                  <span>Total Final:</span>
                  <span className="text-green-600">${totalFinalConDescuento.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConfirmar}
                disabled={!cuentaSeleccionada || loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-1/2"
              >
                {loading ? 'Procesando...' : '✅ CONFIRMAR FACTURACIÓN'}
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

      {/* Modal de descuentos */}
      <ModalDescuentos
        mostrar={mostrarModalDescuentos}
        onClose={() => setMostrarModalDescuentos(false)}
        onAplicarDescuento={handleAplicarDescuento}
        subtotalSinIva={subtotalSinIva}
        ivaTotal={ivaTotal}
        totalConIva={totalConIva}
      />
    </>
  );
}