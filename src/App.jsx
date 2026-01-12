import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
// Importamos todos los iconos necesarios
import { Trash2, Moon, Sun, ShoppingBag, LogOut, Cookie, Beef, Candy, Sparkles, Utensils, Shovel, Briefcase, Heart, Cat } from 'lucide-react'
import { Toaster, toast } from 'sonner' 
import Login from './Login' 
import BotonGato from './components/BotonGato'
import CalendarioMichi from './components/CalendarioMichi'
import MichiChart from './components/MichiChart'
import ModalComida from './components/ModalComida' 
import ModalInventario from './components/ModalInventario' 

function App() {
  // 1. ESTADO DE LA SESIÓN
  const [session, setSession] = useState(null)
  
  const cerrarSesion = async () => {
      localStorage.removeItem('michiUser'); 
      setUsuarioFamilia(null);
      setSession(null); 
      toast.success("Sesión cerrada correctamente 👋");
      try {
          await supabase.auth.signOut(); 
      } catch (error) {
          console.log("Cierre técnico en segundo plano terminó");
      }
  };

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comidasHoy, setComidasHoy] = useState(0);
  const [fechaFiltro, setFechaFiltro] = useState(new Date());
  
  // --- CORRECCIÓN MODO OSCURO (AQUÍ ESTÁ EL ARREGLO) ---
  const [darkMode, setDarkMode] = useState(() => {
    // Leemos la memoria del navegador. Si dice 'light', empezamos en claro. Si no, oscuro.
    return localStorage.getItem('theme') === 'light' ? false : true;
  });

  const [usuarioFamilia, setUsuarioFamilia] = useState(localStorage.getItem('michiUser') || null);
  
  // ESTADOS MODALES Y DATOS
  const [modalComidaAbierto, setModalComidaAbierto] = useState(false);
  const [modalInventarioAbierto, setModalInventarioAbierto] = useState(false); 
  const [inventario, setInventario] = useState([]); 
  
  // ESTADO ARENERO
  const [estadoArenero, setEstadoArenero] = useState({ 
    texto: '...', 
    color: 'bg-white border-slate-200 text-slate-400', 
    icono: <Sparkles size={24} /> 
  });

  // --- HELPER PARA ICONOS DE HISTORIAL ---
  const getIcono = (tipo, subtipo) => {
    const claseIcono = "text-slate-400 dark:text-slate-500"; 
    const size = 20;
    if (tipo === 'Arenero') return <Sparkles size={size} className={claseIcono} />;
    const t = (subtipo || '').toLowerCase();
    if (t.includes('pellet') || t.includes('seca')) return <Cookie size={size} className={claseIcono} />;
    if (t.includes('húmeda') || t.includes('humeda')) return <Beef size={size} className={claseIcono} />;
    if (t.includes('churu')) return <Candy size={size} className={claseIcono} />;
    return <Cookie size={size} className={claseIcono} />;
  };

  // --- HELPER PARA EL ICONO DEL HEADER ---
  const getProfileHeaderIcon = () => {
    const size = 20;
    const stroke = 2;
    if (usuarioFamilia === 'Matias') return <Briefcase size={size} strokeWidth={stroke} className="text-current" />;
    if (usuarioFamilia === 'Cecilia') return <Heart size={size} strokeWidth={stroke} className="text-current" />;
    if (usuarioFamilia === 'Javiera') return <Cat size={size} strokeWidth={stroke} className="text-current" />;
    return null;
  };

  // --- HELPER: ESTILOS DE COLOR PARA EL BOTÓN DEL HEADER ---
  const getProfileHeaderStyles = () => {
    const baseStyle = "p-3 rounded-2xl shadow-sm border transition-all duration-300 group relative flex items-center gap-2 overflow-hidden hover:shadow-md hover:-translate-y-0.5";
    
    switch (usuarioFamilia) {
      case 'Matias': // Indigo Theme
        return `${baseStyle} bg-indigo-50 border-indigo-200 text-indigo-700 hover:shadow-indigo-500/20 dark:bg-indigo-950/40 dark:border-indigo-500/50 dark:text-indigo-200 dark:hover:border-indigo-400 dark:hover:shadow-indigo-500/30`;
      case 'Cecilia': // Pink Theme
        return `${baseStyle} bg-pink-50 border-pink-200 text-pink-700 hover:shadow-pink-500/20 dark:bg-pink-950/40 dark:border-pink-500/50 dark:text-pink-200 dark:hover:border-pink-400 dark:hover:shadow-pink-500/30`;
      case 'Javiera': // Emerald Theme
        return `${baseStyle} bg-emerald-50 border-emerald-200 text-emerald-700 hover:shadow-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-emerald-200 dark:hover:border-emerald-400 dark:hover:shadow-emerald-500/30`;
      default:
        return `${baseStyle} bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300`;
    }
  };

  // --- EFECTOS ---
  
  // 1. EFECTO MODO OSCURO: Aplica la clase al HTML cuando cambias el estado
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 2. EFECTO DE SESIÓN
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session) })
    return () => subscription.unsubscribe()
  }, [])

  // 3. EFECTO DE DATOS
  useEffect(() => { if (session) fetchData(); }, [session]); 

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    setLoading(true);
    const { data: comidas } = await supabase.from('comidas').select('*').order('timestamp', { ascending: false }).limit(50);
    const { data: arenero } = await supabase.from('arenero').select('*').order('timestamp', { ascending: false }).limit(50);
    const { data: datosInventario } = await supabase.from('inventario').select('*');
    
    if (datosInventario) setInventario(datosInventario);

    const listaComidas = (comidas || []).map(c => {
      let nombre = 'Pellet';
      let itemInv = datosInventario?.find(i => i.tipo === c.tipo_comida) || datosInventario?.find(i => i.tipo === 'seca'); 
      
      if (c.tipo_comida === 'Húmeda' || c.tipo_comida === 'humeda') { nombre = 'Húmeda'; itemInv = datosInventario?.find(i => i.tipo === 'humeda'); }
      if (c.tipo_comida === 'Churu' || c.tipo_comida === 'churu') { nombre = 'Churu'; itemInv = datosInventario?.find(i => i.tipo === 'churu'); }

      let detalleCantidad = c.porcion || '1 un';
      if (nombre === 'Pellet' && itemInv) { 
          const base = itemInv.tamano_porcion; 
          let g = base;
          if (c.porcion === 'Media') g = Math.round(base * 0.5);
          if (c.porcion === 'Doble') g = base * 2;
          detalleCantidad = `${c.porcion} (${g}g)`;
      } else {
          let un = 1;
          if (c.porcion === 'Media') un = 0.5;
          if (c.porcion === 'Doble') un = 2;
          detalleCantidad = `${c.porcion} (${un} un)`;
      }

      return {
        id: `c-${c.id}`,
        tipo: 'Comida',
        rawTipo: c.tipo_comida,
        detalle: `${nombre} • ${detalleCantidad} ${c.usuarioFamilia ? `• ${c.usuarioFamilia}` : ''}`, 
        fecha: new Date(c.timestamp).toLocaleString('es-CL'),
        rawDate: new Date(c.timestamp)
      };
    });

    const listaArenero = (arenero || []).map(a => ({
      id: `a-${a.id}`,
      tipo: 'Arenero',
      detalle: `${a.type === 'total' ? 'Profunda' : 'Rápida'} ${a.usuarioFamilia ? `• ${a.usuarioFamilia}` : ''}`,
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
      
      const baseCard = "bg-white dark:bg-slate-800 shadow-sm border";

      if (horas < 24) {
        setEstadoArenero({ 
          texto: 'IMPECABLE', 
          color: `${baseCard} border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400`,
          icono: <Sparkles className="text-indigo-500" size={32} />
        });
      } else if (horas < 48) {
        setEstadoArenero({ 
          texto: 'LIMPIO', 
          color: `${baseCard} border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400`,
          icono: <Sparkles className="text-slate-400" size={32} />
        });
      } else {
        setEstadoArenero({ 
          texto: 'LIMPIAR!', 
          color: `${baseCard} border-rose-100 dark:border-rose-900/30 text-rose-500 dark:text-rose-400 animate-pulse`,
          icono: <Trash2 className="text-rose-500" size={32} />
        });
      }
    } else {
      setEstadoArenero({ texto: 'SIN DATOS', color: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400', icono: <Sparkles className="text-slate-300" /> });
    }
  };

  // --- FUNCIONES DE ACCIÓN (Confirmar, Borrar) ---
  const confirmarComida = async (tipoElegido, porcionElegida) => {
    setModalComidaAbierto(false); 
    let tipoNormalizado = 'seca';
    if (tipoElegido === 'Húmeda' || tipoElegido === 'humeda') tipoNormalizado = 'humeda';
    if (tipoElegido === 'Churu' || tipoElegido === 'churu') tipoNormalizado = 'churu';

    const itemInventario = inventario.find(i => i.tipo === tipoNormalizado);
    let descuento = 0;
    let textoVisual = '...';

    if (itemInventario) {
      const base = itemInventario.tamano_porcion; 
      if (porcionElegida === 'Media') descuento = base * 0.5;
      else if (porcionElegida === 'Doble') descuento = base * 2;
      else descuento = base; 
    }

    if (tipoNormalizado === 'seca') {
        textoVisual = `${porcionElegida} (${Math.round(descuento)}g)`;
    } else {
        let un = 1;
        if (porcionElegida === 'Media') un = 0.5;
        if (porcionElegida === 'Doble') un = 2;
        textoVisual = `${porcionElegida} (${un} un)`;
    }

    const nuevoRegistroFalso = {
      id: `temp-${Date.now()}`,
      tipo: 'Comida',
      rawTipo: tipoElegido,
      detalle: `${tipoElegido === 'Húmeda' ? 'Húmeda' : tipoElegido === 'Churu' ? 'Churu' : 'Pellet'} • ${textoVisual} • ${usuarioFamilia}`,
      fecha: new Date().toLocaleString('es-CL'),
      rawDate: new Date(),
      usuarioFamilia: usuarioFamilia
    };

    setRegistros(prev => [nuevoRegistroFalso, ...prev]);
    setComidasHoy(prev => prev + 1); 
    toast.success('Comida registrada (Sincronizando...)');

    try {
      const { error: insertError } = await supabase.from('comidas').insert([{ 
        cat_name: 'Ambas', 
        amount: 'Normal', 
        tipo_comida: tipoElegido, 
        porcion: porcionElegida,
        usuarioFamilia: usuarioFamilia 
      }]);
      if (insertError) throw insertError;

      if (itemInventario) {
        const nuevoStock = Math.max(0, itemInventario.stock_actual - descuento);
        const { error: updateError } = await supabase.from('inventario').update({ stock_actual: nuevoStock }).eq('tipo', itemInventario.tipo);
        if (updateError) throw updateError;
        setInventario(prev => prev.map(item => item.tipo === itemInventario.tipo ? { ...item, stock_actual: nuevoStock } : item));
      }
      fetchData(); 
    } catch (e) { 
      toast.error('Error al guardar, deshaciendo cambios...'); 
      fetchData(); 
    }
  };

  const clickBotonPrincipal = (tipo) => {
    if (tipo === 'Comida') setModalComidaAbierto(true);
    else registrarArenero();
  };

  const registrarArenero = async () => {
    try {
      await supabase.from('arenero').insert([{ type: 'parcial', notes: 'Limpieza', usuarioFamilia: usuarioFamilia }]);
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
               const { data: registro } = await supabase.from('comidas').select('*').eq('id', idReal).single();
               if (registro && registro.tipo_comida) {
                 const itemInv = inventario.find(i => i.tipo === registro.tipo_comida);
                 if (itemInv) {
                   let cantidadDevolver = itemInv.tamano_porcion; 
                   if (registro.porcion === 'Media') cantidadDevolver = cantidadDevolver * 0.5;
                   else if (registro.porcion === 'Doble') cantidadDevolver = cantidadDevolver * 2;
                   await supabase.from('inventario').update({ stock_actual: itemInv.stock_actual + cantidadDevolver }).eq('tipo', registro.tipo_comida);
                   toast.info(`Reembolsados ${cantidadDevolver}g al inventario ↩️`);
                 }
               }
             }
             await supabase.from(tabla).delete().eq('id', idReal);
             toast.success('Registro eliminado');
             fetchData(); 
           } catch (error) { console.error(error); toast.error('Error al borrar'); }
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

  // --- PANTALLA DE SELECCIÓN DE PERFIL ---
  if (session && !usuarioFamilia) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 transition-colors duration-500">
          
          <div className="text-center space-y-4 mb-12 animate-fade-in-up flex flex-col items-center">
            <div className="relative group cursor-default">
                <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* GATO NARANJA AESTHETIC */}
                <Cat size={80} strokeWidth={1.5} className="text-orange-400 dark:text-orange-400 drop-shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" fill="rgba(251, 146, 60, 0.2)" />
                <div className="absolute -top-2 -right-4 animate-bounce">
                   <Sparkles size={24} className="text-yellow-400" fill="currentColor" />
                </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">¡Hola!</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-2">¿Quién va a alimentar al Michi hoy?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* MATIAS */}
            <button onClick={() => { setUsuarioFamilia('Matias'); localStorage.setItem('michiUser', 'Matias'); }} className="group relative overflow-hidden bg-white dark:bg-slate-800/80 dark:bg-gradient-to-br dark:from-slate-800 dark:to-indigo-900/60 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-indigo-700/50 hover:shadow-2xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/20">
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 text-indigo-500">
                    <Briefcase size={48} strokeWidth={1.5} />
                </div>
                <span className="font-black text-2xl text-slate-700 dark:text-indigo-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">Matias</span>
                <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-indigo-300/80 uppercase bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-indigo-500/30">Admin</span>
              </div>
            </button>
            {/* CECILIA */}
            <button onClick={() => { setUsuarioFamilia('Cecilia'); localStorage.setItem('michiUser', 'Cecilia'); }} className="group relative overflow-hidden bg-white dark:bg-slate-800/80 dark:bg-gradient-to-br dark:from-slate-800 dark:to-pink-900/60 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-pink-700/50 hover:shadow-2xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-pink-500/20">
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-24 h-24 bg-pink-50 dark:bg-pink-500/20 border border-pink-100 dark:border-pink-500/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 text-pink-500">
                    <Heart size={48} strokeWidth={1.5} />
                </div>
                <span className="font-black text-2xl text-slate-700 dark:text-pink-100 group-hover:text-pink-600 dark:group-hover:text-white transition-colors">Cecilia</span>
                <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-pink-300/80 uppercase bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-pink-500/30">Karen Suprema</span>
              </div>
            </button>
            {/* JAVIERA */}
            <button onClick={() => { setUsuarioFamilia('Javiera'); localStorage.setItem('michiUser', 'Javiera'); }} className="group relative overflow-hidden bg-white dark:bg-slate-800/80 dark:bg-gradient-to-br dark:from-slate-800 dark:to-emerald-900/60 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-emerald-700/50 hover:shadow-2xl hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-emerald-500/20">
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 text-emerald-500">
                    <Cat size={48} strokeWidth={1.5} />
                </div>
                <span className="font-black text-2xl text-slate-700 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-white transition-colors">Javiera</span>
                <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-emerald-300/80 uppercase bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-emerald-500/30">Cat Lover</span>
              </div>
            </button>
          </div>
          <div className="absolute top-6 right-6">
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg text-slate-400 hover:text-indigo-500 transition-colors border border-slate-100 dark:border-slate-700">{darkMode ? <Sun size={24} /> : <Moon size={24} />}</button>
          </div>
          <p className="mt-12 text-slate-400 text-sm font-medium opacity-60">Michi Tracker v2.4 • Familia Pajarito</p>
        </div>
      </div>
    )
  }

  // --- APP PRINCIPAL ---
  if (!session) return <Login />

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-4 md:p-8 font-sans pb-32"> 
        <Toaster position="top-center" theme={darkMode ? 'dark' : 'light'} />
        {modalComidaAbierto && <ModalComida alCerrar={() => setModalComidaAbierto(false)} alConfirmar={confirmarComida} />}
        {modalInventarioAbierto && <ModalInventario inventario={inventario} alCerrar={() => setModalInventarioAbierto(false)} alRecargar={fetchData} />}

        <header className="mb-8 max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Michi Tracker 🐾</h1>
            <p className="text-slate-400 text-xs font-medium">Panel de Control Felino</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setModalInventarioAbierto(true)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              <ShoppingBag size={20} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* BOTÓN DE PERFIL CON ESTILOS DINÁMICOS */}
            <button 
              onClick={() => { setUsuarioFamilia(null); localStorage.removeItem('michiUser'); }} 
              className={getProfileHeaderStyles()} 
              title={`Perfil actual: ${usuarioFamilia}. Click para cambiar.`}
            >
              {getProfileHeaderIcon()}
              <span className="hidden md:inline text-sm font-bold text-current">{usuarioFamilia}</span>
            </button>

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

              {/* TARJETA RESUMEN INVENTARIO (LISTA VERTICAL CON ICONOS GRISES) */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center h-40 gap-2">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-1">
                     <div className="flex items-center gap-2">
                        <Cookie size={16} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pellet</span>
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                         {inventario.find(i => i.tipo === 'seca')?.stock_actual || 0}g
                     </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-1">
                     <div className="flex items-center gap-2">
                        <Beef size={16} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Húmeda</span>
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                         {inventario.find(i => i.tipo === 'humeda')?.stock_actual || 0} un
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Candy size={16} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Churu</span>
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                         {inventario.find(i => i.tipo === 'churu')?.stock_actual || 0} un
                     </span>
                  </div>
              </div>
            </div>

            {/* ESTADO ARENERO (DISEÑO LIMPIO / NO VERDE) */}
            <div className={`p-5 rounded-3xl shadow-sm border flex flex-col items-center justify-center transition-all ${estadoArenero.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="grayscale">{estadoArenero.icono}</span>
                    <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Estado Arenero</span>
                        <span className="text-lg font-black uppercase tracking-widest opacity-90">{estadoArenero.texto}</span>
                    </div>
                  </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <BotonGato texto="Comida" icono={<Utensils size={28} strokeWidth={2.5} />} tipo="primario" alPresionar={() => clickBotonPrincipal('Comida')} />
              <BotonGato texto="Arenero" icono={<Shovel size={28} strokeWidth={2.5} />} tipo="secundario" alPresionar={() => clickBotonPrincipal('Arenero')} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-2">
              <div className="flex justify-between items-center p-4 pb-2">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{fechaFiltro ? 'Hoy / Selección' : 'Reciente'}</h2>
                {fechaFiltro && (<button onClick={() => setFechaFiltro(null)} className="text-xs text-indigo-500 font-bold hover:underline">Ver todo</button>)}
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                {loading ? <p className="text-center text-slate-300 py-4">Cargando...</p> : 
                  (registrosParaMostrar.length === 0 ? <div className="text-center py-8 text-slate-300 text-sm italic">Sin actividad hoy</div> : 
                    registrosParaMostrar.map((item) => (
                      <div key={item.id} className="group flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.tipo === 'Comida' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {getIcono(item.tipo, item.rawTipo)}
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