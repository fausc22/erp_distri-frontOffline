import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
import { axiosAuth, fetchAuth } from '../../utils/apiClient';
  
export function useComprobantes() {
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [comprobanteExistente, setComprobanteExistente] = useState(false);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const verificarComprobanteExistente = async (ventaId) => {
    try {
      await axiosAuth.get(`/ventas/cargarComprobante/${ventaId}`, {
        responseType: 'blob'
      });
      setComprobanteExistente(true);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setComprobanteExistente(false);
        return false;
      } else {
        console.error("Error al verificar comprobante:", error);
        toast.error("Error al verificar el comprobante");
        setComprobanteExistente(false);
        return false;
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setComprobante(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setComprobantePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setComprobantePreview(null);
      }
    }
  };

  const uploadComprobante = async (ventaId) => {
    if (!comprobante) {
      toast.error("Seleccione un archivo");
      return false;
    }

    setUploadingComprobante(true);

    try {
      const formData = new FormData();
      formData.append("comprobante", comprobante);

      const response = await axiosAuth.post(
        `/ventas/guardarComprobante/${ventaId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Comprobante cargado exitosamente");
        setComprobanteExistente(true);
        return true;
      } else {
        toast.error(response.data.message || "Error al cargar el comprobante");
        return false;
      }
    } catch (error) {
      console.error("Error al cargar comprobante:", error);
      toast.error("Error al cargar el comprobante");
      return false;
    } finally {
      setUploadingComprobante(false);
    }
  };

  const viewComprobante = (ventaId) => {
    window.open(`${apiUrl}/ventas/cargarComprobante/${ventaId}`, '_blank');
  };

  const limpiarComprobante = () => {
    setComprobante(null);
    setComprobantePreview(null);
    setComprobanteExistente(false);
  };

  return {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificarComprobanteExistente,
    handleFileChange,
    uploadComprobante,
    viewComprobante,
    limpiarComprobante
  };
}