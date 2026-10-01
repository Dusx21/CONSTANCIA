import { useState } from 'react'
import { Plus, Edit3, Trash2, Clock, Calendar, Check, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { categories, getCategoryColor } from '../data/initialData'
import { Modal, Confirm } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import PageTransition from '../components/ui/PageTransition'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Schedule() {
  const { data, update, flash } = useApp()
  const [activeDay, setActiveDay] = useState('Lunes')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null) // { day, index, time, title, category }
  const [deleteTarget, setDeleteTarget] = useState(null) // { day, index, title }
  const [formData, setFormData] = useState({
    day: 'Lunes',
    time: '08:00',
    title: '',
    category: 'Personal'
  })

  // Abrir modal para crear
  const openCreate = (day = activeDay) => {
    setEditingBlock(null)
    setFormData({
      day,
      time: '08:00',
      title: '',
      category: 'Personal'
    })
    setModalOpen(true)
  }

  // Abrir modal para editar
  const openEdit = (day, index, [time, title, cat]) => {
    setEditingBlock({ day, index })
    setFormData({
      day,
      time,
      title,
      category: cat || 'Personal'
    })
    setModalOpen(true)
  }

  // Guardar creación o edición
  const handleSave = () => {
    if (!formData.title.trim()) return

    const events = { ...data.events }
    const targetDay = formData.day

    if (editingBlock) {
      const { day: originalDay, index: originalIndex } = editingBlock

      // Si cambió de día, removemos del original y agregamos al nuevo
      if (originalDay !== targetDay) {
        const originalList = [...(events[originalDay] || [])]
        originalList.splice(originalIndex, 1)
        events[originalDay] = originalList

        const targetList = [...(events[targetDay] || [])]
        targetList.push([formData.time, formData.title.trim(), formData.category])
        targetList.sort((a, b) => a[0].localeCompare(b[0]))
        events[targetDay] = targetList
      } else {
        const dayList = [...(events[targetDay] || [])]
        dayList[originalIndex] = [formData.time, formData.title.trim(), formData.category]
        dayList.sort((a, b) => a[0].localeCompare(b[0]))
        events[targetDay] = dayList
      }
      flash('Bloque actualizado')
    } else {
      const dayList = [...(events[targetDay] || [])]
      dayList.push([formData.time, formData.title.trim(), formData.category])
      dayList.sort((a, b) => a[0].localeCompare(b[0]))
      events[targetDay] = dayList
      flash('Bloque creado con éxito')
    }

    update('events', events)
    setModalOpen(false)
  }

  // Eliminar bloque
  const confirmDelete = () => {
    if (!deleteTarget) return
    const { day, index } = deleteTarget
    const events = { ...data.events }
    const dayList = [...(events[day] || [])]
    dayList.splice(index, 1)
    events[day] = dayList
    update('events', events)
    flash('Bloque eliminado')
    setDeleteTarget(null)
  }

  // Métricas dinámicas calculadas en base a los bloques reales
  const allBlocks = Object.values(data.events || {}).flat()
  const totalBlocks = allBlocks.length
  const blocksByCat = allBlocks.reduce((acc, [, , cat]) => {
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  return (
    <PageTransition>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Arquitectura operativa semanal</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mi Horario Semanal</h1>
          <p className="mt-1 text-sm text-muted">
            Diseña los bloques que estructuran tus días de alta demanda.
          </p>
        </div>
        <button className="primary-btn shadow-glow" onClick={() => openCreate(activeDay)}>
          <Plus size={18} />
          Nuevo bloque
        </button>
      </div>

      {/* Métricas dinámicas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Bloques programados</p>
          <p className="mt-2 font-display text-3xl font-bold text-mint">{totalBlocks}</p>
          <p className="mt-1 text-xs text-muted">En los 7 días de la semana</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Categorías Activas</p>
          <p className="mt-2 font-display text-3xl font-bold text-cyan">
            {Object.keys(blocksByCat).length} <span className="text-sm font-normal text-muted">tipos</span>
          </p>
          <p className="mt-1 text-xs text-muted">Distribución de actividades</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Días Estructurados</p>
          <p className="mt-2 font-display text-3xl font-bold text-orange">
            {Object.values(data.events || {}).filter((list) => list.length > 0).length}/7
          </p>
          <p className="mt-1 text-xs text-muted">Días con rutina definida</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase text-muted">Bloques en {activeDay}</p>
          <p className="mt-2 font-display text-3xl font-bold text-gold">
            {(data.events?.[activeDay] || []).length}{' '}
            <span className="text-sm font-normal text-muted">bloques</span>
          </p>
          <p className="mt-1 text-xs text-muted">Carga del día seleccionado</p>
        </div>
      </div>

      {/* Selector de día para móvil / pestañas */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto rounded-2xl bg-surface p-1.5 border border-line">
        {DAYS.map(d => {
          const count = (data.events[d] || []).length
          const isActive = activeDay === d
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-emerald text-canvas shadow-sm font-bold'
                  : 'text-muted hover:text-ink hover:bg-elevated'
              }`}
            >
              <span>{d}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                isActive ? 'bg-canvas/20 text-canvas' : 'bg-elevated text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Vista del día activo (perfecta para celular) */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-ink">
            {activeDay} — <span className="text-sm font-normal text-muted">{(data.events[activeDay] || []).length} bloques</span>
          </h2>
          <button
            onClick={() => openCreate(activeDay)}
            className="text-xs font-semibold text-mint hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Añadir a este día
          </button>
        </div>

        {(data.events[activeDay] || []).length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(data.events[activeDay] || []).map(([time, title, cat], i) => (
              <article
                key={i}
                className="card flex flex-col justify-between group transition hover:border-slate-500"
                style={{ borderLeft: `4px solid ${getCategoryColor(cat)}` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="chip text-[11px]"
                      style={{
                        background: `${getCategoryColor(cat)}18`,
                        color: getCategoryColor(cat)
                      }}
                    >
                      {cat}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(activeDay, i, [time, title, cat])}
                        className="icon-btn h-8 w-8 text-muted hover:text-mint"
                        aria-label="Editar bloque"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ day: activeDay, index: i, title })}
                        className="icon-btn h-8 w-8 text-muted hover:text-red-400"
                        aria-label="Eliminar bloque"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-ink">{title}</h3>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-mint">
                  <Clock size={14} />
                  <span>{time}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card py-12 text-center">
            <p className="text-sm text-muted">No tienes bloques asignados para los {activeDay}s.</p>
            <button
              onClick={() => openCreate(activeDay)}
              className="primary-btn mt-4 inline-flex"
            >
              <Plus size={16} /> Crear primer bloque
            </button>
          </div>
        )}
      </div>

      {/* Modal para Crear / Editar Bloque */}
      {modalOpen && (
        <Modal
          open
          onClose={() => setModalOpen(false)}
          title={editingBlock ? 'Editar bloque' : 'Crear bloque de horario'}
        >
          <Field label="Día de la semana">
            <select
              className="input"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="Hora">
            <input
              type="time"
              className="input"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </Field>

          <Field label="Título de la actividad">
            <input
              autoFocus
              className="input"
              placeholder="Ej: Turno Clínica, Gimnasio, Estudio..."
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

          <button onClick={handleSave} className="primary-btn w-full mt-4">
            {editingBlock ? 'Guardar cambios' : 'Crear bloque'}
          </button>
        </Modal>
      )}

      {/* Confirmar eliminación */}
      <Confirm
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar bloque?"
        text={`¿Estás seguro de que deseas eliminar "${deleteTarget?.title}" de los ${deleteTarget?.day}?`}
        onConfirm={confirmDelete}
      />
    </PageTransition>
  )
}
