import { useState } from 'react'
import {
  Check,
  Clock3,
  X,
  Flame,
  BadgeCheck,
  ListTodo,
  CheckCircle2,
  CalendarCheck2
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { categories, getCategoryColor } from '../data/initialData'
import { useApp } from '../context/AppContext'
import { formatLongDate, weekday, dateKey, isToday } from '../utils/date'
import PageTransition from '../components/ui/PageTransition'

export default function Today() {
  const { data, update, setDaily, dailyValue, flash } = useApp()
  const todayKey = dateKey()
  const currentWeekday = weekday()
  const blocks = data.events[currentWeekday] || []

  // Bloques completados hoy
  const completedBlocks = blocks.filter(([time, title]) => {
    return dailyValue('blocks', `${time}-${title}`) === 'done'
  }).length

  // Tareas de hoy
  const todayTasks = data.tasks.filter(t => t.date && isToday(t.date))
  const completedTasks = todayTasks.filter(t => t.done).length

  // Hábitos de hoy
  const completedHabits = data.habits.filter(h => dailyValue('habits', h.id) === true).length

  // Porcentaje general del día
  const totalItems = blocks.length + todayTasks.length + data.habits.length
  const totalDone = completedBlocks + completedTasks + completedHabits
  const dailyScore = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  const toggleTask = (task) => {
    const nextDone = !task.done
    const updated = data.tasks.map(t =>
      t.id === task.id ? { ...t, done: nextDone } : t
    )
    update('tasks', updated)
    flash(nextDone ? 'Tarea completada' : 'Tarea reabierta')
  }

  const toggleHabit = (habitId) => {
    const isDone = dailyValue('habits', habitId) === true
    setDaily('habits', habitId, !isDone)
    flash(!isDone ? 'Hábito completado' : 'Hábito pendiente')

    // Si completó todos los hábitos del día
    if (!isDone && completedHabits + 1 === data.habits.length) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } })
    }
  }

  return (
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Bitácora de Alto Rendimiento</p>
          <h1 className="font-display text-3xl font-bold tracking-tight uppercase">
            {formatLongDate()}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Arquitectura operativa diaria. Enfoque bloque a bloque.
          </p>
        </div>

        <div className="panel flex items-center gap-3 px-5 py-3">
          <div className="text-right">
            <span className="block font-display text-2xl font-bold text-mint">
              {dailyScore}%
            </span>
            <span className="text-[11px] text-muted">Cumplimiento hoy</span>
          </div>
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-emerald/15 text-mint">
            <CalendarCheck2 size={20} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Línea de tiempo de bloques de rutina */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Clock3 className="text-mint" size={20} />
              Línea de Tiempo ({currentWeekday})
            </h2>
            <span className="text-xs text-muted">
              {completedBlocks} de {blocks.length} bloques
            </span>
          </div>

          <div className="relative space-y-3 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-line">
            {blocks.length > 0 ? (
              blocks.map(([time, title, cat]) => {
                const id = `${time}-${title}`
                const status = dailyValue('blocks', id) || 'pending'
                const isDone = status === 'done'
                const isSkipped = status === 'skipped'

                return (
                  <article
                    key={id}
                    className={`relative flex items-center gap-3.5 rounded-2xl border p-3.5 sm:p-4 transition ${
                      isDone
                        ? 'border-emerald/40 bg-emerald/5'
                        : isSkipped
                        ? 'border-line/40 bg-elevated/40 opacity-60'
                        : 'border-line bg-surface hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold text-xs transition ${
                        isDone
                          ? 'bg-emerald text-canvas shadow-glow'
                          : 'bg-inset text-slate-300'
                      }`}
                      style={{
                        borderLeft: !isDone ? `3px solid ${getCategoryColor(cat)}` : undefined
                      }}
                    >
                      {time}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-display text-sm sm:text-base font-bold truncate ${
                            isDone ? 'text-slate-400 line-through' : 'text-ink'
                          }`}
                        >
                          {title}
                        </span>
                        <span
                          className="chip text-[10px]"
                          style={{
                            background: `${getCategoryColor(cat)}18`,
                            color: getCategoryColor(cat)
                          }}
                        >
                          {cat}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {isDone
                          ? 'Completado'
                          : isSkipped
                          ? 'Omitido voluntariamente'
                          : 'Pendiente para hoy'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        aria-label="Completar bloque"
                        onClick={() => {
                          setDaily('blocks', id, isDone ? 'pending' : 'done')
                          flash(isDone ? 'Bloque pendiente' : 'Bloque completado')
                        }}
                        className={`icon-btn h-9 w-9 ${
                          isDone ? 'border-emerald bg-emerald text-canvas shadow-glow' : ''
                        }`}
                      >
                        <Check size={16} strokeWidth={2.5} />
                      </button>

                      <button
                        aria-label="Omitir bloque"
                        onClick={() => {
                          setDaily('blocks', id, isSkipped ? 'pending' : 'skipped')
                          flash(isSkipped ? 'Bloque reactivado' : 'Bloque omitido')
                        }}
                        className={`icon-btn h-9 w-9 ${
                          isSkipped ? 'text-red-400 border-red-500/40' : ''
                        }`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="card py-12 text-center text-sm text-muted">
                No tienes bloques de horario configurados para los {currentWeekday}s.
              </div>
            )}
          </div>
        </section>

        {/* Panel Lateral: Hábitos & Tareas de Hoy */}
        <aside className="space-y-6">
          {/* Hábitos de hoy */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <BadgeCheck className="text-mint" size={18} />
                Hábitos Diarios ({completedHabits}/{data.habits.length})
              </h3>
            </div>

            <div className="space-y-2">
              {data.habits.map((h) => {
                const isDone = dailyValue('habits', h.id) === true
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      isDone
                        ? 'bg-emerald/10 border border-emerald/30'
                        : 'bg-elevated border border-line hover:border-slate-600'
                    }`}
                  >
                    <span
                      className={`check ${
                        isDone ? 'border-emerald bg-emerald text-canvas shadow-glow' : ''
                      }`}
                    >
                      {isDone && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span
                      className={`flex-1 text-sm font-semibold truncate ${
                        isDone ? 'text-slate-400 line-through' : 'text-ink'
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

          {/* Tareas programadas para hoy */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <ListTodo className="text-cyan" size={18} />
                Tareas de Hoy ({completedTasks}/{todayTasks.length})
              </h3>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl bg-elevated p-3 border border-line"
                  >
                    <button
                      onClick={() => toggleTask(t)}
                      className={`check ${
                        t.done ? 'border-emerald bg-emerald text-canvas shadow-glow' : ''
                      }`}
                    >
                      {t.done && <Check size={14} strokeWidth={3} />}
                    </button>
                    <span
                      className={`flex-1 text-sm font-semibold truncate ${
                        t.done ? 'text-slate-400 line-through' : 'text-ink'
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className="chip bg-surface text-muted text-[10px]">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted py-4 text-center">
                No tienes tareas programadas para la fecha de hoy.
              </p>
            )}
          </div>
        </aside>
      </div>
    </PageTransition>
  )
}
