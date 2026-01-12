import { useState } from 'react';
import { X, Cookie, Beef, Candy } from 'lucide-react';

export default function ModalComida({ alCerrar, alConfirmar }) {
  const [tipo, setTipo] = useState('seca'); 
  const [porcion, setPorcion] = useState('Normal'); 

  const config = {
    seca: {
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      border: 'border-amber-500',
      shadow: 'shadow-amber-500/20',
      label: 'PELLET',
      unidad: 'g',
      icono: <Cookie size={32} className="text-amber-500" />,
      base: 80 
    },
    humeda: {
      color: 'text-pink-500',
      bg: 'bg-pink-500',
      border: 'border-pink-500',
      shadow: 'shadow-pink-500/20',
      label: 'HÚMEDA',
      unidad: 'un', 
      icono: <Beef size={32} className="text-pink-500" />,
      base: 1
    },
    churu: {
      color: 'text-purple-500',
      bg: 'bg-purple-500',
      border: 'border-purple-500',
      shadow: 'shadow-purple-500/20',
      label: 'CHURU',
      unidad: 'un', 
      icono: <Candy size={32} className="text-purple-500" />,
      base: 1
    }
  };

  const actual = config[tipo];

  let cantidadVisual = actual.base;
  if (porcion === 'Media') cantidadVisual = actual.base * 0.5;
  if (porcion === 'Doble') cantidadVisual = actual.base * 2;

  const handleSubmit = () => {
    let tipoFinal = 'Pellet';
    if (tipo === 'humeda') tipoFinal = 'Húmeda';
    if (tipo === 'churu') tipoFinal = 'Churu';
    alConfirmar(tipoFinal, porcion);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Hora de Comer</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Registrar Alimento</p>
          </div>
          <button onClick={alCerrar} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs de Tipo */}
        <div className="px-6 flex gap-2 mt-4">
          {['seca', 'humeda', 'churu'].map((t) => (
            <button
              key={t}
              onClick={() => { setTipo(t); setPorcion('Normal'); }} 
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                tipo === t 
                  ? `${config[t].bg} text-white border-transparent shadow-lg ${config[t].shadow}` 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {config[t].label}
            </button>
          ))}
        </div>

        {/* VISUALIZADOR GIGANTE */}
        <div className="py-10 flex flex-col items-center justify-center animate-pulse-slow">
           <span className={`text-6xl font-black ${actual.color} drop-shadow-sm transition-colors duration-300`}>
             {cantidadVisual}
             <span className="text-2xl ml-1 text-slate-400 dark:text-slate-500 font-bold uppercase">{actual.unidad}</span>
           </span>
           <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700/50">
             {actual.icono}
           </div>
        </div>

        {/* Selectores de Porción (AQUÍ ESTÁ LA SOLUCIÓN SUAVE) */}
        <div className="px-6 pb-6">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Tamaño de la porción</p>
          <div className="grid grid-cols-3 gap-3">
            {['Media', 'Normal', 'Doble'].map((p) => (
              <button
                key={p}
                onClick={() => setPorcion(p)}
                className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                  porcion === p
                    // ESTILO SELECCIONADO (SUAVE Y ELEGANTE)
                    // Light Mode: bg-slate-200 (Gris suave, no negro)
                    // Dark Mode: bg-slate-700 (Gris medio, no blanco brillante)
                    // Border: Se adapta al tema para dar definición sin ser tosco
                    ? `bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 shadow-inner`
                    
                    // ESTILO NO SELECCIONADO (Limpio)
                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600'
                }`}
              >
                {p}
                <span className={`block text-[10px] font-normal mt-0.5 ${porcion === p ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}>
                  {p === 'Media' ? '0.5x' : p === 'Doble' ? '2x' : '1x'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón Confirmar */}
        <div className="p-6 pt-0">
          <button 
            onClick={handleSubmit}
            className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${actual.bg} ${actual.shadow}`}
          >
            Confirmar Plato 🍽️
          </button>
        </div>

      </div>
    </div>
  );
}