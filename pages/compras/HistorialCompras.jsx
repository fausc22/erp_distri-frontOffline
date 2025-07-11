import { useState, useEffect, Fragment } from 'react';
import { MdSearch, MdDeleteForever, MdRemoveRedEye, MdCloudUpload, MdAutorenew } from "react-icons/md";
import { axiosAuth, fetchAuth } from '../../utils/apiClient'; 
import { toast, Toaster } from 'react-hot-toast';
import Head from 'next/head';
import useAuth from '../../hooks/useAuth';
import { useComprobantes } from '../../hooks/useComprobantes'; // Importar el hook

export default function HistorialCompras() {
  // Estado para controlar las pestañas
  const [activeTab, setActiveTab] = useState('compras'); // 'compras', 'gastos', 'todos'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Estados para compras
  const [compras, setCompras] = useState([]);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [productosCompra, setProductosCompra] = useState([]);
  
  // Estados para gastos
  const [gastos, setGastos] = useState([]);
  const [selectedGasto, setSelectedGasto] = useState(null);
  
  // Estados para modales
  const [modalDetalleCompraOpen, setModalDetalleCompraOpen] = useState(false);
  const [modalDetalleGastoOpen, setModalDetalleGastoOpen] = useState(false);
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  
  // Estados para gestión de comprobantes usando el hook
  const {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificarComprobante,
    subirComprobante,
    verComprobante,
    eliminarComprobante,
    handleFileChange,
    limpiarEstados,
    getArchivoInfo
  } = useComprobantes();
  
  const [tipoComprobante, setTipoComprobante] = useState(''); // 'compra' o 'gasto'
  const [idComprobante, setIdComprobante] = useState(null);
  
  // Estados para carga
  const [cargandoCompras, setCargandoCompras] = useState(true);
  const [cargandoGastos, setCargandoGastos] = useState(true);
  
  // Estados para paginación
  const [paginaActualCompras, setPaginaActualCompras] = useState(1);
  const [paginaActualGastos, setPaginaActualGastos] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  
  // Estados para selección múltiple
  const [selectedCompras, setSelectedCompras] = useState([]);
  const [selectedGastos, setSelectedGastos] = useState([]);
  
  // Estado para impresión
  const [imprimiendo, setImprimiendo] = useState(false);
  
  useAuth();

  // Cargar datos al iniciar el componente
  useEffect(() => {
    cargarCompras();
    cargarGastos();
  }, []);

  // Función para cargar compras
  const cargarCompras = async () => {
    setCargandoCompras(true);
    try {
      console.log('Cargando compras...');
      const response = await axiosAuth.get('/compras/obtener-compras');
      console.log('Respuesta compras:', response.data);
      
      if (response.data.success) {
        setCompras(response.data.data || []);
        console.log('Compras cargadas:', response.data.data?.length || 0);
      } else {
        console.error('Error en respuesta:', response.data.message);
        toast.error("Error al cargar las compras");
        setCompras([]);
      }
    } catch (error) {
      console.error("Error al obtener compras:", error);
      toast.error("No se pudieron cargar las compras");
      setCompras([]);
    } finally {
      setCargandoCompras(false);
    }
  };

  // Función para cargar gastos
  const cargarGastos = async () => {
    setCargandoGastos(true);
    try {
      console.log('Cargando gastos...');
      const response = await axiosAuth.get('/compras/obtener-gastos');
      console.log('Respuesta gastos:', response.data);
      
      if (response.data.success) {
        setGastos(response.data.data || []);
        console.log('Gastos cargados:', response.data.data?.length || 0);
      } else {
        console.error('Error en respuesta:', response.data.message);
        toast.error("Error al cargar los gastos");
        setGastos([]);
      }
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      toast.error("No se pudieron cargar los gastos");
      setGastos([]);
    } finally {
      setCargandoGastos(false);
    }
  };

  // Función para ver detalle de una compra
  const handleVerDetalleCompra = async (compra) => {
    setSelectedCompra(compra);
    
    try {
      console.log('Solicitando productos para compra ID:', compra.id);
      const response = await axiosAuth.get(`/compras/obtener-productos-compra/${compra.id}`);
      console.log('Respuesta recibida:', response.data);
      
      if (Array.isArray(response.data)) {
        // CORRECCIÓN: Asegurar que los precios sean números válidos
        const productosConPreciosCorregidos = response.data.map(producto => ({
          ...producto,
          precio_costo: parseFloat(producto.precio_costo) || 0,
          precio_venta: parseFloat(producto.precio_venta) || 0,
          subtotal: parseFloat(producto.subtotal) || 0,
          cantidad: parseFloat(producto.cantidad) || 0
        }));
        
        setProductosCompra(productosConPreciosCorregidos);
      } else {
        console.error("Formato de respuesta inesperado:", response.data);
        setProductosCompra([]);
      }
      setModalDetalleCompraOpen(true);
    } catch (error) {
      console.error("Error al obtener productos de la compra:", error);
      toast.error("No se pudieron cargar los productos de la compra");
      setProductosCompra([]);
      setModalDetalleCompraOpen(true);
    }
  };

  // Función para ver detalle de un gasto
  const handleVerDetalleGasto = (gasto) => {
    setSelectedGasto(gasto);
    setModalDetalleGastoOpen(true);
  };

  // FUNCIONES PARA COMPROBANTES USANDO EL HOOK

  // Función para abrir el modal de comprobantes
  const handleOpenComprobanteModal = async (id, tipo) => {
    setTipoComprobante(tipo);
    setIdComprobante(id);
    
    // Limpiar estados previos
    limpiarEstados();
    
    // Verificar si hay un comprobante existente
    await verificarComprobante(id, tipo);
    
    setMostrarModalComprobante(true);
  };

  // Función para subir el comprobante
  const handleUploadComprobante = async () => {
    const success = await subirComprobante(idComprobante, tipoComprobante);
    if (success) {
      // Cerrar el modal después de cargar
      setTimeout(() => {
        setMostrarModalComprobante(false);
      }, 1500);
    }
  };

  // CORRECCIÓN: Función para ver el comprobante usando el hook
  const handleViewComprobante = async () => {
    if (!idComprobante || !tipoComprobante) {
      toast.error("No se ha seleccionado un comprobante válido");
      return;
    }
    
    const success = await verComprobante(idComprobante, tipoComprobante);
    if (!success) {
      console.error("Error al visualizar comprobante");
    }
  };

  // Función para eliminar comprobante
  const handleEliminarComprobante = async () => {
    const success = await eliminarComprobante(idComprobante, tipoComprobante);
    if (success) {
      setMostrarModalComprobante(false);
    }
  };

  // Función para manejar selección de compras
  const handleSelectCompra = (compraId) => {
    if (selectedCompras.includes(compraId)) {
      setSelectedCompras(selectedCompras.filter(id => id !== compraId));
    } else {
      setSelectedCompras([...selectedCompras, compraId]);
    }
  };

  // Función para manejar selección de gastos
  const handleSelectGasto = (gastoId) => {
    if (selectedGastos.includes(gastoId)) {
      setSelectedGastos(selectedGastos.filter(id => id !== gastoId));
    } else {
      setSelectedGastos([...selectedGastos, gastoId]);
    }
  };

  // Función para seleccionar todas las compras
  const handleSelectAllCompras = (e) => {
    if (e.target.checked) {
      setSelectedCompras(comprasActuales.map(compra => compra.id));
    } else {
      setSelectedCompras([]);
    }
  };

  // Función para seleccionar todos los gastos
  const handleSelectAllGastos = (e) => {
    if (e.target.checked) {
      setSelectedGastos(gastosActuales.map(gasto => gasto.id));
    } else {
      setSelectedGastos([]);
    }
  };

  // Función para imprimir comprobantes seleccionados
  const imprimirComprobantesSeleccionados = async () => {
    toast.error("Funcionalidad de impresión deshabilitada");
  };

  // Función para salir
  const confirmarSalida = () => {
    if (selectedCompra || selectedGasto) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  // Cálculos para paginación de compras
  const indexOfUltimoRegistroCompras = paginaActualCompras * registrosPorPagina;
  const indexOfPrimerRegistroCompras = indexOfUltimoRegistroCompras - registrosPorPagina;
  const comprasActuales = compras.slice(indexOfPrimerRegistroCompras, indexOfUltimoRegistroCompras);
  const totalPaginasCompras = Math.ceil(compras.length / registrosPorPagina);

  // Cálculos para paginación de gastos
  const indexOfUltimoRegistroGastos = paginaActualGastos * registrosPorPagina;
  const indexOfPrimerRegistroGastos = indexOfUltimoRegistroGastos - registrosPorPagina;
  const gastosActuales = gastos.slice(indexOfPrimerRegistroGastos, indexOfUltimoRegistroGastos);
  const totalPaginasGastos = Math.ceil(gastos.length / registrosPorPagina);

  // Función para formatear moneda
  const formatCurrency = (value) => {
    // CORRECCIÓN: Asegurar que el valor sea un número válido
    const numericValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numericValue);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE COMPRAS Y GASTOS</title>
        <meta name="description" content="Historial de compras y gastos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE COMPRAS Y GASTOS</h1>
        
        
        
        {/* Pestañas de navegación */}
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'compras' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-green-500'}`}
            onClick={() => setActiveTab('compras')}
          >
            Compras a Proveedores ({compras.length})
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'gastos' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
            onClick={() => setActiveTab('gastos')}
          >
            Gastos Generales ({gastos.length})
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'todos' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-purple-500'}`}
            onClick={() => setActiveTab('todos')}
          >
            Todos los Egresos ({compras.length + gastos.length})
          </button>
        </div>
        
        {/* Tabla de Compras a Proveedores */}
        {(activeTab === 'compras' || activeTab === 'todos') && (
          <div className={`mb-8 ${activeTab !== 'compras' && 'border-b pb-8'}`}>
            {activeTab === 'todos' && (
              <h2 className="text-xl font-semibold mb-4 text-green-700">Compras a Proveedores</h2>
            )}
            
            {/* Estado de carga */}
            {cargandoCompras ? (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-600">Cargando compras...</p>
              </div>
            ) : (
              <>
                {/* Vista de escritorio */}
                <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
                  <table className="w-full">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="p-2 w-10">
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAllCompras}
                            checked={comprasActuales.length > 0 && comprasActuales.every(c => selectedCompras.includes(c.id))}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="p-2">ID</th>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Proveedor</th>
                        <th className="p-2">CUIT</th>
                        <th className="p-2">TOTAL ($)</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprasActuales.length > 0 ? (
                        comprasActuales.map((compra) => (
                          <tr key={compra.id} className="hover:bg-gray-100 cursor-pointer">
                            <td className="p-2 text-center">
                              <input 
                                type="checkbox"
                                checked={selectedCompras.includes(compra.id)}
                                onChange={() => handleSelectCompra(compra.id)}
                                className="w-4 h-4"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="p-2 text-center" onClick={() => handleVerDetalleCompra(compra)}>{compra.id}</td>
                            <td className="p-2" onClick={() => handleVerDetalleCompra(compra)}>{formatDate(compra.fecha)}</td>
                            <td className="p-2" onClick={() => handleVerDetalleCompra(compra)}>{compra.proveedor_nombre}</td>
                            <td className="p-2" onClick={() => handleVerDetalleCompra(compra)}>{compra.proveedor_cuit}</td>
                            <td className="p-2" onClick={() => handleVerDetalleCompra(compra)}>{formatCurrency(compra.total)}</td>
                            <td className="p-2" onClick={() => handleVerDetalleCompra(compra)}>{compra.estado}</td>
                            <td className="p-2 text-center">
                              <button 
                                onClick={() => handleOpenComprobanteModal(compra.id, 'compra')}
                                className="bg-blue-500 text-white p-1 rounded"
                                title="Ver/Cargar Comprobante"
                              >
                                <MdRemoveRedEye size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="p-4 text-center text-gray-500">
                            No hay compras registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Paginador */}
                  {compras.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="flex items-center">
                        <span className="mr-2">Mostrar</span>
                        <select 
                          className="border rounded px-2 py-1"
                          value={registrosPorPagina}
                          onChange={(e) => {
                            setRegistrosPorPagina(Number(e.target.value));
                            setPaginaActualCompras(1);
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="ml-2">registros por página</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="mr-4">
                          Mostrando {indexOfPrimerRegistroCompras + 1} a {Math.min(indexOfUltimoRegistroCompras, compras.length)} de {compras.length} registros
                        </span>
                        
                        <div className="flex">
                          <button 
                            onClick={() => setPaginaActualCompras(1)}
                            disabled={paginaActualCompras === 1}
                            className={`px-3 py-1 border rounded-l ${paginaActualCompras === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟪
                          </button>
                          <button 
                            onClick={() => setPaginaActualCompras(paginaActualCompras - 1)}
                            disabled={paginaActualCompras === 1}
                            className={`px-3 py-1 border-t border-b ${paginaActualCompras === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟨
                          </button>
                          
                          {/* Botones de página */}
                          {Array.from({ length: totalPaginasCompras }, (_, i) => i + 1)
                            .filter(num => 
                              num === 1 || 
                              num === totalPaginasCompras || 
                              (num >= paginaActualCompras - 1 && num <= paginaActualCompras + 1)
                            )
                            .map((numero, index, array) => {
                              const mostrarPuntosSuspensivos = index > 0 && numero - array[index - 1] > 1;
                              
                              return (
                                <Fragment key={numero}>
                                  {mostrarPuntosSuspensivos && (
                                    <span className="px-3 py-1 border-t border-b">...</span>
                                  )}
                                  <button 
                                    onClick={() => setPaginaActualCompras(numero)}
                                    className={`px-3 py-1 border-t border-b ${
                                      paginaActualCompras === numero ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    {numero}
                                  </button>
                                </Fragment>
                              );
                            })
                          }
                          
                          <button 
                            onClick={() => setPaginaActualCompras(paginaActualCompras + 1)}
                            disabled={paginaActualCompras === totalPaginasCompras}
                            className={`px-3 py-1 border-t border-b ${paginaActualCompras === totalPaginasCompras ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟩
                          </button>
                          <button 
                            onClick={() => setPaginaActualCompras(totalPaginasCompras)}
                            disabled={paginaActualCompras === totalPaginasCompras}
                            className={`px-3 py-1 border rounded-r ${paginaActualCompras === totalPaginasCompras ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟫
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Vista móvil para compras */}
                <div className="md:hidden space-y-4">
                  {comprasActuales.length > 0 ? (
                    comprasActuales.map((compra) => (
                      <div key={compra.id} className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                          <input 
                            type="checkbox"
                            checked={selectedCompras.includes(compra.id)}
                            onChange={() => handleSelectCompra(compra.id)}
                            className="w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button 
                            onClick={() => handleOpenComprobanteModal(compra.id, 'compra')}
                            className="bg-blue-500 text-white p-1 rounded"
                          >
                            <MdRemoveRedEye size={20} />
                          </button>
                        </div>
                        <div onClick={() => handleVerDetalleCompra(compra)}>
                          <div className="flex justify-between">
                            <span className="font-bold">ID:</span>
                            <span>{compra.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Fecha:</span>
                            <span>{formatDate(compra.fecha)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Proveedor:</span>
                            <span>{compra.proveedor_nombre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Total:</span>
                            <span>{formatCurrency(compra.total)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Estado:</span>
                            <span>{compra.estado}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
                      No hay compras registradas
                    </div>
                  )}
                  
                  {/* Paginador móvil para compras */}
                  {compras.length > 0 && (
                    <div className="bg-white p-4 rounded shadow">
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => setPaginaActualCompras(paginaActualCompras - 1)}
                          disabled={paginaActualCompras === 1}
                          className={`px-3 py-1 rounded ${paginaActualCompras === 1 ? 'bg-gray-100 text-gray-400' : 'bg-green-500 text-white'}`}
                        >
                          Anterior
                        </button>
                        
                        <span>
                          Página {paginaActualCompras} de {totalPaginasCompras}
                        </span>
                        
                        <button 
                          onClick={() => setPaginaActualCompras(paginaActualCompras + 1)}
                          disabled={paginaActualCompras === totalPaginasCompras}
                          className={`px-3 py-1 rounded ${paginaActualCompras === totalPaginasCompras ? 'bg-gray-100 text-gray-400' : 'bg-green-500 text-white'}`}
                        >
                          Siguiente
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        <select 
                          className="border rounded w-full p-2"
                          value={registrosPorPagina}
                          onChange={(e) => {
                            setRegistrosPorPagina(Number(e.target.value));
                            setPaginaActualCompras(1);
                          }}
                        >
                          <option value={5}>5 por página</option>
                          <option value={10}>10 por página</option>
                          <option value={20}>20 por página</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {activeTab === 'compras' && (
              <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
                
                <button 
                  className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
                  onClick={confirmarSalida}
                >
                  Volver al Menú
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Tabla de Gastos */}
        {(activeTab === 'gastos' || activeTab === 'todos') && (
          <div className="mb-6">
            {activeTab === 'todos' && (
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Gastos Generales</h2>
            )}
            
            {/* Estado de carga */}
            {cargandoGastos ? (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-600">Cargando gastos...</p>
              </div>
            ) : (
              <>
                {/* Vista de escritorio */}
                <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="p-2 w-10">
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAllGastos}
                            checked={gastosActuales.length > 0 && gastosActuales.every(g => selectedGastos.includes(g.id))}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="p-2">ID</th>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Descripción</th>
                        <th className="p-2">Monto ($)</th>
                        <th className="p-2">Forma de Pago</th>
                        <th className="p-2">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosActuales.length > 0 ? (
                        gastosActuales.map((gasto) => (
                          <tr key={gasto.id} className="hover:bg-gray-100 cursor-pointer">
                            <td className="p-2 text-center">
                              <input 
                                type="checkbox"
                                checked={selectedGastos.includes(gasto.id)}
                                onChange={() => handleSelectGasto(gasto.id)}
                                className="w-4 h-4"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="p-2 text-center" onClick={() => handleVerDetalleGasto(gasto)}>{gasto.id}</td>
                            <td className="p-2" onClick={() => handleVerDetalleGasto(gasto)}>{formatDate(gasto.fecha)}</td>
                            <td className="p-2" onClick={() => handleVerDetalleGasto(gasto)}>{gasto.descripcion}</td>
                            <td className="p-2" onClick={() => handleVerDetalleGasto(gasto)}>{formatCurrency(gasto.monto)}</td>
                            <td className="p-2" onClick={() => handleVerDetalleGasto(gasto)}>{gasto.forma_pago}</td>
                            <td className="p-2 text-center">
                              <button 
                                onClick={() => handleOpenComprobanteModal(gasto.id, 'gasto')}
                                className="bg-blue-500 text-white p-1 rounded"
                                title="Ver/Cargar Comprobante"
                              >
                                <MdRemoveRedEye size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-4 text-center text-gray-500">
                            No hay gastos registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Paginador */}
                  {gastos.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="flex items-center">
                        <span className="mr-2">Mostrar</span>
                        <select 
                          className="border rounded px-2 py-1"
                          value={registrosPorPagina}
                          onChange={(e) => {
                            setRegistrosPorPagina(Number(e.target.value));
                            setPaginaActualGastos(1);
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="ml-2">registros por página</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="mr-4">
                          Mostrando {indexOfPrimerRegistroGastos + 1} a {Math.min(indexOfUltimoRegistroGastos, gastos.length)} de {gastos.length} registros
                        </span>
                        
                        <div className="flex">
                          <button 
                            onClick={() => setPaginaActualGastos(1)}
                            disabled={paginaActualGastos === 1}
                            className={`px-3 py-1 border rounded-l ${paginaActualGastos === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟪
                          </button>
                          <button 
                            onClick={() => setPaginaActualGastos(paginaActualGastos - 1)}
                            disabled={paginaActualGastos === 1}
                            className={`px-3 py-1 border-t border-b ${paginaActualGastos === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟨
                          </button>
                          
                          {/* Botones de página */}
                          {Array.from({ length: totalPaginasGastos }, (_, i) => i + 1)
                            .filter(num => 
                              num === 1 || 
                              num === totalPaginasGastos || 
                              (num >= paginaActualGastos - 1 && num <= paginaActualGastos + 1)
                            )
                            .map((numero, index, array) => {
                              const mostrarPuntosSuspensivos = index > 0 && numero - array[index - 1] > 1;
                              
                              return (
                                <Fragment key={numero}>
                                  {mostrarPuntosSuspensivos && (
                                    <span className="px-3 py-1 border-t border-b">...</span>
                                  )}
                                  <button 
                                    onClick={() => setPaginaActualGastos(numero)}
                                    className={`px-3 py-1 border-t border-b ${
                                      paginaActualGastos === numero ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    {numero}
                                  </button>
                                </Fragment>
                              );
                            })
                          }
                          
                          <button 
                            onClick={() => setPaginaActualGastos(paginaActualGastos + 1)}
                            disabled={paginaActualGastos === totalPaginasGastos}
                            className={`px-3 py-1 border-t border-b ${paginaActualGastos === totalPaginasGastos ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟩
                          </button>
                          <button 
                            onClick={() => setPaginaActualGastos(totalPaginasGastos)}
                            disabled={paginaActualGastos === totalPaginasGastos}
                            className={`px-3 py-1 border rounded-r ${paginaActualGastos === totalPaginasGastos ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'}`}
                          >
                            ⟫
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Vista móvil para gastos */}
                <div className="md:hidden space-y-4">
                  {gastosActuales.length > 0 ? (
                    gastosActuales.map((gasto) => (
                      <div key={gasto.id} className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                          <input 
                            type="checkbox"
                            checked={selectedGastos.includes(gasto.id)}
                            onChange={() => handleSelectGasto(gasto.id)}
                            className="w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button 
                            onClick={() => handleOpenComprobanteModal(gasto.id, 'gasto')}
                            className="bg-blue-500 text-white p-1 rounded"
                          >
                            <MdRemoveRedEye size={20} />
                          </button>
                        </div>
                        <div onClick={() => handleVerDetalleGasto(gasto)}>
                          <div className="flex justify-between">
                            <span className="font-bold">ID:</span>
                            <span>{gasto.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Fecha:</span>
                            <span>{formatDate(gasto.fecha)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Descripción:</span>
                            <span>{gasto.descripcion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Monto:</span>
                            <span>{formatCurrency(gasto.monto)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Forma de Pago:</span>
                            <span>{gasto.forma_pago}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
                      No hay gastos registrados
                    </div>
                  )}
                  
                  {/* Paginador móvil para gastos */}
                  {gastos.length > 0 && (
                    <div className="bg-white p-4 rounded shadow">
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => setPaginaActualGastos(paginaActualGastos - 1)}
                          disabled={paginaActualGastos === 1}
                          className={`px-3 py-1 rounded ${paginaActualGastos === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}`}
                        >
                          Anterior
                        </button>
                        
                        <span>
                          Página {paginaActualGastos} de {totalPaginasGastos}
                        </span>
                        
                        <button 
                          onClick={() => setPaginaActualGastos(paginaActualGastos + 1)}
                          disabled={paginaActualGastos === totalPaginasGastos}
                          className={`px-3 py-1 rounded ${paginaActualGastos === totalPaginasGastos ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white'}`}
                        >
                          Siguiente
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        <select 
                          className="border rounded w-full p-2"
                          value={registrosPorPagina}
                          onChange={(e) => {
                            setRegistrosPorPagina(Number(e.target.value));
                            setPaginaActualGastos(1);
                          }}
                        >
                          <option value={5}>5 por página</option>
                          <option value={10}>10 por página</option>
                          <option value={20}>20 por página</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {activeTab === 'gastos' && (
              <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
               
                <button 
                  className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
                  onClick={confirmarSalida}
                >
                  Volver al Menú
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Botones de acción (para pestaña "Todos") */}
        {activeTab === 'todos' && (
          <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
            <button 
              className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
              onClick={confirmarSalida}
            >
              Volver al Menú
            </button>
          </div>
        )}
      </div>
      
      {/* Modal de detalle de compra */}
      {selectedCompra && modalDetalleCompraOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Detalle de Compra</h2>
            <h4 className="mt-2"><strong>Fecha:</strong> {formatDate(selectedCompra.fecha)}</h4>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
              {/* Información del Proveedor */}
              <div className="w-full md:w-1/2">
                <h3 className="font-bold mb-2">Información del Proveedor</h3>
                <p><strong>Proveedor:</strong> {selectedCompra.proveedor_nombre}</p>
                <p><strong>CUIT:</strong> {selectedCompra.proveedor_cuit}</p>
              </div>
              
              {/* Información de la Compra */}
              <div className="w-full md:w-1/2">
                <h3 className="font-bold mb-2">Información de la Compra</h3>
                <p><strong>Estado:</strong> {selectedCompra.estado}</p>
                <p><strong>Total:</strong> {formatCurrency(selectedCompra.total)}</p>
              </div>
            </div>
            
            {/* Sección de productos */}
            <div className="mt-6">
              <h3 className="font-bold mb-2">Productos Comprados</h3>
              
              <div className="overflow-x-auto bg-white rounded shadow">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2">Código</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">UM</th>
                      <th className="p-2">Cantidad</th>
                      <th className="p-2">Precio Costo</th>
                      <th className="p-2">Precio Venta</th>
                      <th className="p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosCompra.length > 0 ? (
                      productosCompra.map((producto) => (
                        <tr key={producto.id} className="hover:bg-gray-100">
                          <td className="p-2">{producto.producto_id}</td>
                          <td className="p-2">{producto.producto_nombre}</td>
                          <td className="p-2">{producto.producto_um}</td>
                          <td className="p-2">{producto.cantidad}</td>
                          <td className="p-2">{formatCurrency(producto.precio_costo)}</td>
                          <td className="p-2">{formatCurrency(producto.precio_venta)}</td>
                          <td className="p-2">{formatCurrency(producto.subtotal)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-500">
                          No hay productos en esta compra
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between gap-2 mt-6">
              <button 
                onClick={() => handleOpenComprobanteModal(selectedCompra.id, 'compra')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
              >
                GESTIONAR COMPROBANTE
              </button>
              
              
            </div>
            
            <button 
              onClick={() => setModalDetalleCompraOpen(false)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de detalle de gasto */}
      {selectedGasto && modalDetalleGastoOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Detalle del Gasto</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="font-semibold">ID:</span>
                  <span>{selectedGasto.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Fecha:</span>
                  <span>{formatDate(selectedGasto.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Descripción:</span>
                  <span>{selectedGasto.descripcion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Monto:</span>
                  <span className="font-bold text-blue-700">{formatCurrency(selectedGasto.monto)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Forma de Pago:</span>
                  <span>{selectedGasto.forma_pago}</span>
                </div>
              </div>
              
              {selectedGasto.observaciones && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="font-semibold">Observaciones:</p>
                  <p className="text-gray-700 mt-1">{selectedGasto.observaciones}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-between gap-2 mt-6">
              <button 
                onClick={() => handleOpenComprobanteModal(selectedGasto.id, 'gasto')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
              >
                GESTIONAR COMPROBANTE
              </button>
              
              
            </div>
            
            <button 
              onClick={() => setModalDetalleGastoOpen(false)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Modal para cargar comprobantes - ACTUALIZADO */}
      {mostrarModalComprobante && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Gestión de Comprobante</h2>
            
            <div className="text-center mb-4">
              <p className="text-gray-700">
                {tipoComprobante === 'compra' ? 'Compra' : 'Gasto'} #{idComprobante}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {comprobanteExistente ? (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <MdRemoveRedEye size={36} className="text-blue-600" />
                  </div>
                  <p className="mb-4 text-green-700 font-medium">
                    Este {tipoComprobante === 'compra' ? 'compra' : 'gasto'} ya tiene un comprobante cargado.
                  </p>
                  <div className="flex gap-2 justify-center mb-4 flex-wrap">
                    <button 
                      onClick={handleViewComprobante}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Ver Comprobante
                    </button>
                    <button 
                      onClick={handleEliminarComprobante}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Si necesitas reemplazar el comprobante, selecciona un nuevo archivo.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <MdCloudUpload size={48} className="text-blue-600" />
                  </div>
                  <p className="mb-4">
                    No hay ningún comprobante cargado para este {tipoComprobante === 'compra' ? 'compra' : 'gasto'}.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-white text-center hover:bg-gray-50 transition-colors cursor-pointer mb-6">
              <input 
                type="file"
                id="comprobante-input"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label 
                htmlFor="comprobante-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <span className="text-blue-600 hover:text-blue-800 font-medium mb-2">
                  Haz clic aquí para seleccionar un archivo
                </span>
                <span className="text-xs text-gray-500">
                  Formatos aceptados: PDF, JPG, PNG, DOC, DOCX (Máx. 10MB)
                </span>
              </label>
              
              {/* Mostrar información del archivo usando el hook */}
              {comprobante && getArchivoInfo() && (
                <div className="mt-4 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Archivo seleccionado:</p>
                  <p className="text-sm text-gray-600 truncate">{getArchivoInfo().nombre}</p>
                  <p className="text-xs text-gray-500">
                    Tamaño: {getArchivoInfo().tamaño}
                  </p>
                  
                  {getArchivoInfo().preview && (
                    <div className="mt-2 flex justify-center">
                      <img 
                        src={getArchivoInfo().preview} 
                        alt="Vista previa" 
                        className="h-32 object-contain rounded border" 
                      />
                    </div>
                  )}
                  
                  {!getArchivoInfo().preview && getArchivoInfo().tipo === 'application/pdf' && (
                    <div className="mt-2 flex justify-center">
                      <p className="text-xs text-gray-500">
                        Vista previa no disponible para archivos PDF
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
              <button 
                onClick={() => setMostrarModalComprobante(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded order-2 sm:order-1"
              >
                Cancelar
              </button>
              
              <button 
                onClick={handleUploadComprobante}
                disabled={!comprobante || uploadingComprobante}
                className={`px-4 py-2 rounded text-white order-1 sm:order-2 ${
                  !comprobante || uploadingComprobante 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploadingComprobante ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </div>
                ) : (
                  comprobanteExistente ? "Reemplazar Comprobante" : "Subir Comprobante"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de salida */}
      {mostrarConfirmacionSalida && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">¿Estás seguro que deseas salir?</h3>
            <div className="text-center mb-6">
              <p className="mb-2">Se perderán los cambios no guardados.</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
              >
                Sí, Salir
              </button>
              <button
                onClick={() => setMostrarConfirmacionSalida(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
              >
                No, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}