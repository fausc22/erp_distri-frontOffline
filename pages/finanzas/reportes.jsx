import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { 
  MdAutorenew, 
  MdFilterList, 
  MdClearAll, 
  MdPieChart, 
  MdBarChart, 
  MdShowChart,
  MdAccountBalance
} from "react-icons/md";

// Componentes para gráficos
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function ReportesFinancieros() {
  // Estado para autenticación
  useAuth();
  
  // Estado para el reporte activo
  const [reporteActivo, setReporteActivo] = useState('balance-general');
  
  // Estados para los datos de reportes
  const [balanceGeneral, setBalanceGeneral] = useState([]);
  const [balancePorCuenta, setBalancePorCuenta] = useState([]);
  const [distribucionIngresos, setDistribucionIngresos] = useState([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [flujoDeFondos, setFlujoDeFondos] = useState([]);
  
  // Estado para los totales
  const [totales, setTotales] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balanceTotal: 0
  });
  
  // Estado para filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    anio: new Date().getFullYear(),
    cuenta_id: ''
  });
  
  // Estado para lista de años y cuentas para filtros
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [cuentasDisponibles, setCuentasDisponibles] = useState([]);
  
  // Estado para indicar carga
  const [cargando, setCargando] = useState(false);
  
  // API URL Base
  const API_BASE_URL = 'http://localhost:3001/finanzas/reportes';
  
  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57', '#8dd1e1'];
  const COLORS_BALANCE = {
    ingresos: '#00C49F',
    egresos: '#FF8042',
    balance: '#0088FE'
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarAniosDisponibles();
    cargarCuentas();
    cargarReporteActivo();
  }, []);
  
  // Cargar reporte cuando cambia el reporte activo o se aplican filtros
  useEffect(() => {
    cargarReporteActivo();
  }, [reporteActivo, filtros]);
  
  // Función para cargar años disponibles
  const cargarAniosDisponibles = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/finanzas/anios-disponibles`);
      
      if (response.data.success) {
        setAniosDisponibles(response.data.data);
        
        // Si hay años disponibles y no se ha seleccionado uno, usar el más reciente
        if (response.data.data.length > 0 && !filtros.anio) {
          setFiltros({
            ...filtros,
            anio: response.data.data[0]
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar años disponibles:', error);
      toast.error('No se pudieron cargar los años disponibles');
    }
  };
  
  // Función para cargar cuentas
  const cargarCuentas = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/finanzas/cuentas`);
      
      if (response.data.success) {
        setCuentasDisponibles(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      toast.error('No se pudieron cargar las cuentas');
    }
  };
  
  // Función para cargar el reporte activo
  const cargarReporteActivo = async () => {
    setCargando(true);
    
    try {
      switch (reporteActivo) {
        case 'balance-general':
          await cargarBalanceGeneral();
          break;
        case 'balance-cuenta':
          await cargarBalancePorCuenta();
          break;
        case 'distribucion-ingresos':
          await cargarDistribucionIngresos();
          break;
        case 'gastos-categoria':
          await cargarGastosPorCategoria();
          break;
        case 'flujo-fondos':
          await cargarFlujoDeFondos();
          break;
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      toast.error('No se pudo cargar el reporte');
    } finally {
      setCargando(false);
    }
  };
  
  // Función para cargar balance general
  const cargarBalanceGeneral = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.anio) params.append('anio', filtros.anio);
      
      const response = await axios.get(`http://localhost:3001/finanzas/balance-general?${params.toString()}`);
      
      if (response.data.success) {
        // Transforma los datos para el gráfico
        const dataFormateada = response.data.data.map(item => ({
          mes: formatMes(item.mes),
          ingresos: parseFloat(item.ingresos),
          egresos: parseFloat(item.egresos),
          balance: parseFloat(item.balance)
        }));
        
        setBalanceGeneral(dataFormateada);
        setTotales(response.data.totales);
      }
    } catch (error) {
      console.error('Error al cargar balance general:', error);
      throw error;
    }
  };
  
  // Función para cargar balance por cuenta
  const cargarBalancePorCuenta = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      
      const response = await axios.get(`http://localhost:3001/finanzas/balance-cuenta?${params.toString()}`);
      
      if (response.data.success) {
        setBalancePorCuenta(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar balance por cuenta:', error);
      throw error;
    }
  };
  
  // Función para cargar distribución de ingresos
  const cargarDistribucionIngresos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      
      const response = await axios.get(`http://localhost:3001/finanzas/distribucion-ingresos?${params.toString()}`);
      
      if (response.data.success) {
        setDistribucionIngresos(response.data.data);
        setTotales({
          ...totales,
          totalIngresos: response.data.total
        });
      }
    } catch (error) {
      console.error('Error al cargar distribución de ingresos:', error);
      throw error;
    }
  };
  
  // Función para cargar gastos por categoría
  const cargarGastosPorCategoria = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      params.append('limite', 10); // Mostrar top 10 categorías
      
      const response = await axios.get(`http://localhost:3001/finanzas/gastos-categoria?${params.toString()}`);
      
      if (response.data.success) {
        setGastosPorCategoria(response.data.data);
        setTotales({
          ...totales,
          totalEgresos: response.data.total
        });
      }
    } catch (error) {
      console.error('Error al cargar gastos por categoría:', error);
      throw error;
    }
  };
  
  // Función para cargar flujo de fondos
  const cargarFlujoDeFondos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.cuenta_id) params.append('cuenta_id', filtros.cuenta_id);
      
      const response = await axios.get(`http://localhost:3001/finanzas/flujo-fondos?${params.toString()}`);
      
      if (response.data.success) {
        setFlujoDeFondos(response.data.data);
        setTotales(response.data.totales);
      }
    } catch (error) {
      console.error('Error al cargar flujo de fondos:', error);
      throw error;
    }
  };
  
  // Función para aplicar filtros
  const aplicarFiltros = () => {
    cargarReporteActivo();
    setMostrarFiltros(false);
  };
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    const anioActual = new Date().getFullYear();
    setFiltros({
      desde: '',
      hasta: '',
      anio: anioActual,
      cuenta_id: ''
    });
  };
  
  // Funciones de utilidad para formateo
  const formatMes = (mesStr) => {
    if (!mesStr) return '';
    const [anio, mes] = mesStr.split('-');
    const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 1);
    return fecha.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  };
  
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };
  
  const formatPorcentaje = (value) => {
    if (value === undefined || value === null) return '-';
    return `${parseFloat(value).toFixed(2)}%`;
  };
  
  // Función personalizada para tooltips en gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const PieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-bold">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>
            {formatCurrency(payload[0].value)} ({formatPorcentaje(payload[0].payload.porcentaje || (payload[0].value / totales.totalIngresos * 100))})
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | REPORTES FINANCIEROS</title>
        <meta name="description" content="Reportes financieros en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">REPORTES FINANCIEROS</h1>
        
        {/* Tabs de navegación */}
        <div className="flex flex-wrap border-b mb-6">
          <button
            className={`px-4 py-2 mr-2 mb-2 rounded-t-lg ${
              reporteActivo === 'balance-general' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setReporteActivo('balance-general')}
          >
            <div className="flex items-center">
              <MdBarChart className="mr-1" /> Balance General
            </div>
          </button>
          <button
            className={`px-4 py-2 mr-2 mb-2 rounded-t-lg ${
              reporteActivo === 'balance-cuenta' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setReporteActivo('balance-cuenta')}
          >
            <div className="flex items-center">
              <MdAccountBalance className="mr-1" /> Balance por Cuenta
            </div>
          </button>
          <button
            className={`px-4 py-2 mr-2 mb-2 rounded-t-lg ${
              reporteActivo === 'distribucion-ingresos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setReporteActivo('distribucion-ingresos')}
          >
            <div className="flex items-center">
              <MdPieChart className="mr-1" /> Distribución de Ingresos
            </div>
          </button>
          <button
            className={`px-4 py-2 mr-2 mb-2 rounded-t-lg ${
              reporteActivo === 'gastos-categoria' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setReporteActivo('gastos-categoria')}
          >
            <div className="flex items-center">
              <MdPieChart className="mr-1" /> Gastos por Categoría
            </div>
          </button>
          <button
            className={`px-4 py-2 mr-2 mb-2 rounded-t-lg ${
              reporteActivo === 'flujo-fondos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setReporteActivo('flujo-fondos')}
          >
            <div className="flex items-center">
              <MdShowChart className="mr-1" /> Flujo de Fondos
            </div>
          </button>
        </div>
        
        {/* Barra de acciones */}
        <div className="flex justify-between mb-6">
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <MdFilterList className="mr-1" /> {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={cargarReporteActivo}
          >
            <MdAutorenew className="mr-1" /> Actualizar
          </button>
        </div>
        
        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                className="text-gray-600 hover:text-gray-800 flex items-center"
                onClick={limpiarFiltros}
              >
                <MdClearAll className="mr-1" /> Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro por año para balance general */}
              {reporteActivo === 'balance-general' && (
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filtros.anio || ''}
                    onChange={(e) => setFiltros({...filtros, anio: e.target.value})}
                  >
                    <option value="">Todos los años</option>
                    {aniosDisponibles.map((anio, index) => (
                      <option key={index} value={anio}>{anio}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Filtros de fecha para otros reportes */}
              {reporteActivo !== 'balance-general' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={filtros.desde || ''}
                      onChange={(e) => setFiltros({...filtros, desde: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={filtros.hasta || ''}
                      onChange={(e) => setFiltros({...filtros, hasta: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              {/* Filtro de cuenta para flujo de fondos */}
              {reporteActivo === 'flujo-fondos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filtros.cuenta_id || ''}
                    onChange={(e) => setFiltros({...filtros, cuenta_id: e.target.value})}
                  >
                    <option value="">Todas las cuentas</option>
                    {cuentasDisponibles.map((cuenta, index) => (
                      <option key={index} value={cuenta.id}>{cuenta.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={aplicarFiltros}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
        
        {/* Contenido del reporte */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {cargando ? (
            <div className="p-8 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-500">Cargando reporte...</p>
            </div>
          ) : (
            <>
              {/* Balance General */}
              {reporteActivo === 'balance-general' && (
                <div className="p-4">
                  <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-semibold mb-2">Balance General {filtros.anio ? `- ${filtros.anio}` : ''}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-700 rounded-lg p-3">
                        <h3 className="text-sm opacity-80">Total Ingresos</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totales.totalIngresos || 0)}</p>
                      </div>
                      <div className="bg-red-700 rounded-lg p-3">
                        <h3 className="text-sm opacity-80">Total Egresos</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totales.totalEgresos || 0)}</p>
                      </div>
                      <div className={`${totales.balanceTotal >= 0 ? 'bg-blue-700' : 'bg-red-800'} rounded-lg p-3`}>
                        <h3 className="text-sm opacity-80">Balance Total</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totales.balanceTotal || 0)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {balanceGeneral.length > 0 ? (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={balanceGeneral}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="mes" 
                            angle={-45} 
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="ingresos" name="Ingresos" fill={COLORS_BALANCE.ingresos} />
                          <Bar dataKey="egresos" name="Egresos" fill={COLORS_BALANCE.egresos} />
                          <Bar dataKey="balance" name="Balance" fill={COLORS_BALANCE.balance} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No hay datos de balance para el período seleccionado
                    </div>
                  )}
                  
                  {/* Tabla de datos */}
                  <div className="mt-8 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egresos</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {balanceGeneral.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.mes}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(item.ingresos)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">{formatCurrency(item.egresos)}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${item.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {formatCurrency(item.balance)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-700 font-bold">{formatCurrency(totales.totalIngresos)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-700 font-bold">{formatCurrency(totales.totalEgresos)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${totales.balanceTotal >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                            {formatCurrency(totales.balanceTotal)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Balance por Cuenta */}
              {reporteActivo === 'balance-cuenta' && (
                <div className="p-4">
                  <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-semibold">Balance por Cuenta</h2>
                    <p className="text-sm opacity-80">
                      {filtros.desde && filtros.hasta 
                        ? `Del ${new Date(filtros.desde).toLocaleDateString()} al ${new Date(filtros.hasta).toLocaleDateString()}`
                        : filtros.desde
                          ? `Desde ${new Date(filtros.desde).toLocaleDateString()}`
                          : filtros.hasta
                            ? `Hasta ${new Date(filtros.hasta).toLocaleDateString()}`
                            : 'Período completo'
                      }
                    </p>
                  </div>
                  
                  {balancePorCuenta.length > 0 ? (
                    <>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={balancePorCuenta}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="cuenta" width={150} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="ingresos" name="Ingresos" fill={COLORS_BALANCE.ingresos} />
                            <Bar dataKey="egresos" name="Egresos" fill={COLORS_BALANCE.egresos} />
                            <Bar dataKey="balance" name="Balance" fill={COLORS_BALANCE.balance} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-8 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egresos</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {balancePorCuenta.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.cuenta}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(item.ingresos)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">{formatCurrency(item.egresos)}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${item.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                  {formatCurrency(item.balance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No hay datos de balance por cuenta para el período seleccionado
                    </div>
                  )}
                </div>
              )}
              
              {/* Distribución de Ingresos */}
              {reporteActivo === 'distribucion-ingresos' && (
                <div className="p-4">
                  <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-semibold">Distribución de Ingresos</h2>
                    <p className="text-sm opacity-80">
                      {filtros.desde && filtros.hasta 
                        ? `Del ${new Date(filtros.desde).toLocaleDateString()} al ${new Date(filtros.hasta).toLocaleDateString()}`
                        : filtros.desde
                          ? `Desde ${new Date(filtros.desde).toLocaleDateString()}`
                          : filtros.hasta
                            ? `Hasta ${new Date(filtros.hasta).toLocaleDateString()}`
                            : 'Período completo'
                      }
                    </p>
                  </div>
                  
                  {distribucionIngresos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              dataKey="valor"
                              data={distribucionIngresos}
                              nameKey="tipo"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({name, value, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                              {distribucionIngresos.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieCustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-semibold mb-4">Detalle de Ingresos</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {distribucionIngresos.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    {item.tipo}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-semibold">
                                  {formatCurrency(item.valor)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-semibold">
                                  {formatPorcentaje(item.valor / totales.totalIngresos * 100)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-100">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                                {formatCurrency(totales.totalIngresos)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                                100%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No hay datos de ingresos para el período seleccionado
                    </div>
                  )}
                </div>
              )}
              
              {/* Gastos por Categoría */}
              {reporteActivo === 'gastos-categoria' && (
                <div className="p-4">
                  <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-semibold">Principales Gastos por Categoría</h2>
                    <p className="text-sm opacity-80">
                      {filtros.desde && filtros.hasta 
                        ? `Del ${new Date(filtros.desde).toLocaleDateString()} al ${new Date(filtros.hasta).toLocaleDateString()}`
                        : filtros.desde
                          ? `Desde ${new Date(filtros.desde).toLocaleDateString()}`
                          : filtros.hasta
                            ? `Hasta ${new Date(filtros.hasta).toLocaleDateString()}`
                            : 'Período completo'
                      }
                    </p>
                  </div>
                  
                  {gastosPorCategoria.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              dataKey="total"
                              data={gastosPorCategoria}
                              nameKey="categoria"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({name, porcentaje}) => `${name}: ${porcentaje}%`}
                            >
                              {gastosPorCategoria.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieCustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-semibold mb-4">Detalle de Gastos por Categoría</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {gastosPorCategoria.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    {item.categoria}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-semibold">
                                  {formatCurrency(item.total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-semibold">
                                  {formatPorcentaje(item.porcentaje)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No hay datos de gastos para el período seleccionado
                    </div>
                  )}
                </div>
              )}
              
              {/* Flujo de Fondos */}
              {reporteActivo === 'flujo-fondos' && (
                <div className="p-4">
                  <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
                    <h2 className="text-xl font-semibold mb-2">Flujo de Fondos</h2>
                    <p className="text-sm opacity-80">
                      {filtros.desde && filtros.hasta 
                        ? `Del ${new Date(filtros.desde).toLocaleDateString()} al ${new Date(filtros.hasta).toLocaleDateString()}`
                        : filtros.desde
                          ? `Desde ${new Date(filtros.desde).toLocaleDateString()}`
                          : filtros.hasta
                            ? `Hasta ${new Date(filtros.hasta).toLocaleDateString()}`
                            : 'Período completo'
                      }
                      {filtros.cuenta_id ? ` - Cuenta: ${cuentasDisponibles.find(c => c.id === parseInt(filtros.cuenta_id))?.nombre || filtros.cuenta_id}` : ' - Todas las cuentas'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="bg-green-700 rounded-lg p-3">
                        <h3 className="text-sm opacity-80">Total Ingresos</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totales.totalIngresos || 0)}</p>
                      </div>
                      <div className="bg-red-700 rounded-lg p-3">
                        <h3 className="text-sm opacity-80">Total Egresos</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totales.totalEgresos || 0)}</p>
                      </div>
                      <div className={`${totales.saldoFinal >= 0 ? 'bg-blue-700' : 'bg-red-800'} rounded-lg p-3`}>
                        <h3 className="text-sm opacity-80">Saldo Final</h3>
                        <p className="text-2xl font-bold">{formatCurrency(totales.saldoFinal || 0)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {flujoDeFondos.length > 0 ? (
                    <>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[...flujoDeFondos].reverse().filter((_, i) => i % 3 === 0)} // Simplificar datos para el gráfico
                            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="saldo_acumulado" 
                              name="Saldo Acumulado" 
                              stroke={COLORS_BALANCE.balance}
                              strokeWidth={2} 
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="ingreso" 
                              name="Ingresos" 
                              stroke={COLORS_BALANCE.ingresos} 
                              strokeWidth={1}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="egreso" 
                              name="Egresos" 
                              stroke={COLORS_BALANCE.egresos} 
                              strokeWidth={1}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-8 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egreso</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Acumulado</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {flujoDeFondos.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(item.fecha).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cuenta}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    item.tipo === 'INGRESO' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.tipo}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.origen}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                                  {parseFloat(item.ingreso) > 0 ? formatCurrency(item.ingreso) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">
                                  {parseFloat(item.egreso) > 0 ? formatCurrency(item.egreso) : '-'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                                  parseFloat(item.saldo_acumulado) >= 0 
                                    ? 'text-blue-600' 
                                    : 'text-red-600'
                                }`}>
                                  {formatCurrency(item.saldo_acumulado)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-100">
                              <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-700 font-bold">
                                {formatCurrency(totales.totalIngresos)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-700 font-bold">
                                {formatCurrency(totales.totalEgresos)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                                totales.saldoFinal >= 0 
                                  ? 'text-blue-700' 
                                  : 'text-red-700'
                              }`}>
                                {formatCurrency(totales.saldoFinal)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No hay datos de flujo de fondos para el período seleccionado
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}