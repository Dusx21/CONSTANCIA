import { NavLink, useLocation, Link } from 'react-router-dom'
import * as I from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import { useApp } from '../context/AppContext'
import { categories } from '../data/initialData'
import { dateKey } from '../utils/date'

const links = [
  ['/', 'Inicio', I.LayoutGrid],
  ['/today', 'Hoy', I.Clock3],
  ['/calendar', 'Calendario', I.CalendarDays],
  ['/habits', 'Hábitos', I.BadgeCheck],
  ['/schedule', 'Mi horario', I.CalendarClock],
  ['/tasks', 'Tareas', I.ListChecks],
  ['/statistics', 'Estadísticas', I.BarChart3],
  ['/review', 'Revisión', I.BrainCircuit],
  ['/notes', 'Notas', I.NotebookPen],
  ['/settings', 'Configuración', I.SlidersHorizontal]
]

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
      <img src="/constancia-mark.svg" alt="Logo Constancia" className="h-10 w-10 shadow-glow rounded-xl" />
      <div>
        <div className="font-display text-lg font-bold tracking-tight text-ink">CONSTANCIA</div>
        <div className="text-[11px] font-semibold text-mint">Construye tu día</div>
      </div>
    </Link>
  )
}

function SyncBadge({ status, onClick }) {
  if (status === 'synced') {
    return (
      <button onClick={onClick} className="flex items-center gap-1.5 rounded-full bg-emerald/15 px-3 py-1.5 text-xs font-semibold text-mint transition hover:bg-emerald/25">
        <I.CloudCheck size={14} />
        <span>Nube Activa</span>
      </button>
    )
  }
  if (status === 'syncing') {
    return (
      <button onClick={onClick} className="flex items-center gap-1.5 rounded-full bg-cyan/15 px-3 py-1.5 text-xs font-semibold text-cyan transition hover:bg-cyan/25">
        <I.RefreshCw size={14} className="animate-spin" />
        <span>Sincronizando...</span>
      </button>
    )
  }
  if (status === 'error') {
    return (
      <button onClick={onClick} className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/25">
        <I.AlertCircle size={14} />
        <span>Error de Nube</span>
      </button>
    )
  }
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-full bg-elevated border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-ink">
      <I.LockKeyhole size={13} />
      <span>Modo Local</span>
    </button>
  )
}

function Quick({ onClose }) {
  const { data, update, flash } = useApp()
  const [type, setType] = useState('task')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Personal')
  const [date, setDate] = useState(dateKey())

  const save = () => {
    if (!title.trim()) return

    if (type === 'task') {
      update('tasks', [
        ...data.tasks,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          detail: 'Añadida rápidamente.',
          category,
          priority: 'Normal',
          due: date === dateKey() ? 'Hoy' : date,
          date,
          done: false
        }
      ])
    } else if (type === 'habit') {
      update('habits', [
        ...data.habits,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          category,
          frequency: 'Diario',
          streak: 0,
          completed: false,
          history: [0, 0, 0, 0, 0, 0, 0]
        }
      ])
    } else if (type === 'note') {
      update('notes', [
        ...data.notes,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          content: '',
          updated: 'Ahora'
        }
      ])
    }

    flash(`${type === 'task' ? 'Tarea' : type === 'habit' ? 'Hábito' : 'Nota'} creado con éxito`)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Crear rápidamente">
      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          ['task', 'Tarea', I.ListPlus],
          ['habit', 'Hábito', I.BadgePlus],
          ['note', 'Nota', I.NotebookPen]
        ].map(([v, l, Icon]) => (
          <button
            key={v}
            type="button"
            onClick={() => setType(v)}
            className={`rounded-xl border p-3 text-xs font-semibold transition active:scale-95 ${
              type === v
                ? 'border-emerald bg-emerald/10 text-mint shadow-glow'
                : 'border-line bg-elevated text-muted hover:text-ink'
            }`}
          >
            <Icon size={20} className="mx-auto mb-1.5" />
            {l}
          </button>
        ))}
      </div>

      <Field label="Nombre">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          className="input"
          placeholder={
            type === 'task'
              ? '¿Qué tarea necesitas completar?'
              : type === 'habit'
              ? 'Ej: Lectura 20 min, Meditar...'
              : 'Título de la nota...'
          }
        />
      </Field>

      {type !== 'note' && (
        <Field label="Categoría">
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {Object.keys(categories).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      )}

      {type === 'task' && (
        <Field label="Fecha">
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      )}

      <button onClick={save} className="primary-btn w-full mt-2">
        Guardar
      </button>
    </Modal>
  )
}

