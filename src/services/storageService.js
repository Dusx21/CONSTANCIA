import { initialHabits, getInitialTasks, schedule } from '../data/initialData'
import { dateKey } from '../utils/date'

const STORAGE_KEY = 'constancia-v1'
const clone = (x) => JSON.parse(JSON.stringify(x))

export const getDefaults = () => ({
  version: 3,
  habits: clone(initialHabits),
  tasks: clone(getInitialTasks()),
  notes: [
    {
      id: 'n1',
      title: 'Enfoque y Prioridades',
      content: 'Mantener consistencia en el despertar 04:55, entrenar con intensidad moderada y priorizar los bloques de mayor concentración en la mañana.',
      updated: 'Reciente'
    },
    {
      id: 'n2',
      title: 'Regla de Oro del Día',
      content: 'No negociar el descanso nocturno: preparar el entorno para dormir antes de las 22:45.',
      updated: 'Reciente'
    }
  ],
  events: clone(schedule),
  review: {
    good: 'Excelente constancia en la rutina matutina y asistencia a turnos.',
    improve: 'Evitar procrastinar en la transición entre trabajo remoto y descanso.',
    priority: 'Cerrar entregas pendientes a tiempo y mantener hidratación.'
  },
  settings: {
    name: 'Sebastián',
    notifications: true,
    theme: 'dark'
  },
  daily: {}
})

function migrate(data) {
  const defaults = getDefaults()
  const base = { ...clone(defaults), ...data }

  if (!base.daily) base.daily = {}
  if (!base.settings) base.settings = defaults.settings
  if (!base.notes || !base.notes.length) base.notes = defaults.notes
  if (!base.events) base.events = defaults.events
  
  // Migrar tareas antiguas sin fecha
  if (Array.isArray(base.tasks)) {
    base.tasks = base.tasks.map((t) => ({
      ...t,
      date: t.date || dateKey(),
      due: t.due || 'Hoy'
    }))
  } else {
    base.tasks = defaults.tasks
  }

  base.version = 3
  return base
}

function all() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return stored ? migrate(stored) : clone(getDefaults())
  } catch (err) {
    console.error('Error al leer de localStorage:', err)
    return clone(getDefaults())
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Error al guardar en localStorage:', err)
  }
  return data
}

export const storageService = {
  get: all,
  save,
  reset: () => save(clone(getDefaults())),
  updateCollection: (name, items) => {
    const d = all()
    d[name] = items
    return save(d)
  },
  export: () => JSON.stringify(all(), null, 2),
  import: (raw) => {
    const parsed = JSON.parse(raw)
    const migrated = migrate(parsed)
    return save(migrated)
  }
}
