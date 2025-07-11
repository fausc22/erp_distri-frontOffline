// hooks/useComprobantes.js
import { useState } from 'react';
import { axiosAuth } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

export const useComprobantes = () => {
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [comprobanteExistente, setComprobanteExistente] = useState(false);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const [verificandoComprobante, setVerificandoComprobante] = useState(false);

  // Validar archivo antes de aceptarlo
  const validarArchivo = (file) => {
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 10MB permitido.');
      return false;
    }
    
    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo se permiten: JPG, PNG, PDF, DOC, DOCX');
      return false;
    }
    
    return true;
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validarArchivo(file)) {
        return;
      }
      
      setComprobante(file);
      
      // Generar preview si es una imagen
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

  // Verificar si existe comprobante
  const verificarComprobante = async (id, tipo) => {
    if (!id || !tipo) return false;
    
    setVerificandoComprobante(true);
    
    try {
      const response = await axiosAuth.get(`/comprobantes/verificar/${tipo}/${id}`);
      
      if (response.data.success) {
        const existe = response.data.data.tieneComprobante && response.data.data.archivoExiste;
        setComprobanteExistente(existe);
        return existe;
      } else {
        setComprobanteExistente(false);
        return false;
      }
    } catch (error) {
      console.error(`Error al verificar comprobante de ${tipo}:`, error);
      setComprobanteExistente(false);
      return false;
    } finally {
      setVerificandoComprobante(false);
    }
  };

  // Subir comprobante
  const subirComprobante = async (id, tipo, archivo = null) => {
    const archivoASubir = archivo || comprobante;
    
    if (!archivoASubir || !id || !tipo) {
      toast.error("Faltan datos para subir el comprobante");
      return false;
    }

    setUploadingComprobante(true);

    try {
      const formData = new FormData();
      formData.append("comprobante", archivoASubir);

      const response = await axiosAuth.post(`/comprobantes/subir/${tipo}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Comprobante cargado exitosamente");
        setComprobanteExistente(true);
        return true;
      } else {
        toast.error(response.data.message || "Error al cargar el comprobante");
        return false;
      }
    } catch (error) {
      console.error("Error al cargar el comprobante:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al cargar el comprobante");
      }
      return false;
    } finally {
      setUploadingComprobante(false);
    }
  };

  // Ver comprobante
  const verComprobante = (id, tipo) => {
    if (!id || !tipo) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/comprobantes/obtener/${tipo}/${id}`;
    window.open(url, '_blank');
  };

  // Eliminar comprobante
  const eliminarComprobante = async (id, tipo) => {
    if (!id || !tipo) return false;
    
    if (!confirm('¿Está seguro de que desea eliminar este comprobante?')) {
      return false;
    }
    
    try {
      const response = await axiosAuth.delete(`/comprobantes/eliminar/${tipo}/${id}`);
      
      if (response.data.success) {
        toast.success("Comprobante eliminado exitosamente");
        setComprobanteExistente(false);
        return true;
      } else {
        toast.error(response.data.message || "Error al eliminar el comprobante");
        return false;
      }
    } catch (error) {
      console.error("Error al eliminar comprobante:", error);
      toast.error("Error al eliminar el comprobante");
      return false;
    }
  };

  // Limpiar estados
  const limpiarEstados = () => {
    setComprobante(null);
    setComprobantePreview(null);
    setComprobanteExistente(false);
    setUploadingComprobante(false);
    setVerificandoComprobante(false);
  };

  // Obtener información del archivo seleccionado
  const getArchivoInfo = () => {
    if (!comprobante) return null;
    
    return {
      nombre: comprobante.name,
      tamaño: (comprobante.size / (1024 * 1024)).toFixed(2) + ' MB',
      tipo: comprobante.type,
      preview: comprobantePreview
    };
  };

  return {
    // Estados
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificandoComprobante,
    
    // Funciones
    handleFileChange,
    verificarComprobante,
    subirComprobante,
    verComprobante,
    eliminarComprobante,
    limpiarEstados,
    getArchivoInfo,
    validarArchivo,
    
    // Setters
    setComprobante,
    setComprobantePreview,
    setComprobanteExistente
  };
};