import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock3, Flame, Target, Sparkles, CheckCircle2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import { categories, getCategoryColor } from '../data/initialData'
import Stat from '../components/dashboard/Stat'
import { formatLongDate, weekday, dateKey, isToday } from '../utils/date'
import PageTransition from '../components/ui/PageTransition'

export default function Dashboard() {
  const { data, setDaily, dailyValue, flash } = useApp()
  const currentWeekday = weekday()
  const blocks = data.events[currentWeekday] || []

  // Hábitos completados hoy
  const doneHabits = data.habits.filter(h => dailyValue('habits', h.id) === true).length
  const habitRate = data.habits.length ? Math.round((doneHabits / data.habits.length) * 100) : 0

  // Tareas de hoy
  const todayTasks = data.tasks.filter(t => t.date && isToday(t.date))
  const completedTasks = todayTasks.filter(t => t.done).length

  // Racha máxima entre hábitos
  const maxStreak = data.habits.length
    ? Math.max(...data.habits.map(h => h.streak || 0))
    : 0

  // Siguiente bloque del día
  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

  const nextBlock = blocks.find(([time]) => time >= currentTimeString) || blocks[0] || null

  const toggleHabit = (habitId) => {
    const isCompleted = dailyValue('habits', habitId) === true
    setDaily('habits', habitId, !isCompleted)
    flash(!isCompleted ? 'Hábito completado' : 'Hábito pendiente')

    if (!isCompleted && doneHabits + 1 === data.habits.length) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } })
      flash('¡Felicidades! Todos tus hábitos de hoy están cumplidos 🎉')
    }
  }

  const userName = data.settings?.name || 'Compañero'

  return (
    <PageTransition>
      {/* Banner de Bienvenida */}
      <section className="panel mb-6 p-5 sm:p-6 bg-gradient-to-r from-surface via-elevated to-surface border border-line">
        <p className="eyebrow">{formatLongDate()}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              Buenos días, {userName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Los hábitos pequeños y repetidos construyen resultados exponenciales.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald/15 px-3.5 py-1.5 text-xs font-semibold text-mint border border-emerald/20">
            <Sparkles size={14} />
            <span>Sistema Activo</span>
          </div>
        </div>
      </section>

      {/* Tarjetas de Estadísticas Dinámicas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Nivel de Ejecución"
          value={`${habitRate}%`}
          detail={`${doneHabits} de ${data.habits.length} hábitos completados`}
          color="text-mint"
        />
        <Stat
          label="Mejor Racha"
          value={`${maxStreak} días`}
          detail="Consistencia ininterrumpida"
          color="text-orange"
        />
        <Stat
          label="Tareas de Hoy"
          value={`${completedTasks}/${todayTasks.length}`}
          detail={todayTasks.length ? 'Tareas fijadas para hoy' : 'Sin tareas pendientes hoy'}
          color="text-cyan"
        />
        <Stat
          label="Total Rutina"
          value={`${blocks.length} bloques`}
          detail={`Horario de los ${currentWeekday}s`}
          color="text-ink"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr_0.8fr]">
        {/* Rutina de Hoy */}
        <section className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Clock3 className="text-mint" size={18} />
                Rutina de Hoy ({currentWeekday})
              </h2>
              <Link to="/today" className="text-xs font-semibold text-mint hover:underline flex items-center gap-1">
                Ver detalle <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {blocks.length > 0 ? (
                blocks.slice(0, 6).map(([time, title, category], i) => (
                  <div
                    key={`${time}-${title}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                      i === 0 ? 'bg-elevated ring-1 ring-line' : 'hover:bg-elevated/50'
                    }`}
                  >
                    <span className="w-12 text-xs font-bold text-mint font-mono">{time}</span>
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: getCategoryColor(category) }}
                    />
                    <span className="flex-1 text-sm font-medium truncate text-ink">{title}</span>
                    <span
                      className="text-[10px] font-semibold hidden sm:inline"
                      style={{ color: getCategoryColor(category) }}
                    >
                      {category}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  Sin bloques programados para hoy.
                </p>
              )}
            </div>
          </div>

          <Link
            to="/schedule"
            className="mt-4 block text-center rounded-xl border border-line bg-elevated/40 py-2 text-xs font-semibold text-muted hover:text-ink transition"
          >
            Editar mi horario semanal →
          </Link>
        </section>

        {/* Hábitos Diarios */}
        <section className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="font-display text-lg font-bold">Hábitos Diarios</h2>
              <Link to="/habits" className="text-xs font-semibold text-mint hover:underline">
                Gestionar
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {data.habits.map((h) => {
                const isCompleted = dailyValue('habits', h.id) === true
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      isCompleted
                        ? 'bg-emerald/10 border border-emerald/30'
                        : 'bg-elevated border border-line hover:border-slate-600'
                    }`}
                  >
                    <span
                      className={`check ${
                        isCompleted ? 'border-emerald bg-emerald text-canvas shadow-glow' : ''
                      }`}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span
                      className={`flex-1 text-sm font-semibold truncate ${
                        isCompleted ? 'text-slate-400 line-through' : 'text-ink'
                      }`}
                    >
                      {h.title}
                    </span>
                    <span className="text-xs font-bold text-mint flex items-center gap-0.5">
                      <Flame size={13} className="text-orange" />
                      {h.streak}d
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            {doneHabits} de {data.habits.length} completados hoy
          </p>
        </section>

        {/* Columna Derecha: Próximo Bloque & Racha */}
        <section className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2">
              <Flame className="text-orange" size={20} />
              <h2 className="font-display text-base font-bold">Racha Activa</h2>
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-ink">
              {maxStreak} <span className="text-lg text-mint font-normal">días seguidos</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Tu constancia genera inercia positiva.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <Target className="text-mint" size={20} />
              <h2 className="font-display text-base font-bold">Próximo Bloque</h2>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-ink">
              {nextBlock ? nextBlock[1] : 'Sin bloques programados'}
            </p>
            <p className="mt-1 text-xs text-muted flex items-center gap-1.5">
              <Clock3 size={13} />
              {nextBlock ? `${nextBlock[0]} (${nextBlock[2]})` : 'Día libre'}
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
