import { Link } from 'react-router-dom'
import {
  BarChart3,
  BadgeCheck,
  BrainCircuit,
  CalendarClock,
  NotebookPen,
  Settings,
  ChevronRight,
  Cloud
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/ui/PageTransition'

const links = [
  { to: '/habits', label: 'Hábitos & Disciplina', desc: 'Matriz semanal de constancia', Icon: BadgeCheck, color: 'text-mint' },
  { to: '/schedule', label: 'Mi Horario Semanal', desc: 'Estructura de bloques operativos', Icon: CalendarClock, color: 'text-cyan' },
  { to: '/statistics', label: 'Estadísticas & Analítica', desc: 'Métricas de consistencia y rachas', Icon: BarChart3, color: 'text-orange' },
  { to: '/review', label: 'Revisión Semanal', desc: 'Calibración y retrospectiva', Icon: BrainCircuit, color: 'text-violet' },
  { to: '/notes', label: 'Notas & Archivo', desc: 'Pensamientos y principios clave', Icon: NotebookPen, color: 'text-gold' },
  { to: '/settings', label: 'Configuración & Nube', desc: 'Supabase, perfil y copias de seguridad', Icon: Settings, color: 'text-emerald' }
]

export default function More() {
  const { data, syncStatus, displayName, authUser } = useApp()
  const userInitial = displayName.charAt(0).toUpperCase() || 'U'

  return (
    <PageTransition className="max-w-2xl">
      <div>
        <p className="eyebrow">Navegación del Sistema</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Más Opciones</h1>
        <p className="mt-1 text-sm text-muted">
          Accede a todos los módulos y herramientas de tu arquitectura personal.
        </p>
      </div>

      {/* Tarjeta de Perfil & Nube en móvil */}
      <div className="card mt-6 flex items-center justify-between border-emerald/20 bg-gradient-to-r from-surface to-elevated">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald font-display text-lg font-bold text-canvas shadow-glow">
            {userInitial}
          </div>
          <div className="min-w-0">
            <b className="block text-base font-bold text-ink truncate">{displayName}</b>
            <span className="text-xs text-mint flex items-center gap-1 truncate">
              <Cloud size={12} className="shrink-0" />
              {syncStatus === 'synced'
                ? authUser?.email || 'Nube activa con Supabase'
                : syncStatus === 'syncing'
                ? 'Sincronizando...'
                : 'Modo local'}
            </span>
          </div>
        </div>
        <Link
          to="/settings"
          className="rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs font-semibold text-ink hover:text-mint shrink-0 ml-2"
        >
          Ajustes
        </Link>
      </div>

      {/* Lista de enlaces */}
      <div className="mt-6 space-y-3">
        {links.map(({ to, label, desc, Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="card flex items-center justify-between p-4 transition active:scale-[0.98] hover:border-slate-500"
          >
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-elevated border border-line">
                <Icon size={20} className={color} />
              </div>
              <div>
                <b className="block text-sm font-semibold text-ink">{label}</b>
                <p className="text-xs text-muted">{desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </Link>
        ))}
      </div>
    </PageTransition>
  )
}
