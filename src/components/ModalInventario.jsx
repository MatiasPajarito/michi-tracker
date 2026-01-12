import { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

export default function ModalInventario({ inventario, alCerrar, alRecargar }) {
  const [activeTab, setActiveTab] = useState('seca'); // 'seca', 'humeda', 'churu'
  const [cantidadInput, setCantidadInput] = useState('');
  const [loading, setLoading] = useState(false);

  // --- CONFIGURACIÓN DE TEMAS Y DATOS ---
  const CONFIG = {
    seca: {
      label: 'Pellet',
      unit: 'KG', // Mostramos Kg visualmente
      icon: '🍪',
      divisor: 1000, // Guardamos en gramos, mostramos en Kg
      steps: [1, 3, 10], // Botones rápidos (+1kg, +3kg...)
      stepLabels: ['+1 Kg', '+3 Kg', '+10 Kg'],
      // Estilos de color (Ámbar)
      color: 'text-amber-500',
      bgBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-amber-900/20',
      bgTabActive: 'bg-amber-500 text-white',
      borderFocus: 'focus:border-amber-500 focus:ring-amber-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/10'
    },
    humeda: {
      label: 'Húmeda',
      unit: 'Sobres',
      icon: '🥫',
      divisor: 1,
      steps: [1, 6, 12],
      stepLabels: ['+1 un', '+6 un', '+12 un'],
      // Estilos de color (Rosa)
      color: 'text-rose-500',
      bgBtn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-rose-900/20',
      bgTabActive: 'bg-rose-500 text-white',
      borderFocus: 'focus:border-rose-500 focus:ring-rose-500',
      lightBg: 'bg-rose-50 dark:bg-rose-900/10'
    },
    churu: {
      label: 'Churu',
      unit: 'Tubos',
      icon: '🍬',
      divisor: 1,
      steps: [4, 20, 50],
      stepLabels: ['+4 un', '+20 un', '+50 un'],
      // Estilos de color (Violeta/Indigo)
      color: 'text-violet-500',
      bgBtn: 'bg-violet-500 hover:bg-violet-600 shadow-violet-200 dark:shadow-violet-900/20',
      bgTabActive: 'bg-violet-500 text-white',
      borderFocus: 'focus:border-violet-500 focus:ring-violet-500',
      lightBg: 'bg-violet-50 dark:bg-violet-900/10'
    }
  };

  const currentTheme = CONFIG[activeTab];

  // Obtener stock actual del inventario
  const itemActual = inventario.find(i => i.tipo === activeTab);
  const stockActual = itemActual ? itemActual.stock_actual : 0;
  
  // Cálculo visual (Gramo -> Kg si es pellet)
  const stockVisual = (stockActual / currentTheme.divisor).toFixed(activeTab === 'seca' ? 2 : 0);

  const handleAgregar = async (cantidad) => {
    if (!cantidad || cantidad <= 0) return;
    setLoading(true);

    try {
      // Si es pellet, convertimos Kg (input) a Gramos (base de datos)
      const cantidadReal = cantidad * currentTheme.divisor;
      const nuevoTotal = (itemActual ? itemActual.stock_actual : 0) + cantidadReal;

      // Actualizar en Supabase
      const { error } = await supabase
        .from('inventario')
        .update({ stock_actual: nuevoTotal })
        .eq('tipo', activeTab);

      if (error) throw error;

      toast.success(`Stock actualizado: +${cantidad} ${currentTheme.unit}`);
      setCantidadInput('');
      alRecargar(); // Recargar datos en la App
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="p-6 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${currentTheme.lightBg}`}>
               <ShoppingBag className={`w-5 h-5 ${currentTheme.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Despensa</h2>
              <p className="text-xs text-slate-400 font-medium">Gestión de Stock</p>
            </div>
          </div>
          <button onClick={alCerrar} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="px-6 py-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {Object.keys(CONFIG).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                  activeTab === key 
                    ? CONFIG[key].bgTabActive + ' shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {CONFIG[key].label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* --- VISUALIZADOR GIGANTE --- */}
        <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-[180px]">
          <div className="text-center space-y-2 animate-in fade-in zoom-in duration-300" key={activeTab}>
            <div className="flex items-baseline justify-center gap-1">
               <span className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
                 {stockVisual}
               </span>
               <span className={`text-lg font-bold uppercase ${currentTheme.color} opacity-80`}>
                 {currentTheme.unit}
               </span>
            </div>
            <div className="text-5xl drop-shadow-md filter">{currentTheme.icon}</div>
          </div>
        </div>

        {/* --- ZONA DE CARGA --- */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 space-y-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Plus size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agregar Compra</span>
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              value={cantidadInput}
              onChange={(e) => setCantidadInput(e.target.value)}
              placeholder="0"
              className={`w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold outline-none transition-all ${currentTheme.borderFocus}`}
            />
            <button 
              onClick={() => handleAgregar(parseFloat(cantidadInput))}
              disabled={loading || !cantidadInput}
              className={`px-6 rounded-2xl font-bold text-white shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.bgBtn}`}
            >
              {loading ? '...' : 'Cargar'}
            </button>
          </div>

          {/* BOTONES RÁPIDOS */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {currentTheme.steps.map((step, index) => (
              <button
                key={step}
                onClick={() => handleAgregar(step)}
                className="py-2 px-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              >
                {currentTheme.stepLabels[index]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}