export default function AppLayout({ children }) {
  const [quick, setQuick] = useState(false)
  const loc = useLocation()
  const { data, syncStatus, displayName, authUser } = useApp()

  // Navegación para la barra móvil inferior
  const mobileNav = [
    { to: '/', label: 'Inicio', Icon: I.LayoutGrid },
    { to: '/today', label: 'Hoy', Icon: I.Clock3 },
    { to: '/calendar', label: 'Calendario', Icon: I.CalendarDays },
    { to: '/tasks', label: 'Tareas', Icon: I.ListChecks }
  ]

  const userInitial = displayName.charAt(0).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Sidebar Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-[#0d0e13] p-4 lg:flex">
        <Brand />

        <Link
          to="/settings"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-elevated p-3 transition hover:border-slate-600"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint font-display font-bold text-canvas">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-sm font-semibold text-ink">{displayName}</b>
            <p className="text-xs text-mint truncate">
              {authUser?.email ? authUser.email : 'Espacio Personal'}
            </p>
          </div>
        </Link>

        <nav className="mt-5 space-y-1 overflow-y-auto pr-1">
          {links.map(([to, label, Icon]) => (
            <NavLink
              end={to === '/'}
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-line/60 pt-4 text-xs text-muted">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-mint shadow-glow'
                    : syncStatus === 'error'
                    ? 'bg-red-400'
                    : syncStatus === 'syncing'
                    ? 'bg-cyan animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
              {syncStatus === 'synced'
                ? 'Conectado a Supabase'
                : syncStatus === 'syncing'
                ? 'Sincronizando...'
                : syncStatus === 'error'
                ? 'Error de sincronización'
                : 'Modo local'}
            </span>
            <Link to="/settings" className="text-mint hover:underline">
              Ajustes
            </Link>
          </div>
          <span className="block text-[11px] text-slate-500">CONSTANCIA v2.0 • Producción</span>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="mx-auto min-h-screen max-w-[1500px] px-4 pt-4 safe-pb-main lg:ml-64 lg:px-10 lg:pb-10 lg:pt-8">
        <header className="mb-6 flex items-center justify-between gap-3 lg:mb-8">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="hidden lg:block">
            <div className="font-display text-2xl font-bold tracking-tight">CONSTANCIA</div>
            <div className="text-xs text-muted">Construye el día que quieres repetir</div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/settings">
              <SyncBadge status={syncStatus} />
            </Link>

            <button
              onClick={() => setQuick(true)}
              className="primary-btn shadow-glow"
              aria-label="Acción rápida"
            >
              <I.Plus size={18} />
              <span className="hidden sm:inline">Acción rápida</span>
            </button>
          </div>
        </header>

        {children}
      </main>

      {/* Barra de Navegación Móvil (Bottom Navigation con soporte Safe Area) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-[#0d0e13]/95 backdrop-blur-md px-2 safe-bottom lg:hidden">
        {mobileNav.slice(0, 2).map(({ to, label, Icon }) => (
          <NavLink
            end={to === '/'}
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition active:scale-95 ${
                isActive ? 'text-mint' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon size={20} className="mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Botón flotante central de acción rápida */}
        <div className="flex flex-1 items-center justify-center">
          <button
            aria-label="Crear rápido"
            onClick={() => setQuick(true)}
            className="-mt-6 grid h-13 w-13 place-items-center rounded-2xl bg-emerald text-canvas shadow-glow ring-4 ring-[#0d0e13] transition active:scale-90 hover:bg-mint"
          >
            <I.Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        {mobileNav.slice(2).map(({ to, label, Icon }) => (
          <NavLink
            end={to === '/'}
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition active:scale-95 ${
                isActive ? 'text-mint' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon size={20} className="mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}

        <NavLink
          to="/more"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition active:scale-95 ${
              isActive || loc.pathname === '/more'
                ? 'text-mint'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <I.Menu size={20} className="mb-1" />
          <span>Más</span>
        </NavLink>
      </nav>

      {/* Modal de Acción Rápida */}
      {quick && <Quick onClose={() => setQuick(false)} />}
    </div>
  )
}
