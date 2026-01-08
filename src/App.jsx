import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Trash2, XCircle, Moon, Sun } from 'lucide-react' 
import { Toaster, toast } from 'sonner' 
import BotonGato from './components/BotonGato'
import CalendarioMichi from './components/CalendarioMichi'
import MichiChart from './components/MichiChart'

function App() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comidasHoy, setComidasHoy] = useState(0);
  const [fechaFiltro, setFechaFiltro] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [estadoArenero, setEstadoArenero] = useState({ texto: '...', estado: 'loading' });

  useEffect(() => {
    fetchRegistros();
  }, []);

  const recalcularEstadoArenero = (listaRegistros) => {
    const eventosArenero = listaRegistros
      .filter(r => r.tipo === 'Arenero')
      .sort((a, b) => b.rawDate - a.rawDate);

    if (eventosArenero.length > 0) {
      const ultimaLimpieza = eventosArenero[0].rawDate;
      const hoy = new Date();
      const horasPasadas = (hoy - ultimaLimpieza) / (1000 * 60 * 60);

      if (horasPasadas < 24) setEstadoArenero({ texto: 'Impecable', estado: 'excelente' });
      else if (horasPasadas < 48) setEstadoArenero({ texto: 'Limpio', estado: 'bien' });
      else setEstadoArenero({ texto: 'Limpiar', estado: 'alerta' });
    } else {
      setEstadoArenero({ texto: 'Sin datos', estado: 'neutro' });
    }
  };

  const fetchRegistros = async () => {
    setLoading(true);
    const { data: comidas } = await supabase.from('comidas').select('*').order('timestamp', { ascending: false }).limit(50);
    const { data: arenero } = await supabase.from('arenero').select('*').order('timestamp', { ascending: false }).limit(50);

    const listaComidas = (comidas || []).map(c => ({
      id: `c-${c.id}`,
      tipo: 'Comida',
      detalle: 'Comieron las dos',
      fecha: new Date(c.timestamp).toLocaleString('es-CL'),
      rawDate: new Date(c.timestamp)
    }));

    const listaArenero = (arenero || []).map(a => ({
      id: `a-${a.id}`,
      tipo: 'Arenero',
      detalle: a.type === 'total' ? 'Profunda' : 'Rápida',
      fecha: new Date(a.timestamp).toLocaleString('es-CL'),
      rawDate: new Date(a.timestamp)
    }));

    const todos = [...listaComidas, ...listaArenero].sort((a, b) => b.rawDate - a.rawDate);
    setRegistros(todos);

    const hoy = new Date();
    const conteo = todos.filter(item => {
      if (item.tipo !== 'Comida') return false;
      return item.rawDate.getDate() === hoy.getDate() &&
             item.rawDate.getMonth() === hoy.getMonth() &&
             item.rawDate.getFullYear() === hoy.getFullYear();
    }).length;
    setComidasHoy(conteo);
    recalcularEstadoArenero(todos);
    setLoading(false);
  };

  const registrarEvento = async (tipo) => {
    try {
      const promesa = tipo === 'Comida' 
        ? supabase.from('comidas').insert([{ cat_name: 'Ambas', amount: 'Normal' }])
        : supabase.from('arenero').insert([{ type: 'parcial', notes: 'Limpieza normal' }]);

      toast.promise(promesa, {
        loading: 'Guardando...',
        success: () => {
          setFechaFiltro(null);
          fetchRegistros(); 
          return `${tipo} registrado`;
        },
        error: 'Error al guardar',
      });
    } catch (error) {
      toast.error('Error inesperado');
    }
  };

  const borrarRegistro = async (id, tipo) => {
    toast('¿Borrar este registro?', {
      action: {
        label: 'Borrar',
        onClick: async () => {
           const idReal = id.split('-')[1];
           const tabla = tipo === 'Comida' ? 'comidas' : 'arenero';
           await supabase.from(tabla).delete().eq('id', idReal);
           
           const nuevaLista = registros.filter(item => item.id !== id);
           setRegistros(nuevaLista);
           
           if (tipo === 'Arenero') recalcularEstadoArenero(nuevaLista);
           
           if (tipo === 'Comida') {
             const hoy = new Date();
             const nuevoConteo = nuevaLista.filter(item => {
                if (item.tipo !== 'Comida') return false;
                return item.rawDate.getDate() === hoy.getDate() &&
                       item.rawDate.getMonth() === hoy.getMonth() &&
                       item.rawDate.getFullYear() === hoy.getFullYear();
             }).length;
             setComidasHoy(nuevoConteo);
           }
           toast.success('Registro eliminado');
           fetchRegistros(); // Sync final
        }
      },
    });
  };

  const manejarClickCalendario = (fecha) => {
    setFechaFiltro(fecha);
  };

  const registrosParaMostrar = fechaFiltro 
    ? registros.filter(r => {
        const fechaR = new Date(r.rawDate);
        return fechaR.getDate() === fechaFiltro.getDate() &&
               fechaR.getMonth() === fechaFiltro.getMonth() &&
               fechaR.getFullYear() === fechaFiltro.getFullYear();
      })
    : registros;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-4 md:p-8 font-sans pb-32"> 
        <Toaster position="top-center" theme={darkMode ? 'dark' : 'light'} />

        <header className="mb-8 max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Michi Tracker 🐾</h1>
            <p className="text-slate-400 text-xs font-medium">Panel de Control Felino</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* --- GRID PRINCIPAL --- */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA (Ancho: 5/12) - Controles y Lista */}
          <div className="md:col-span-5 space-y-6">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-4 -mt-4"></div>
                 <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 z-10">{comidasHoy}</span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 z-10">Comidas Hoy</span>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative">
                 <span className={`text-2xl mb-2 transition-all ${estadoArenero.estado === 'alerta' ? 'animate-pulse' : 'text-indigo-500'}`}>
                   {estadoArenero.estado === 'alerta' ? '🧹' : '✨'}
                 </span>
                 <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full 
                   ${estadoArenero.estado === 'alerta' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300'}
                 `}>
                   {estadoArenero.texto}
                 </span>
              </div>
            </div>

            {/* BOTONES */}
            <div className="grid grid-cols-2 gap-4">
              <BotonGato texto="Comida" emoji="🍖" tipo="primario" alPresionar={() => registrarEvento('Comida')} />
              <BotonGato texto="Arenero" emoji="💩" tipo="secundario" alPresionar={() => registrarEvento('Arenero')} />
            </div>

            {/* LISTA HISTORIAL */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-2">
              <div className="flex justify-between items-center p-4 pb-2">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {fechaFiltro ? `Día ${fechaFiltro.getDate()}` : 'Reciente'}
                </h2>
                {fechaFiltro && (
                  <button onClick={() => setFechaFiltro(null)} className="text-xs text-indigo-500 font-bold hover:underline">Ver todo</button>
                )}
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                {loading ? <p className="text-center text-slate-300 py-4">Cargando...</p> : 
                  (registrosParaMostrar.length === 0 ? <div className="text-center py-8 text-slate-300 text-sm italic">Sin actividad</div> : 
                    registrosParaMostrar.map((item) => (
                      <div key={item.id} className="group flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.tipo === 'Comida' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {item.tipo === 'Comida' ? '🍖' : '✨'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.tipo}</p>
                            <p className="text-xs text-slate-400 font-medium">{item.fecha.split(' ')[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-400">{item.fecha.split(' ')[1]}</span>
                          <button onClick={() => borrarRegistro(item.id, item.tipo)} className="text-slate-300 hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))
                  )
                }
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (Ancho: 7/12) - Calendario + Gráfico */}
          <div className="md:col-span-7 md:sticky md:top-8 space-y-6">
             {/* 1. Calendario */}
             <div className="dark:opacity-90">
                <CalendarioMichi registros={registros} alSeleccionarFecha={manejarClickCalendario} />
             </div>
             
             {/* 2. Gráfico (Ahora debajo del calendario) */}
             <MichiChart registros={registros} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default App