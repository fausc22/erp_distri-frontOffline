import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { CompraProvider, useCompra } from '../../context/ComprasContext';
import { useRegistrarCompra } from '../../hooks/compra/useRegistrarCompra';

import SelectorProveedores from '../../components/compra/SelectorProveedores';
import SelectorProductosCompra from '../../components/compra/SelectorProductosCompra';
import ProductosCarritoCompra from '../../components/compra/ProductosCarritoCompras';
import { ModalConfirmacionCompraCompleto } from '../../components/compra/ModalConfirmacionCompraCompleto';
import { ModalConfirmacionSalidaCompra } from '../../components/compra/ModalesConfirmacionCompra';
import { BotonAccionesCompra } from '../../components/compra/BotonAccionesCompra';

function RegistrarCompraContent() {
  const { proveedor, productos, total, clearCompra } = useCompra();
  const { registrarCompra, loading } = useRegistrarCompra();
  
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  useAuth();

  const handleConfirmarCompra = () => {
    if (!proveedor) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarCompra = async (datosCompraCompletos) => {
    console.log('📋 Datos recibidos para registrar compra:', datosCompraCompletos);
    
    try {
      const resultado = await registrarCompra(datosCompraCompletos);
      
      if (resultado.success) {
        clearCompra();
        setMostrarConfirmacion(false);
        
        // Mostrar detalles del resultado
        if (resultado.data) {
          toast.success(`Compra registrada correctamente. ID: ${resultado.data.compra_id}`);
        }
        
        return true;
      } else {
        toast.error(resultado.message || 'Error al registrar la compra');
        return false;
      }
    } catch (error) {
      console.error('Error en handleRegistrarCompra:', error);
      toast.error('Error inesperado al registrar la compra');
      return false;
    }
  };

  const handleConfirmarSalida = () => {
    if (proveedor || productos.length > 0) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Registrar Compra</title>
        <meta name="description" content="Registro de compras a proveedores con integración de cuentas de fondos" />
      </Head>
      
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-green-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">🛒 REGISTRAR COMPRA</h1>
          <p className="text-green-200 mt-2">Ingrese los datos de la compra a proveedor y seleccione cuenta de origen</p>
        </div>
        
        <div className="p-6">
          {/* Sección superior: Proveedor y búsqueda de productos */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <SelectorProveedores />
            <SelectorProductosCompra />
          </div>
          
          {/* Tabla de productos */}
          <ProductosCarritoCompra />
          
          
          
          {/* Resumen rápido */}
          {proveedor && productos.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Proveedor: {proveedor.nombre}</span>
                  <span>Productos: {productos.length}</span>
                </div>
                <div className="font-bold text-lg text-green-600">
                  Total: ${total.toFixed(2)}
                </div>
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <BotonAccionesCompra
            onConfirmarCompra={handleConfirmarCompra}
            onVolverMenu={handleConfirmarSalida}
            loading={loading}
            disabled={!proveedor || productos.length === 0}
          />
        </div>
      </div>
      
      {/* Modal de confirmación de compra completo */}
      <ModalConfirmacionCompraCompleto
        mostrar={mostrarConfirmacion}
        proveedor={proveedor}
        productos={productos}
        totalInicial={total}
        onConfirmarCompra={handleRegistrarCompra}
        onClose={() => setMostrarConfirmacion(false)}
        loading={loading}
      />
      
      {/* Modal de confirmación de salida */}
      <ModalConfirmacionSalidaCompra
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

// Solo CompraProvider, sin FondosProvider
export default function RegistrarCompra() {
  return (
    <CompraProvider>
      <RegistrarCompraContent />
    </CompraProvider>
  );
}