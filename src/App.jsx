import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Trash2, Moon, Sun, ShoppingBag, LogOut } from 'lucide-react'
import { Toaster, toast } from 'sonner' 
import Login from './Login' // <--- Asegúrate de tener este archivo creado
import BotonGato from './components/BotonGato'
import CalendarioMichi from './components/CalendarioMichi'
import MichiChart from './components/MichiChart'
import ModalComida from './components/ModalComida' 
import ModalInventario from './components/ModalInventario' 

function App() {
  // 1. ESTADO DE LA SESIÓN
  const [session, setSession] = useState(null)
  const cerrarSesion = async () => {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada correctamente 👋");
      setSession(null); // Esto fuerza la actualización visual inmediata
  };
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comidasHoy, setComidasHoy] = useState(0);
  const [fechaFiltro, setFechaFiltro] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);
  
  // ESTADOS MODALES Y DATOS
  const [modalComidaAbierto, setModalComidaAbierto] = useState(false);
  const [modalInventarioAbierto, setModalInventarioAbierto] = useState(false); 
  const [inventario, setInventario] = useState([]); 
  
  // ESTADO ARENERO
  const [estadoArenero, setEstadoArenero] = useState({ 
    texto: '...', 
    color: 'bg-slate-100 text-slate-400', 
    icono: '⏳' 
  });

  // --- EFECTO 1: EL VIGILANTE (Autenticación) ---
  // Este bloque se ejecuta una sola vez al abrir la app para ver si hay usuario
  useEffect(() => {
    // Revisar si ya había una sesión guardada en el navegador
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Suscribirse a cambios (si te logueas o deslogueas)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --- EFECTO 2: EL CARGADOR DE DATOS ---
  // Este es el que ya tenías, pero le agregamos una condición
  useEffect(() => {
    // SOLO cargamos datos si existe una 'session'
    if (session) {
        fetchData();
    }
  }, [session]); // <--- Se vuelve a ejecutar si la 'session' cambia

  const fetchData = async () => {
    setLoading(true);
    const { data: comidas } = await supabase.from('comidas').select('*').order('timestamp', { ascending: false }).limit(50);
    const { data: arenero } = await supabase.from('arenero').select('*').order('timestamp', { ascending: false }).limit(50);
    const { data: datosInventario } = await supabase.from('inventario').select('*');
    
    if (datosInventario) setInventario(datosInventario);

    // --- LOGICA EMOJIS ---
    const listaComidas = (comidas || []).map(c => {
      let emoji = '🍪';
      let nombre = 'Pellet';
      
      if (c.tipo_comida === 'humeda') { emoji = '🥫'; nombre = 'Húmeda'; }
      if (c.tipo_comida === 'churu') { emoji = '🍬'; nombre = 'Churu'; }

      return {
        id: `c-${c.id}`,
        tipo: 'Comida',
        rawTipo: c.tipo_comida,
        detalle: `${emoji} ${nombre} (${c.porcion || '1 un'})`, 
        fecha: new Date(c.timestamp).toLocaleString('es-CL'),
        rawDate: new Date(c.timestamp)
      };
    });

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

  const recalcularEstadoArenero = (listaRegistros) => {
    const eventosArenero = listaRegistros.filter(r => r.tipo === 'Arenero');
    
    if (eventosArenero.length > 0) {
      const ultima = eventosArenero[0].rawDate;
      const horas = (new Date() - ultima) / (1000 * 60 * 60);
      
      if (horas < 24) {
        setEstadoArenero({ 
          texto: 'IMPECABLE', 
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
          icono: '✨'
        });
      } else if (horas < 48) {
        setEstadoArenero({ 
          texto: 'LIMPIO', 
          color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
          icono: '👌'
        });
      } else {
        setEstadoArenero({ 
          texto: 'LIMPIAR!', 
          color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 animate-pulse',
          icono: '💩'
        });
      }
    } else {
      setEstadoArenero({ texto: 'SIN DATOS', color: 'bg-slate-50 text-slate-400', icono: '❔' });
    }
  };

  const confirmarComida = async (tipoElegido, porcionElegida) => {
    setModalComidaAbierto(false); 
    
    const itemInventario = inventario.find(i => i.tipo && i.tipo.toLowerCase() === tipoElegido.toLowerCase());
    
    let descuento = 0;
    if (itemInventario) {
      const base = itemInventario.tamano_porcion; 
      if (porcionElegida === 'Media') descuento = base * 0.5;
      else if (porcionElegida === 'Doble') descuento = base * 2;
      else descuento = base; 
    }

    try {
      const { error: insertError } = await supabase.from('comidas').insert([{ 
        cat_name: 'Ambas', 
        amount: 'Normal', 
        tipo_comida: tipoElegido, 
        porcion: porcionElegida 
      }]);
      
      if (insertError) throw insertError;

      if (itemInventario) {
        const nuevoStock = Math.max(0, itemInventario.stock_actual - descuento);
        
        const { error: updateError } = await supabase.from('inventario')
             .update({ stock_actual: nuevoStock })
             .eq('tipo', itemInventario.tipo);
            
        if (updateError) throw updateError;

        if (nuevoStock <= itemInventario.stock_minimo) {
            toast.error(`⚠️ STOCK BAJO: Quedan ${nuevoStock}g`);
        }
      }

      toast.success('Comida registrada y descontada');
      setFechaFiltro(new Date());
      fetchData(); 
    } catch (e) { 
      toast.error('Error al guardar: ' + e.message); 
    }
  };

  const clickBotonPrincipal = (tipo) => {
    if (tipo === 'Comida') setModalComidaAbierto(true);
    else registrarArenero();
  };

  const registrarArenero = async () => {
    try {
      await supabase.from('arenero').insert([{ type: 'parcial', notes: 'Limpieza' }]);
      toast.success('Arenero registrado');
      setFechaFiltro(new Date());
      fetchData();
    } catch (e) { toast.error('Error'); }
  };

  const borrarRegistro = async (id, tipo) => {
    toast('¿Borrar registro?', {
      action: {
        label: 'Borrar',
        onClick: async () => {
           const idReal = id.split('-')[1];
           const tabla = tipo === 'Comida' ? 'comidas' : 'arenero';
           
           try {
             if (tipo === 'Comida') {
               const { data: registro } = await supabase
                 .from('comidas')
                 .select('*')
                 .eq('id', idReal)
                 .single();

               if (registro && registro.tipo_comida) {
                 const itemInv = inventario.find(i => i.tipo === registro.tipo_comida);
                 
                 if (itemInv) {
                   let cantidadDevolver = itemInv.tamano_porcion; 
                   if (registro.porcion === 'Media') cantidadDevolver = cantidadDevolver * 0.5;
                   else if (registro.porcion === 'Doble') cantidadDevolver = cantidadDevolver * 2;
                   
                   await supabase.from('inventario')
                     .update({ stock_actual: itemInv.stock_actual + cantidadDevolver })
                     .eq('tipo', registro.tipo_comida);
                     
                   toast.info(`Reembolsados ${cantidadDevolver}g al inventario ↩️`);
                 }
               }
             }
             
             await supabase.from(tabla).delete().eq('id', idReal);
             toast.success('Registro eliminado');
             fetchData(); 
           } catch (error) {
             console.error(error);
             toast.error('Error al borrar');
           }
        }
      },
    });
  };

  const manejarClickCalendario = (fecha) => setFechaFiltro(fecha);

  const registrosParaMostrar = fechaFiltro 
    ? registros.filter(r => {
        const fechaR = new Date(r.rawDate);
        return fechaR.getDate() === fechaFiltro.getDate() &&
               fechaR.getMonth() === fechaFiltro.getMonth() &&
               fechaR.getFullYear() === fechaFiltro.getFullYear();
      })
    : registros;

  // --- ESCUDO DE SEGURIDAD ---
  // Si "session" está vacío, mostramos el Login y NO mostramos el resto de la app
  if (!session) {
    return <Login />
  }

  // Si hay sesión, mostramos la App normal
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-4 md:p-8 font-sans pb-32"> 
        <Toaster position="top-center" theme={darkMode ? 'dark' : 'light'} />
        
        {/* MODALES */}
        {modalComidaAbierto && <ModalComida alCerrar={() => setModalComidaAbierto(false)} alConfirmar={confirmarComida} />}
        {modalInventarioAbierto && <ModalInventario inventario={inventario} alCerrar={() => setModalInventarioAbierto(false)} alRecargar={fetchData} />}

        <header className="mb-8 max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Michi Tracker 🐾</h1>
            <p className="text-slate-400 text-xs font-medium">Panel de Control Felino</p>
          </div>
          <div className="flex gap-2">
            {/* Botón Inventario */}
            <button onClick={() => setModalInventarioAbierto(true)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              <ShoppingBag size={20} />
            </button>
            
            {/* Botón Dark Mode */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* --- AQUÍ VA EL NUEVO BOTÓN DE SALIR --- */}
            <button onClick={cerrarSesion} className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Cerrar Sesión">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-5 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden h-40">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-4 -mt-4"></div>
                  <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 z-10">{comidasHoy}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 z-10">Comidas Hoy</span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center h-40 gap-2">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-1">
                     <div className="flex items-center gap-2">
                        <span className="text-base">🍪</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pellet</span>
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                         {inventario.find(i => i.tipo === 'seca')?.stock_actual || 0}g
                     </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-1">
                     <div className="flex items-center gap-2">
                        <span className="text-base">🥫</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Húmeda</span>
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                         {inventario.find(i => i.tipo === 'humeda')?.stock_actual || 0} un
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="text-base">🍬</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Churu</span>
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                         {inventario.find(i => i.tipo === 'churu')?.stock_actual || 0} un
                     </span>
                  </div>
              </div>
            </div>

            <div className={`p-5 rounded-3xl shadow-sm border flex flex-col items-center justify-center transition-all ${estadoArenero.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{estadoArenero.icono}</span>
                    <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Estado Arenero</span>
                        <span className="text-lg font-black uppercase tracking-widest opacity-90">{estadoArenero.texto}</span>
                    </div>
                  </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <BotonGato texto="Comida" emoji="🍖" tipo="primario" alPresionar={() => clickBotonPrincipal('Comida')} />
              <BotonGato texto="Arenero" emoji="💩" tipo="secundario" alPresionar={() => clickBotonPrincipal('Arenero')} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-2">
              <div className="flex justify-between items-center p-4 pb-2">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {fechaFiltro ? 'Hoy / Selección' : 'Reciente'}
                </h2>
                {fechaFiltro && (
                  <button onClick={() => setFechaFiltro(null)} className="text-xs text-indigo-500 font-bold hover:underline">Ver todo</button>
                )}
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                {loading ? <p className="text-center text-slate-300 py-4">Cargando...</p> : 
                  (registrosParaMostrar.length === 0 ? <div className="text-center py-8 text-slate-300 text-sm italic">Sin actividad hoy</div> : 
                    registrosParaMostrar.map((item) => (
                      <div key={item.id} className="group flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.tipo === 'Comida' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {item.tipo === 'Comida' ? item.detalle.split(' ')[0] : '✨'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.tipo}</p>
                            <p className="text-xs text-slate-400 font-medium capitalize">{item.detalle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-400">{item.rawDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} </span>
                          <button onClick={() => borrarRegistro(item.id, item.tipo)} className="text-slate-300 hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))
                  )
                }
              </div>
            </div>
          </div>

          <div className="md:col-span-7 md:sticky md:top-8 space-y-6">
             <div className="dark:opacity-90">
                <CalendarioMichi registros={registros} alSeleccionarFecha={manejarClickCalendario} />
             </div>
             <MichiChart registros={registros} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default App