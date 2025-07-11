import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useRegistrarCompra() {
  const [loading, setLoading] = useState(false);

  const registrarCompra = async (datosCompraCompletos) => {
    const { 
      proveedor_id, 
      proveedor_nombre, 
      proveedor_cuit, 
      productos, 
      total,
      subtotal,
      iva_total,
      cuentaId,
      actualizarStock = true,
      observaciones = ''
    } = datosCompraCompletos;

    if (!proveedor_id || productos.length === 0) {
      toast.error('Debe seleccionar un proveedor y agregar al menos un producto.');
      return false;
    }

    if (!cuentaId) {
      toast.error('Debe seleccionar una cuenta de origen para el egreso.');
      return false;
    }

    setLoading(true);
    
    try {
      const compraData = {
        proveedor_id,
        proveedor_nombre,
        proveedor_cuit,
        total: Number(total).toFixed(2),
        subtotal: Number(subtotal).toFixed(2),
        iva_total: Number(iva_total).toFixed(2),
        fecha: new Date().toISOString().slice(0, 10),
        productos: productos,
        cuentaId: cuentaId, // Para el backend y movimiento_fondos
        actualizarStock: actualizarStock,
        observaciones: observaciones || 'Compra registrada desde sistema'
      };

      console.log('🛒 Enviando datos de compra al backend:', compraData);

      // Usar el endpoint que maneja cuentas de fondos
      const response = await axiosAuth.post(`/compras/registrarCompra`, compraData);
      
      if (response.data.success) {
        toast.success('Compra registrada con éxito y movimiento de fondos actualizado');
        return {
          success: true,
          data: response.data.data
        };
      } else {
        toast.error(response.data.message || 'Error al registrar la compra');
        return {
          success: false,
          message: response.data.message
        };
      }
    } catch (error) {
      console.error('Error al registrar la compra:', error);
      
      let errorMessage = 'Error al registrar la compra';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función legacy para compatibilidad con el código existente (modo simple)
  const registrarCompraSimple = async (proveedor, productos, total) => {
    const datosCompra = {
      proveedor_id: proveedor.id,
      proveedor_nombre: proveedor.nombre,
      proveedor_cuit: proveedor.cuit,
      productos: productos,
      total: total,
      subtotal: total * 0.826, // Aproximado sin IVA (21%)
      iva_total: total * 0.174, // Aproximado IVA (21%)
      actualizarStock: true,
      observaciones: 'Compra registrada (modo compatibilidad - sin cuenta asignada)'
    };

    console.log('⚠️ Usando modo compatibilidad sin cuenta de fondos');
    const resultado = await registrarCompra(datosCompra);
    return resultado.success;
  };

  return { 
    registrarCompra, 
    registrarCompraSimple, // Para mantener compatibilidad
    loading 
  };
}