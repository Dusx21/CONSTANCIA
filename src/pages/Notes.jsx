import { useState } from 'react'
import { Edit3, Plus, Trash2, Search, NotebookPen, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Confirm, Modal } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import PageTransition from '../components/ui/PageTransition'

export default function Notes() {
  const { data, update, flash } = useApp()
  const [editingNote, setEditingNote] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [search, setSearch] = useState('')

  const emptyNote = { title: '', content: '' }
  const [formData, setFormData] = useState(emptyNote)

  const openCreate = () => {
    setEditingNote(null)
    setFormData(emptyNote)
  }

  const openEdit = (n) => {
    setEditingNote(n)
    setFormData({ title: n.title, content: n.content })
  }

  const saveNote = () => {
    if (!formData.title.trim()) return

    const nowStr = new Date().toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short'
    })

    if (editingNote) {
      const updated = data.notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, ...formData, title: formData.title.trim(), updated: nowStr }
          : n
      )
      update('notes', updated)
      flash('Nota actualizada')
    } else {
      const newNote = {
        id: crypto.randomUUID(),
        title: formData.title.trim(),
        content: formData.content,
        updated: 'Hoy'
      }
      update('notes', [...data.notes, newNote])
      flash('Nota creada')
    }

    setEditingNote(null)
    setFormData(emptyNote)
  }

  const filteredNotes = (data.notes || []).filter((n) => {
    const q = search.toLowerCase()
    return (
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    )
  })

  return (
    <PageTransition>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Archivo & Ideas</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Notas & Pensamientos</h1>
          <p className="mt-1 text-sm text-muted">
            Espacio rápido para almacenar principios, recordatorios y aprendizajes.
          </p>
        </div>
        <button onClick={openCreate} className="primary-btn shadow-glow">
          <Plus size={18} />
          Nueva nota
        </button>
      </div>

      {/* Buscador de notas */}
      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-muted" />
          <input
            className="input pl-10"
            placeholder="Buscar en tus notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cuadrícula de notas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((n) => (
            <article
              key={n.id}
              className="card flex flex-col justify-between group transition hover:border-slate-500"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <span className="text-[11px] font-semibold text-mint">
                    {n.updated ? `Actualizada: ${n.updated}` : 'Nota'}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(n)}
                      className="icon-btn h-8 w-8 text-muted hover:text-mint"
                      aria-label="Editar nota"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setRemoveTarget(n)}
                      className="icon-btn h-8 w-8 text-muted hover:text-red-400"
                      aria-label="Eliminar nota"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h2 className="mt-3 font-display text-lg font-bold text-ink">{n.title}</h2>
                <p className="mt-2 text-xs sm:text-sm text-muted whitespace-pre-wrap line-clamp-6 leading-relaxed">
                  {n.content || 'Sin contenido adicional.'}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="card col-span-full py-12 text-center text-sm text-muted">
            {search
              ? 'No se encontraron notas con esa búsqueda.'
              : 'No tienes notas guardadas aún.'}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Nota */}
      {(editingNote !== null || formData.title !== '' || formData.content !== '') && (
        <Modal
          open={Boolean(editingNote !== null || formData !== emptyNote)}
          onClose={() => {
            setEditingNote(null)
            setFormData(emptyNote)
          }}
          title={editingNote ? 'Editar nota' : 'Nueva nota'}
        >
          <Field label="Título de la nota">
            <input
              autoFocus
              className="input"
              placeholder="Ej: Principios de la semana, Recordatorio examen..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Field>

          <Field label="Contenido">
            <textarea
              className="input min-h-48 leading-relaxed"
              placeholder="Escribe libremente aquí..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </Field>

          <button onClick={saveNote} className="primary-btn w-full mt-4">
            {editingNote ? 'Guardar cambios' : 'Crear nota'}
          </button>
        </Modal>
      )}

      {/* Confirmar eliminación */}
      <Confirm
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="¿Eliminar nota?"
        text={`¿Deseas eliminar "${removeTarget?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          update(
            'notes',
            data.notes.filter((n) => n.id !== removeTarget.id)
          )
          flash('Nota eliminada')
          setRemoveTarget(null)
        }}
      />
    </PageTransition>
  )
}
