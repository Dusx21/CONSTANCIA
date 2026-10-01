import { useState } from 'react'
import { Check, Edit3, Plus, Trash2, Flame, Award, Sparkles, TrendingUp } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import { categories, getCategoryColor } from '../data/initialData'
import { Confirm, Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import PageTransition from '../components/ui/PageTransition'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Habits() {
  const { data, update, flash } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [selectedHabitId, setSelectedHabitId] = useState(data.habits[0]?.id || null)

  const emptyForm = { title: '', category: 'Personal', frequency: 'Diario' }
  const [formData, setFormData] = useState(emptyForm)

  const selectedHabit = data.habits.find(h => h.id === selectedHabitId) || data.habits[0] || null

  const openModal = (habit = null) => {
    setEditingHabit(habit)
    setFormData(habit ? { title: habit.title, category: habit.category, frequency: habit.frequency } : emptyForm)
    setFormOpen(true)
  }

  const saveHabit = () => {
    if (!formData.title.trim()) return

    if (editingHabit) {
      const updated = data.habits.map(h =>
        h.id === editingHabit.id ? { ...h, ...formData, title: formData.title.trim() } : h
      )
      update('habits', updated)
      flash('Hábito actualizado')
    } else {
      const newHabit = {
        ...formData,
        id: crypto.randomUUID(),
        title: formData.title.trim(),
        streak: 0,
        completed: false,
        history: [0, 0, 0, 0, 0, 0, 0]
      }
      update('habits', [...data.habits, newHabit])
      setSelectedHabitId(newHabit.id)
      flash('Hábito creado con éxito')
    }
    setFormOpen(false)
  }

  const toggleDayHistory = (habitId, dayIndex) => {
    let nowCompletedAll = false

    const updated = data.habits.map(h => {
      if (h.id !== habitId) return h
      const nextHistory = [...h.history]
      const nextVal = nextHistory[dayIndex] ? 0 : 1
      nextHistory[dayIndex] = nextVal

      // Recalcular racha aproximada
      const streakCount = nextHistory.reduce((acc, v) => (v ? acc + 1 : acc), 0)
      return {
        ...h,
        history: nextHistory,
        streak: streakCount,
        completed: dayIndex === 6 ? Boolean(nextVal) : h.completed
      }
    })

    update('habits', updated)

    // Verificar si todos los hábitos de ese día fueron completados
    const allChecked = updated.every(h => h.history[dayIndex] === 1)
    if (allChecked) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      })
      flash('¡Increíble! Todos los hábitos cumplidos para este día 🎉')
    }
  }

  // Métricas calculadas dinámicamente
  const totalSlots = data.habits.length * 7
  const totalCompletedSlots = data.habits.reduce(
    (acc, h) => acc + h.history.reduce((a, b) => a + b, 0),
    0
  )
  const complianceRate = totalSlots > 0 ? Math.round((totalCompletedSlots / totalSlots) * 100) : 0
  const avgStreak = data.habits.length
    ? (data.habits.reduce((acc, h) => acc + (h.streak || 0), 0) / data.habits.length).toFixed(1)
    : '0'

  return (
    <PageTransition>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Registro de consistencia diaria</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Hábitos & Disciplina</h1>
          <p className="mt-1 text-sm text-muted">
            Monitorea el cumplimiento sistemático de tu rutina semanal.
          </p>
        </div>
        <button onClick={() => openModal(null)} className="primary-btn shadow-glow">
          <Plus size={18} />
          Nuevo hábito
        </button>
      </div>

      {/* Métricas dinámicas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Cumplimiento Global</p>
          <p className="mt-2 font-display text-3xl font-bold text-mint">{complianceRate}%</p>
          <div className="mt-3 h-1.5 rounded-full bg-inset">
            <div
              className="h-full rounded-full bg-emerald transition-all duration-500"
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Racha Promedio</p>
          <p className="mt-2 font-display text-3xl font-bold text-cyan">{avgStreak}d</p>
          <p className="mt-1 text-xs text-muted">Días consecutivos de avance</p>
        </div>

        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Hábitos Activos</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{data.habits.length}</p>
          <p className="mt-1 text-xs text-muted">En seguimiento constante</p>
        </div>

        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Check-ins Completados</p>
          <p className="mt-2 font-display text-3xl font-bold text-gold">
            {totalCompletedSlots}/{totalSlots}
          </p>
          <p className="mt-1 text-xs text-muted">En los últimos 7 días</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Tabla / Matriz Semanal de Hábitos */}
        <section className="card overflow-x-auto">
          <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
            <h2 className="font-display text-lg font-bold">Matriz Semanal de Cumplimiento</h2>
            <span className="text-xs text-muted hidden sm:inline">Haz clic en cada día para marcarlo</span>
          </div>

          {data.habits.length > 0 ? (
            <div className="min-w-[600px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-muted border-b border-line/60">
                    <th className="pb-3 font-semibold">Hábito</th>
                    {DAYS.map(d => (
                      <th key={d} className="pb-3 text-center font-semibold">{d}</th>
                    ))}
                    <th className="pb-3 text-right font-semibold">Racha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {data.habits.map((h) => {
                    const isSelected = h.id === selectedHabit?.id
                    return (
                      <tr
                        key={h.id}
                        onClick={() => setSelectedHabitId(h.id)}
                        className={`transition cursor-pointer ${
                          isSelected ? 'bg-emerald/5' : 'hover:bg-elevated/40'
                        }`}
                      >
                        <td className="py-3 pr-2">
                          <b className="block text-ink text-sm">{h.title}</b>
                          <span
                            className="text-[11px] font-semibold"
                            style={{ color: getCategoryColor(h.category) }}
                          >
                            {h.category} • {h.frequency}
                          </span>
                        </td>

                        {h.history.map((val, idx) => (
                          <td key={idx} className="text-center py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDayHistory(h.id, idx)
                              }}
                              className={`mx-auto grid h-8 w-8 place-items-center rounded-xl transition active:scale-90 ${
                                val
                                  ? 'bg-emerald text-canvas shadow-glow font-bold'
                                  : 'bg-inset text-slate-500 hover:border hover:border-slate-500'
                              }`}
                              aria-label={`Marcar ${DAYS[idx]}`}
                            >
                              {val ? <Check size={16} strokeWidth={3} /> : '·'}
                            </button>
                          </td>
                        ))}

                        <td className="py-3 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-mint">
                            <Flame size={14} className="text-orange" />
                            {h.streak}d
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted">
              No tienes hábitos registrados aún.{' '}
              <button onClick={() => openModal(null)} className="text-mint underline">
                Crear el primero
              </button>
            </div>
          )}
        </section>

        {/* Panel Lateral: Detalle del Hábito Seleccionado */}
        {selectedHabit ? (
          <aside className="card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="eyebrow">Hábito Seleccionado</span>
                <span
                  className="chip text-[10px]"
                  style={{
                    background: `${getCategoryColor(selectedHabit.category)}18`,
                    color: getCategoryColor(selectedHabit.category)
                  }}
                >
                  {selectedHabit.category}
                </span>
              </div>

              <h3 className="mt-3 font-display text-xl font-bold text-ink">
                {selectedHabit.title}
              </h3>
              <p className="mt-1 text-xs text-muted">Frecuencia: {selectedHabit.frequency}</p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-elevated p-3 border border-line">
                  <span className="text-xs text-muted block">Racha actual</span>
                  <b className="text-2xl font-display font-bold text-mint flex items-center gap-1 mt-1">
                    <Flame size={20} className="text-orange" />
                    {selectedHabit.streak || 0}d
                  </b>
                </div>

                <div className="rounded-xl bg-elevated p-3 border border-line">
                  <span className="text-xs text-muted block">Esta semana</span>
                  <b className="text-2xl font-display font-bold text-cyan mt-1 block">
                    {Math.round(
                      ((selectedHabit.history || []).reduce((a, b) => a + b, 0) / 7) * 100
                    )}%
                  </b>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-elevated/60 p-3 border border-line text-xs text-slate-300">
                <p className="flex items-center gap-1.5 font-semibold text-mint mb-1">
                  <TrendingUp size={14} /> Consistencia semanal
                </p>
                Has completado{' '}
                <b>{(selectedHabit.history || []).reduce((a, b) => a + b, 0)} de 7 días</b> en el ciclo actual.
              </div>
            </div>

            <div className="mt-6 flex gap-2 pt-4 border-t border-line">
              <button
                onClick={() => openModal(selectedHabit)}
                className="icon-btn flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold w-auto px-3"
              >
                <Edit3 size={15} /> Editar
              </button>
              <button
                onClick={() => setRemoveTarget(selectedHabit)}
                className="icon-btn flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold w-auto px-3 text-red-400 hover:border-red-500"
              >
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </aside>
        ) : (
          <aside className="card flex flex-col justify-center items-center text-center p-6 text-muted border-dashed">
            <Award size={36} className="text-mint mb-2 opacity-70" />
            <h3 className="font-display text-base font-bold text-ink">Comienza tu primera racha</h3>
            <p className="mt-1 text-xs text-muted">
              Define hábitos diarios o semanales y haz check-in cada día para construir disciplina.
            </p>
            <button
              onClick={() => openModal(null)}
              className="primary-btn mt-4 text-xs shadow-glow inline-flex"
            >
              <Plus size={14} /> Crear primer hábito
            </button>
          </aside>
        )}
      </div>

      {/* Modal Crear / Editar Hábito */}
      {formOpen && (
        <Modal
          open
          onClose={() => setFormOpen(false)}
          title={editingHabit ? 'Editar hábito' : 'Crear nuevo hábito'}
        >
          <Field label="Nombre del hábito">
            <input
              autoFocus
              className="input"
              placeholder="Ej: Levantarse a las 05:00, Gimnasio, Leer 20 min..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Field>

          <Field label="Categoría">
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {Object.keys(categories).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Frecuencia objetivo">
            <select
              className="input"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            >
              <option value="Diario">Diario</option>
              <option value="5 días / semana">5 días / semana</option>
              <option value="4 días / semana">4 días / semana</option>
              <option value="3 días / semana">3 días / semana</option>
              <option value="Fines de semana">Fines de semana</option>
            </select>
          </Field>

          <button onClick={saveHabit} className="primary-btn w-full mt-4">
            {editingHabit ? 'Guardar cambios' : 'Crear hábito'}
          </button>
        </Modal>
      )}

      {/* Modal Confirmar eliminación */}
      <Confirm
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="¿Eliminar hábito?"
        text={`¿Deseas eliminar "${removeTarget?.title}"? Se borrará todo su historial acumulado.`}
        onConfirm={() => {
          update('habits', data.habits.filter(h => h.id !== removeTarget.id))
          flash('Hábito eliminado')
          setRemoveTarget(null)
          if (selectedHabitId === removeTarget.id) {
            setSelectedHabitId(data.habits[0]?.id || null)
          }
        }}
      />
    </PageTransition>
  )
}
