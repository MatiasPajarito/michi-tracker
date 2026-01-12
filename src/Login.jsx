import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Lock, ArrowRight, Cat, Sparkles, Sun, Moon, Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // --- CORRECCIÓN CLAVE AQUÍ ---
  // Antes forzábamos "true". Ahora preguntamos: "¿El usuario dijo explícitamente 'light'?"
  // Si dijo 'light', empezamos en false (Claro). Si no dijo nada o dijo 'dark', empezamos en true (Oscuro).
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'light' ? false : true;
  });

  // Efecto para aplicar el tema y guardar la preferencia
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('¡Bienvenido Karen! 😺')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
        {/* Fondo Principal con transición suave */}
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden">
            
            <Toaster position="top-center" theme={darkMode ? 'dark' : 'light'} />

            {/* Botón de Tema (Sol/Luna) */}
            <div className="absolute top-6 right-6 z-10">
                <button 
                    onClick={() => setDarkMode(!darkMode)} 
                    className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg text-slate-400 hover:text-indigo-500 transition-colors border border-slate-100 dark:border-slate-700 active:scale-95"
                >
                    {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </div>

            {/* Decoración de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl dark:bg-indigo-500/5 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl dark:bg-orange-500/5 pointer-events-none"></div>

            {/* TARJETA DE LOGIN */}
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700/50 p-8 md:p-12 relative overflow-hidden animate-fade-in-up">
                
                {/* Cabecera con el Gato Naranja */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group mb-6">
                        <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Cat 
                            size={72} 
                            strokeWidth={1.5} 
                            className="text-orange-400 drop-shadow-md transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" 
                            fill="rgba(251, 146, 60, 0.2)" 
                        />
                        <div className="absolute -top-2 -right-3 animate-bounce">
                           <Sparkles size={20} className="text-yellow-400" fill="currentColor" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight text-center">
                        Michi Tracker
                    </h1>
                    <p className="text-slate-400 font-medium text-sm mt-2 uppercase tracking-widest text-center">
                        Panel de Control Felino
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleLogin} className="space-y-5">
                    
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Mail size={22} />
                        </div>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-12 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700 dark:text-white font-bold placeholder:text-slate-400/70"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Lock size={22} />
                        </div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-12 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700 dark:text-white font-bold placeholder:text-slate-400/70"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Ingresar <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-300 dark:text-slate-600 font-medium">
                        Familia Pajarito • v2.4
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}