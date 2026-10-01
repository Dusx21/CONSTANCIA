import { useState } from 'react'
import { Check, Edit3, Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import { categories, getCategoryColor } from '../data/initialData'
import { Confirm, Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import { addDays, dateKey, formatLongDate, taskScope, isToday } from '../utils/date'
import PageTransition from '../components/ui/PageTransition'

export default function Tasks() {
  const { data, update, flash } = useApp()
  const [tab, setTab] = useState('Todas')
  const [removeTarget, setRemoveTarget] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  const emptyTask = {
    title: '',
    detail: '',
    category: 'Personal',
    priority: 'Normal',
    date: dateKey()
  }
  const [formData, setFormData] = useState(emptyTask)

  const openCreate = () => {
    setEditingTask(null)
    setFormData(emptyTask)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      detail: task.detail || '',
      category: task.category,
      priority: task.priority,
      date: task.date || dateKey()
    })
  }

  const saveTask = () => {
    if (!formData.title.trim()) return

    const taskDate = formData.date || dateKey()
    const dueText = taskDate === dateKey() ? 'Hoy' : taskDate === addDays(1) ? 'Mañana' : taskDate

    if (editingTask) {
      const updated = data.tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              ...formData,
              title: formData.title.trim(),
              due: dueText,
              date: taskDate
            }
          : t
      )
      update('tasks', updated)
      flash('Tarea actualizada')
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        ...formData,
        title: formData.title.trim(),
        due: dueText,
        date: taskDate,
        done: false
      }
      update('tasks', [...data.tasks, newTask])
      flash('Tarea creada')
    }
    setEditingTask(null)
  }

  const toggleTask = (t) => {
    const nextDone = !t.done
    const updated = data.tasks.map((x) =>
      x.id === t.id ? { ...x, done: nextDone } : x
    )
    update('tasks', updated)

    if (nextDone) {
      flash('Tarea completada')
      // Si todas las de hoy están listas, lanzamos confetti
      const todayTasks = updated.filter(x => isToday(x.date))
      if (todayTasks.length > 0 && todayTasks.every(x => x.done)) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } })
        flash('¡Excelente! Todas las tareas de hoy completadas 🎉')
      }
    } else {
      flash('Tarea reabierta')
    }
  }

  const visibleTasks = data.tasks.filter((t) => {
    if (tab === 'Todas') return true
    return taskScope(t) === tab
  })

  const tabs = ['Todas', 'Hoy', 'Próximas', 'Atrasadas', 'Completadas']

  return (
    <PageTransition>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ejecución & Prioridades</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tareas Clave</h1>
          <p className="mt-1 text-sm text-muted">Alineación táctica y ejecución sin fricción.</p>
        </div>
        <button className="primary-btn shadow-glow" onClick={openCreate}>
          <Plus size={18} />
          Nueva tarea
        </button>
      </div>

      {/* Selector de pestañas */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto rounded-2xl bg-surface p-1.5 border border-line">
        {tabs.map((x) => {
          const count = data.tasks.filter((t) => (x === 'Todas' ? true : taskScope(t) === x)).length
          const isActive = tab === x
          return (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-emerald text-canvas shadow-sm font-bold'
                  : 'text-muted hover:text-ink hover:bg-elevated'
              }`}
            >
              <span>{x}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? 'bg-canvas/20 text-canvas' : 'bg-elevated text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista de tareas */}
      <section className="mt-6 space-y-3">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((t) => {
            const isLate = !t.done && t.date && t.date < dateKey()
            return (
              <article
                key={t.id}
                className="card flex items-start gap-3 transition hover:border-slate-500"
                style={{ borderLeft: `4px solid ${getCategoryColor(t.category)}` }}
              >
                <button
                  type="button"
                  aria-label="Completar tarea"
                  onClick={() => toggleTask(t)}
                  className={`check mt-0.5 ${
                    t.done ? 'border-emerald bg-emerald text-canvas shadow-glow' : ''
                  }`}
                >
                  {t.done && <Check size={16} strokeWidth={3} />}
                </button>

                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => openEdit(t)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="chip text-[10px]"
                      style={{
                        background: `${getCategoryColor(t.category)}18`,
                        color: getCategoryColor(t.category)
                      }}
                    >
                      {t.category}
                    </span>

                    <span className="chip bg-elevated text-muted text-[10px]">
                      {t.priority}
                    </span>

                    <span
                      className={`ml-auto flex items-center gap-1 text-xs font-semibold ${
                        isLate ? 'text-red-400' : 'text-muted'
                      }`}
                    >
                      {isLate && <AlertTriangle size={13} />}
                      <Calendar size={13} />
                      {t.date ? (isToday(t.date) ? 'Hoy' : t.date) : 'Sin fecha'}
                    </span>
                  </div>

                  <h2
                    className={`mt-2 font-display text-base sm:text-lg font-bold ${
                      t.done ? 'text-muted line-through' : 'text-ink'
                    }`}
                  >
                    {t.title}
                  </h2>

                  {t.detail && (
                    <p className="mt-1 text-xs text-muted line-clamp-2">{t.detail}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    aria-label="Editar tarea"
                    onClick={() => openEdit(t)}
                    className="icon-btn h-9 w-9 text-muted hover:text-mint"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    aria-label="Eliminar tarea"
                    onClick={() => setRemoveTarget(t)}
                    className="icon-btn h-9 w-9 text-muted hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            )
          })
        ) : (
          <div className="card py-12 text-center text-sm text-muted">
            No hay tareas en la sección &quot;{tab}&quot;.
          </div>
        )}
      </section>

      {/* Modal Crear / Editar Tarea */}
      {(editingTask !== null || formData.title !== '' || formData.detail !== '') && (
        <Modal
          open={Boolean(editingTask !== null || formData !== emptyTask)}
          onClose={() => {
            setEditingTask(null)
            setFormData(emptyTask)
          }}
          title={editingTask ? 'Editar tarea' : 'Crear nueva tarea'}
        >
          <Field label="Título de la tarea">
            <input
              autoFocus
              className="input"
              placeholder="¿Qué necesitas resolver?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && saveTask()}
            />
          </Field>

          <Field label="Detalles o notas adicionales">
            <textarea
              className="input min-h-20"
              placeholder="Contexto, links o especificaciones..."
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
            />
          </Field>

          <Field label="Fecha límite">
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </Field>

          <Field label="Categoría">
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {Object.keys(categories).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Prioridad">
            <select
              className="input"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              {['Alta', 'Media', 'Normal', 'Baja'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <button onClick={saveTask} className="primary-btn w-full mt-4">
            {editingTask ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </Modal>
      )}

      {/* Confirmación de eliminación */}
      <Confirm
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="¿Eliminar tarea?"
        text={`¿Deseas eliminar "${removeTarget?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          update(
            'tasks',
            data.tasks.filter((t) => t.id !== removeTarget.id)
          )
          flash('Tarea eliminada')
          setRemoveTarget(null)
        }}
      />
    </PageTransition>
  )
}
