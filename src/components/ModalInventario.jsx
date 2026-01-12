import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { X, Cookie, Beef, Candy, PackagePlus, TrendingUp } from 'lucide-react';

export default function ModalInventario({ inventario, alCerrar, alRecargar }) {
    const [activeTab, setActiveTab] = useState('seca'); 
    const [cantidadInput, setCantidadInput] = useState('');
    const [cargando, setCargando] = useState(false);

    const config = {
        seca: {
            color: 'text-amber-500',
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            shadow: 'shadow-amber-500/20',
            label: 'PELLET',
            unidad: 'g',
            icono: <Cookie size={32} className="text-amber-500" />,
            quickAddLabel: '+1 Saco (8kg)',
            quickAddValue: 8000
        },
        humeda: {
            color: 'text-pink-500',
            bg: 'bg-pink-500',
            border: 'border-pink-500',
            shadow: 'shadow-pink-500/20',
            label: 'HÚMEDA',
            unidad: 'un',
            icono: <Beef size={32} className="text-pink-500" />,
            quickAddLabel: '+1 Caja (12un)',
            quickAddValue: 12
        },
        churu: {
            color: 'text-purple-500',
            bg: 'bg-purple-500',
            border: 'border-purple-500',
            shadow: 'shadow-purple-500/20',
            label: 'CHURU',
            unidad: 'un',
            icono: <Candy size={32} className="text-purple-500" />,
            quickAddLabel: '+1 Frasco (20un)',
            quickAddValue: 20
        }
    };

    const actual = config[activeTab];
    const itemActualDb = inventario.find(i => i.tipo === activeTab);
    const stockActual = itemActualDb?.stock_actual || 0;

    const handleUpdate = async () => {
        const cantidadAgregar = parseInt(cantidadInput);
        if (!cantidadAgregar || cantidadAgregar <= 0) {
            toast.error("Ingresa una cantidad válida");
            return;
        }

        setCargando(true);
        const nuevoStock = stockActual + cantidadAgregar;

        try {
            const { error } = await supabase
                .from('inventario')
                .update({ stock_actual: nuevoStock })
                .eq('tipo', activeTab);

            if (error) throw error;

            toast.success(`¡Stock actualizado! Nuevo total: ${nuevoStock}${actual.unidad}`);
            setCantidadInput('');
            alRecargar(); 
            alCerrar();
        } catch (error) {
            toast.error('Error al actualizar: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            {/* CAJA PRINCIPAL: Blanco en día, Oscuro en noche */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative transition-colors duration-300">
                
                {/* Header */}
                <div className="p-6 pb-2 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Despensa</h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Reponer Stock</p>
                    </div>
                    <button onClick={alCerrar} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs de Navegación */}
                <div className="px-6 flex gap-2 mt-4">
                    {['seca', 'humeda', 'churu'].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setActiveTab(t); setCantidadInput(''); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                                activeTab === t 
                                    ? `${config[t].bg} text-white border-transparent shadow-lg ${config[t].shadow}` 
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 dark:hover:bg-slate-700'
                            }`}
                        >
                            {config[t].label}
                        </button>
                    ))}
                </div>

                {/* VISUALIZADOR GIGANTE */}
                <div className="py-8 flex flex-col items-center justify-center animate-pulse-slow">
                   <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Stock Actual</p>
                   <span className={`text-5xl font-black ${actual.color} drop-shadow-sm transition-colors duration-300 flex items-baseline gap-1`}>
                     {stockActual}
                     <span className="text-xl text-slate-400 dark:text-slate-500 font-bold uppercase">{actual.unidad}</span>
                   </span>
                   <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700/50">
                     {actual.icono}
                   </div>
                </div>

                {/* Sección de Ingreso */}
                <div className="px-6 pb-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <TrendingUp size={18} className={actual.color} />
                        <p className="text-slate-400 text-sm font-bold uppercase">Agregar Cantidad</p>
                    </div>
                    
                    <div className="flex gap-3">
                        {/* Input Numérico Adaptable */}
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                value={cantidadInput}
                                onChange={(e) => setCantidadInput(e.target.value)}
                                placeholder="Ej: 500"
                                className="w-full bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 font-bold text-lg py-3 pl-4 pr-12 rounded-2xl border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                            <span className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 font-bold text-sm uppercase">{actual.unidad}</span>
                        </div>
                        
                        {/* Botón de Atajo Adaptable */}
                        <button 
                            onClick={() => setCantidadInput(actual.quickAddValue.toString())}
                            className={`px-4 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${actual.border} text-slate-600 bg-slate-50 hover:bg-slate-100 dark:text-white dark:bg-slate-800 dark:hover:bg-slate-700`}
                        >
                            <PackagePlus size={16} className={actual.color} />
                            <span className="text-[10px]">{actual.quickAddLabel}</span>
                        </button>
                    </div>
                </div>

                {/* Botón Confirmar */}
                <div className="p-6 pt-0">
                    <button 
                        onClick={handleUpdate}
                        disabled={cargando || !cantidadInput}
                        className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${actual.bg} ${actual.shadow} disabled:opacity-50 disabled:pointer-events-none`}
                    >
                        {cargando ? 'Actualizando...' : 'Confirmar Stock 📦'}
                    </button>
                </div>

            </div>
        </div>
    );
}