import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { axiosAuth, fetchAuth } from '../../utils/apiClient';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useEditarVenta() {
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cuenta, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);


  

  const cargarProductosVenta = async (venta) => {
    setSelectedVenta(venta);
    setLoading(true);
    
    try {
      const response = await axiosAuth.get(`/ventas/obtener-productos-venta/${venta.id}`);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const cargarCuenta = async (venta) => {
    setSelectedVenta(venta);
    

    try {
      const response = await axiosAuth.get(`/finanzas/cuentas/${venta.cuenta_id}`);
      if (response.data.success) {
        setCuentas(response.data.data);
        console.log("Cuenta cargada:", response.data.data);
      } else {
        toast.error("Error al cargar las cuentas");
      }
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("No se pudieron cargar las cuentas");
    } finally {
      
    }
  };


  

  

  

  

  const cerrarEdicion = () => {
    setSelectedVenta(null);
    setProductos([]);
  };

  return {
    selectedVenta,
    productos,
    cuenta,
    loading,
    
    cargarProductosVenta,
    cargarCuenta,
    
    cerrarEdicion
  };
}