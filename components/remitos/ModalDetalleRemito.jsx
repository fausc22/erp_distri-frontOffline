// components/remitos/ModalDetalleRemito.jsx - Sin botón Ver Venta Origen
import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { ModalPDFUniversal, BotonGenerarPDFUniversal } from '../shared/ModalPDFUniversal';


// Función helper para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

function InformacionCliente({ remito, expandido, onToggleExpansion }) {
  return (
    <div className="bg-green-50 rounded-lg overflow-hidden mb-4">
      {/* Información básica del cliente (siempre visible) */}
      <div 
        className="p-3 cursor-pointer hover:bg-green-100 transition-colors flex items-center justify-between"
        onClick={onToggleExpansion}
      >
        <div>
          <h3 className="font-bold text-lg text-green-800">Cliente: {remito.cliente_nombre}</h3>
          <p className="text-green-600 text-sm">
            {remito.cliente_ciudad || 'Ciudad no especificada'}
            {remito.cliente_provincia && `, ${remito.cliente_provincia}`}
          </p>
        </div>
        <div className="text-green-600">
          {expandido ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        </div>
      </div>

      {/* Información detallada del cliente (expandible) */}
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-3 pb-3 border-t border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="font-medium text-green-700">Dirección:</span>
              <p className="text-gray-700">{remito.cliente_direccion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Condición IVA:</span>
              <p className="text-gray-700">{remito.cliente_condicion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">CUIT:</span>
              <p className="text-gray-700">{remito.cliente_cuit || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Teléfono:</span>
              <p className="text-gray-700">{remito.cliente_telefono || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InformacionAdicional({ remito }) {
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Entregado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Estado</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEstadoStyle(remito.estado)}`}>
            {remito.estado || 'Sin estado'}
          </span>
        </div>

        {/* Observaciones */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Observaciones</h3>
          <p className="text-lg text-gray-700 bg-white p-3 rounded border min-h-[2.5rem] break-words">
            {remito.observaciones && remito.observaciones !== 'Sin observaciones' 
              ? remito.observaciones 
              : (
                <span className="text-gray-400 italic">
                  Sin observaciones especiales
                </span>
              )
            }
          </p>
        </div>

        {/* Empleado */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Usuario</h3>
          <p className="text-lg font-semibold text-green-600">
            {remito.empleado_nombre || 'No especificado'}
          </p>
        </div>
      </div>
    </div>
  );
}

function TablaProductosEscritorio({ productos }) {
  return (
    <div className="hidden lg:block overflow-x-auto bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-center">UM</th>
            <th className="p-2 text-center">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            // ✅ CONVERSIÓN SEGURA A ENTERO
            const cantidad = Math.floor(Number(producto.cantidad)) || 0;
            
            return (
              <tr key={producto.id} className="hover:bg-gray-100 border-b">
                <td className="p-2 font-mono text-xs">{producto.producto_id}</td>
                <td className="p-2 font-medium">{producto.producto_nombre}</td>
                <td className="p-2 text-center">{producto.producto_um}</td>
                <td className="p-2 text-center font-semibold text-green-600">{cantidad}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasProductosMovil({ productos }) {
  return (
    <div className="lg:hidden space-y-3">
      {productos.map((producto) => {
        // ✅ CONVERSIÓN SEGURA A ENTERO
        const cantidad = Math.floor(Number(producto.cantidad)) || 0;
        
        return (
          <div key={producto.id} className="bg-white p-3 rounded shadow border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{producto.producto_nombre}</h4>
                <p className="text-xs text-gray-500">Código: {producto.producto_id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 block">UM:</span>
                <span className="font-medium">{producto.producto_um}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Cantidad:</span>
                <span className="font-semibold text-green-600">{cantidad}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TablaProductos({ productos, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-2">📦</div>
        <div className="font-medium">No hay productos en este remito</div>
      </div>
    );
  }

  return (
    <>
      <TablaProductosEscritorio productos={productos} />
      <TarjetasProductosMovil productos={productos} />
    </>
  );
}

// ✅ FUNCIÓN CORREGIDA - SIN DECIMALES PARA CANTIDADES
function ResumenCantidades({ productos }) {
  // Calcular total de productos
  const totalProductos = productos.length;
  
  // ✅ CONVERSIÓN CORRECTA SIN DECIMALES
  const totalCantidad = productos.reduce((acc, prod) => {
    const cantidad = Math.floor(Number(prod.cantidad)) || 0;
    return acc + cantidad;
  }, 0);

  if (productos.length === 0) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">PRODUCTOS DIFERENTES:</span>
          <span className="font-semibold text-gray-800">{totalProductos}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 bg-green-300 rounded-lg px-3 border-2 border-green-400">
          <span className="text-black font-bold">CANTIDAD TOTAL:</span>
          {/* ✅ CORREGIDO: SIN .toFixed(3) - MOSTRAR COMO ENTERO */}
          <span className="text-black text-lg font-bold">{totalCantidad}</span>
        </div>
      </div>
    </div>
  );
}



export function ModalDetalleRemito({ 
  remito,
  productos,
  loading,
  onClose,
  onGenerarPDF,
  generandoPDF = false,
  // Props para el modal PDF
  mostrarModalPDF,
  pdfURL,
  nombreArchivo,
  tituloModal,
  subtituloModal,
  onDescargarPDF,
  onCompartirPDF,
  onCerrarModalPDF
}) {
  const [clienteExpandido, setClienteExpandido] = useState(false);

  if (!remito) return null;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  const handleCerrarModal = () => {
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                Remito #{remito.id}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Fecha y Estado */}
          <div className="mb-4">
            <h4 className="text-sm sm:text-lg font-semibold text-gray-700">
              <strong>Fecha:</strong> {formatearFecha(remito.fecha)}
            </h4>
          </div>
          
          {/* Información del Cliente (colapsable) */}
          <InformacionCliente 
            remito={remito} 
            expandido={clienteExpandido}
            onToggleExpansion={toggleClienteExpansion}
          />

          {/* Información Adicional */}
          <InformacionAdicional remito={remito} />
          
          {/* Sección de productos */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Productos del Remito</h3>
            
            <TablaProductos
              productos={productos}
              loading={loading}
            />

            <ResumenCantidades productos={productos} />
          </div>
            
            {/* Botones de acción */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <BotonGenerarPDFUniversal
                onGenerar={onGenerarPDF}
                loading={generandoPDF}
                texto="🖨️ IMPRIMIR REMITO"
                className="bg-green-600 hover:bg-green-700 w-full sm:w-1/2"
              />
              
              <button
                onClick={handleCerrarModal}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full sm:w-1/2"
              >
                ❌ CERRAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal PDF Unificado */}
      <ModalPDFUniversal
        mostrar={mostrarModalPDF}
        pdfURL={pdfURL}
        nombreArchivo={nombreArchivo}
        titulo={tituloModal}
        subtitulo={subtituloModal}
        onDescargar={onDescargarPDF}
        onCompartir={onCompartirPDF}
        onCerrar={onCerrarModalPDF}
        zIndex={70}
      />
    </>
  );
}