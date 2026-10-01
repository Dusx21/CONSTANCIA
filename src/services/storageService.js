import { emptySchedule } from '../data/initialData'

const STORAGE_KEY = 'constancia-v1'
const clone = (x) => JSON.parse(JSON.stringify(x))

export const getDefaults = () => ({
  version: 4,
  habits: [],
  tasks: [],
  notes: [],
  events: {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
    Sábado: [],
    Domingo: []
  },
  review: {
    good: '',
    improve: '',
    priority: ''
  },
  settings: {
    name: '',
    notifications: true,
    theme: 'dark'
  },
  daily: {}
})

function migrate(data) {
  const defaults = getDefaults()
  const base = { ...clone(defaults), ...data }

  // Si viene de versiones de prueba anteriores con datos quemados ("Sebastián" o tareas mock)
  const isMockState =
    !base.version ||
    base.version < 4 ||
    base.settings?.name === 'Sebastián' ||
    base.tasks?.some((t) => t.id === 't1' || t.title?.includes('SUNAT')) ||
    base.habits?.some((h) => h.id === 'h1' || h.title?.includes('04:55'))

  if (isMockState) {
    return clone(defaults)
  }

  if (!base.daily) base.daily = {}
  if (!base.settings) base.settings = defaults.settings
  if (!base.notes) base.notes = []
  if (!base.events) base.events = clone(emptySchedule)
  if (!Array.isArray(base.tasks)) base.tasks = []
  if (!Array.isArray(base.habits)) base.habits = []

  base.version = 4
  return base
}

function all() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(getDefaults())
    const stored = JSON.parse(raw)
    return stored ? migrate(stored) : clone(getDefaults())
  } catch {
    return clone(getDefaults())
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Silencioso en producción
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
