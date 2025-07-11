import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { axiosAuth } from '../../utils/apiClient';


export function useAnularPedido() {
  const [loading, setLoading] = useState(false);

  // Anular un pedido individual
  const anularPedido = async (pedidoId) => {
    if (!pedidoId) {
      toast.error('ID de pedido requerido');
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-estado/${pedidoId}`, {
        estado: 'Anulado'
      });

      if (response.data.success) {
        toast.success(`Pedido #${pedidoId} anulado correctamente. Stock restaurado.`);
        return { 
          success: true, 
          data: response.data,
          message: 'Pedido anulado exitosamente'
        };
      } else {
        toast.error(response.data.message || 'Error al anular el pedido');
        return { 
          success: false, 
          message: response.data.message || 'Error al anular el pedido'
        };
      }
    } catch (error) {
      console.error('Error al anular pedido:', error);
      
      let errorMessage = 'Error al anular el pedido';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Pedido no encontrado';
      } else if (error.response?.status === 400) {
        errorMessage = 'Estado de pedido inválido o pedido ya procesado';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Contacte al administrador.';
      }
      
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        error: error.response?.data || error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado general de un pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    if (!pedidoId || !nuevoEstado) {
      toast.error('ID de pedido y estado requeridos');
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-estado/${pedidoId}`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        toast.success(`Pedido #${pedidoId} marcado como ${nuevoEstado}`);
        return { 
          success: true, 
          data: response.data,
          message: `Estado cambiado a ${nuevoEstado}`
        };
      } else {
        toast.error(response.data.message || 'Error al cambiar estado del pedido');
        return { 
          success: false, 
          message: response.data.message || 'Error al cambiar estado del pedido'
        };
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      
      let errorMessage = 'Error al cambiar estado del pedido';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        error: error.response?.data || error.message
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    anularPedido,
    cambiarEstadoPedido
  };
}



