import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CalendarDays,
  Clock3,
  CalendarCheck
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  dateKey,
  formatLongDate,
  formatMonthYear,
  getMonthGrid,
  getWeekDays,
  isToday,
  weekday,
  shortWeekdays,
  monthNames
} from '../utils/date'
import { categories, getCategoryColor } from '../data/initialData'
import { Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import PageTransition from '../components/ui/PageTransition'

export default function Calendar() {
  const { data, update, flash } = useApp()
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [selectedDateKey, setSelectedDateKey] = useState(dateKey())
  const [view, setView] = useState('Mes') // 'Mes' | 'Semana'
  const [newTaskModal, setNewTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCat, setNewTaskCat] = useState('Personal')
  const [newTaskPriority, setNewTaskPriority] = useState('Normal')

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDateKey(dateKey())
  }

  const monthGrid = getMonthGrid(currentYear, currentMonth)
  const weekDays = getWeekDays(selectedDateKey)

  // Tareas para la fecha seleccionada
  const selectedDayTasks = data.tasks.filter(t => t.date === selectedDateKey)
  // Bloques de horario según el día de la semana de la fecha seleccionada
  const selectedWeekdayName = weekday(selectedDateKey)
  const selectedDayBlocks = data.events[selectedWeekdayName] || []

  const toggleTask = (taskId) => {
    const updated = data.tasks.map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    )
    update('tasks', updated)
    const task = data.tasks.find(t => t.id === taskId)
    flash(task?.done ? 'Tarea reactivada' : 'Tarea completada')
  }

  const saveQuickTask = () => {
    if (!newTaskTitle.trim()) return
    const newTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      detail: `Programada para el ${selectedDateKey}`,
      category: newTaskCat,
      priority: newTaskPriority,
      date: selectedDateKey,
      due: selectedDateKey === dateKey() ? 'Hoy' : selectedDateKey,
      done: false
    }
    update('tasks', [...data.tasks, newTask])
    flash('Tarea programada para esta fecha')
    setNewTaskTitle('')
    setNewTaskModal(false)
  }

  return (
    <PageTransition>
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Planificación temporal activa</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="mt-1 text-sm text-muted">
            Gestiona tus compromisos y tareas por fecha.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-xl border border-line bg-elevated px-3 py-2 text-xs font-semibold text-mint transition hover:border-emerald"
          >
            Hoy
          </button>
          <div className="flex rounded-xl bg-surface p-1 border border-line">
            {['Mes', 'Semana'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  view === v ? 'bg-elevated text-mint shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Panel del Calendario */}
        <div className="card">
          {/* Navegación del mes */}
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <button
              onClick={prevMonth}
              className="icon-btn"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <h2 className="font-display text-lg sm:text-xl font-bold capitalize">
              {formatMonthYear(currentYear, currentMonth)}
            </h2>

            <button
              onClick={nextMonth}
              className="icon-btn"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {view === 'Mes' ? (
            <div className="mt-4">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted mb-2">
                {shortWeekdays.map(d => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {monthGrid.map((cell) => {
                  const dayTasks = data.tasks.filter(t => t.date === cell.dateKey)
                  const dayWeekday = weekday(cell.dateKey)
                  const hasBlocks = (data.events[dayWeekday] || []).length > 0
                  const isSelected = cell.dateKey === selectedDateKey

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                      className={`relative flex min-h-[64px] sm:min-h-[78px] flex-col justify-between rounded-xl p-1.5 sm:p-2 text-left transition-all ${
                        cell.isCurrentMonth
                          ? 'bg-elevated/70 hover:bg-elevated'
                          : 'bg-inset/30 opacity-40 hover:opacity-75'
                      } ${
                        isSelected
                          ? 'ring-2 ring-emerald border-transparent bg-emerald/10'
                          : 'border border-line/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            cell.isToday
                              ? 'grid h-6 w-6 place-items-center rounded-full bg-emerald text-canvas'
                              : isSelected
                              ? 'text-mint'
                              : 'text-ink'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-semibold text-mint sm:block hidden">
                            {dayTasks.filter(t => t.done).length}/{dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Indicadores visuales de tareas y bloques */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {dayTasks.slice(0, 3).map(t => (
                          <span
                            key={t.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              t.done ? 'bg-slate-500' : 'bg-emerald'
                            }`}
                            title={t.title}
                          />
                        ))}
                        {hasBlocks && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-cyan"
                            title="Bloques programados"
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Vista Semana */
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(w => (
                  <button
                    key={w.dateKey}
                    onClick={() => setSelectedDateKey(w.dateKey)}
                    className={`rounded-xl p-2 transition ${
                      selectedDateKey === w.dateKey
                        ? 'bg-emerald/15 text-mint ring-1 ring-emerald'
                        : 'bg-elevated text-muted hover:text-ink'
                    }`}
                  >
                    <div className="text-[11px] font-semibold">{w.shortName}</div>
                    <div className={`mt-1 font-display text-sm font-bold ${w.isToday ? 'text-mint' : ''}`}>
                      {w.dayNumber}
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-line bg-elevated/40 p-4">
                <p className="text-xs text-muted mb-3 font-semibold uppercase tracking-wider">
                  Semana del {weekDays[0]?.dayNumber} al {weekDays[6]?.dayNumber} de {monthNames[currentMonth]}
                </p>
                <div className="space-y-2">
                  {weekDays.map(w => {
                    const tasksCount = data.tasks.filter(t => t.date === w.dateKey).length
                    const blocksCount = (data.events[w.dayName] || []).length
                    return (
                      <div
                        key={w.dateKey}
                        onClick={() => setSelectedDateKey(w.dateKey)}
                        className={`flex items-center justify-between rounded-xl p-3 border transition cursor-pointer ${
                          w.dateKey === selectedDateKey
                            ? 'border-emerald bg-emerald/5'
                            : 'border-line/60 bg-surface hover:bg-elevated'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold w-16 ${w.isToday ? 'text-mint' : ''}`}>
                            {w.shortName} {w.dayNumber}
                          </span>
                          <span className="text-xs text-muted">
                            {blocksCount} bloques de rutina
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="chip bg-elevated text-slate-300 text-xs">
                            {tasksCount} tareas
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral: Agenda del día seleccionado */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
              <div>
                <p className="eyebrow flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  Agenda seleccionada
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-ink">
                  {formatLongDate(selectedDateKey)}
                </h3>
              </div>
              <button
                onClick={() => setNewTaskModal(true)}
                className="icon-btn text-mint hover:bg-emerald/10"
                aria-label="Añadir tarea a esta fecha"
                title="Añadir tarea para este día"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Tareas del día */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-muted tracking-wider">
                  Tareas para esta fecha ({selectedDayTasks.length})
                </span>
                <button
                  onClick={() => setNewTaskModal(true)}
                  className="text-xs font-semibold text-mint hover:underline"
                >
                  + Nueva
                </button>
              </div>

              {selectedDayTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayTasks.map(t => (
                    <div
                      key={t.id}
                      className="flex items-start gap-3 rounded-xl border border-line bg-elevated p-3 transition hover:border-slate-600"
                    >
                      <button
                        onClick={() => toggleTask(t.id)}
                        className={`check mt-0.5 ${
                          t.done ? 'border-emerald bg-emerald text-canvas' : ''
                        }`}
                        aria-label="Marcar tarea"
                      >
                        {t.done && <Check size={14} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            t.done ? 'text-muted line-through' : 'text-ink'
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className="chip text-[10px]"
                            style={{
                              background: `${getCategoryColor(t.category)}18`,
                              color: getCategoryColor(t.category)
                            }}
                          >
                            {t.category}
                          </span>
                          <span className="text-[11px] text-muted">{t.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted">
                  No hay tareas programadas para este día.{' '}
                  <button
                    onClick={() => setNewTaskModal(true)}
                    className="text-mint underline"
                  >
                    Crear una
                  </button>
                </div>
              )}
            </div>

            {/* Bloques de rutina para este día */}
            <div className="mt-6 pt-4 border-t border-line">
              <span className="text-xs font-semibold uppercase text-muted tracking-wider block mb-2">
                Bloques de rutina ({selectedWeekdayName})
              </span>
              {selectedDayBlocks.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedDayBlocks.map(([time, title, cat], i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl bg-elevated/60 px-3 py-2 text-xs"
                      style={{ borderLeft: `3px solid ${getCategoryColor(cat)}` }}
                    >
                      <Clock3 size={13} className="text-muted shrink-0" />
                      <span className="font-bold text-mint w-11 shrink-0">{time}</span>
                      <span className="truncate text-ink flex-1">{title}</span>
                      <span
                        className="text-[10px] font-semibold shrink-0"
                        style={{ color: getCategoryColor(cat) }}
                      >
                        {cat}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Sin bloques de rutina este día.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para añadir tarea específica a esta fecha */}
      {newTaskModal && (
        <Modal
          open
          onClose={() => setNewTaskModal(false)}
          title={`Nueva tarea (${selectedDateKey})`}
        >
          <Field label="Título de la tarea">
            <input
              autoFocus
              className="input"
              placeholder="¿Qué necesitas hacer en este día?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveQuickTask()}
            />
          </Field>
          <Field label="Categoría">
            <select
              className="input"
              value={newTaskCat}
              onChange={(e) => setNewTaskCat(e.target.value)}
            >
              {Object.keys(categories).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridad">
            <select
              className="input"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
            >
              {['Alta', 'Media', 'Normal', 'Baja'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <button onClick={saveQuickTask} className="primary-btn w-full mt-3">
            Programar tarea
          </button>
        </Modal>
      )}
    </PageTransition>
  )
}
