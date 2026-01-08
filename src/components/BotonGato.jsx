function BotonGato({ texto, emoji, tipo, alPresionar }) {
  
  // CAMBIO: Ahora ambos usan fondos suaves ("50") en lugar de colores sólidos.
  // Esto hace que se vean mucho más integrados y "minimalistas".
  const estilos = tipo === 'primario'
    ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/50' 
    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

  return (
    <button 
      onClick={alPresionar}
      className={`${estilos} border w-full py-5 rounded-2xl transition-all duration-200 active:scale-95 flex flex-col items-center gap-2 group shadow-sm`}
    >
      <span className="text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm filter">
        {emoji}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
        {texto}
      </span>
    </button>
  );
}

export default BotonGato;