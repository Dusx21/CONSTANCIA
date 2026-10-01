import { Save, Sparkles, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/ui/PageTransition'

export default function Review() {
  const { data, update, flash } = useApp()
  const review = data.review || {
    good: '',
    improve: '',
    priority: ''
  }

  const setField = (key, val) => {
    update('review', { ...review, [key]: val })
  }

  // Métricas reales
  const totalTasks = data.tasks.length
  const completedTasks = data.tasks.filter(t => t.done).length
  const pendingTasks = totalTasks - completedTasks
  const maxStreak = data.habits.length
    ? Math.max(...data.habits.map(h => h.streak || 0))
    : 0

  const handleSave = () => {
    update('review', review)
    flash('Revisión semanal guardada con éxito')
  }

  return (
    <PageTransition className="mx-auto max-w-3xl">
      <div>
        <p className="eyebrow">Calibración reflexiva semanal</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Revisión Semanal</h1>
        <p className="mt-1 text-sm text-muted">
          Pausa, evalúa lo que funcionó y ajusta la estrategia para el próximo ciclo.
        </p>
      </div>

      <section className="card mt-6">
        {/* Métricas del Ciclo */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-elevated p-4 border border-line">
            <span className="text-xs text-muted block">Tareas Logradas</span>
            <b className="font-display text-2xl font-bold text-mint mt-1 block">
              {completedTasks}/{totalTasks}
            </b>
          </div>

          <div className="rounded-xl bg-elevated p-4 border border-line">
            <span className="text-xs text-muted block">Tareas Pendientes</span>
            <b className="font-display text-2xl font-bold text-cyan mt-1 block">
              {pendingTasks}
            </b>
          </div>

          <div className="rounded-xl bg-elevated p-4 border border-line">
            <span className="text-xs text-muted block">Mayor Racha</span>
            <b className="font-display text-2xl font-bold text-orange mt-1 block">
              {maxStreak} días
            </b>
          </div>
        </div>

        {/* Preguntas de calibración */}
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald/15 text-xs font-bold text-mint">
                1
              </span>
              ¿Qué hice bien y qué victorias logré esta semana?
            </span>
            <textarea
              className="input min-h-24 leading-relaxed"
              placeholder="Reflexiona sobre tu constancia, hábitos cumplidos y avances..."
              value={review.good || ''}
              onChange={(e) => setField('good', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-cyan/15 text-xs font-bold text-cyan">
                2
              </span>
              ¿Qué obstáculos surgieron y qué puedo corregir?
            </span>
            <textarea
              className="input min-h-24 leading-relaxed"
              placeholder="Identifica distracciones, fricciones o momentos de fatiga..."
              value={review.improve || ''}
              onChange={(e) => setField('improve', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-gold/15 text-xs font-bold text-gold">
                3
              </span>
              ¿Cuáles son las 3 prioridades no negociables para la próxima semana?
            </span>
            <textarea
              className="input min-h-24 leading-relaxed"
              placeholder="Entregas críticas, metas de salud o hábitos clave a blindar..."
              value={review.priority || ''}
              onChange={(e) => setField('priority', e.target.value)}
            />
          </label>
        </div>

        <button onClick={handleSave} className="primary-btn mt-6 w-full shadow-glow">
          <Save size={18} />
          Guardar reflexión semanal
        </button>
      </section>
    </PageTransition>
  )
}
