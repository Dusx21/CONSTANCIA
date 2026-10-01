import { emptySchedule } from '../data/initialData'

const STORAGE_KEY = 'constancia_v4_clean'
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

export function isMockData(base) {
  if (!base) return false
  if (base.settings?.name === 'Sebastián') return true
  if (
    base.habits?.some(
      (h) =>
        h.id === 'h1' ||
        h.id === 'h2' ||
        h.id === 'h3' ||
        h.id === 'h4' ||
        h.title?.includes('04:55') ||
        h.title?.includes('Gimnasio (Fuerza') ||
        h.title?.includes('Turno Clínica') ||
        h.title?.includes('Hidratación 2.5L')
    )
  ) {
    return true
  }
  if (
    base.tasks?.some(
      (t) =>
        t.id === 't1' ||
        t.id === 't2' ||
        t.id === 't3' ||
        t.id === 't4' ||
        t.title?.includes('SUNAT') ||
        t.title?.includes('programación') ||
        t.title?.includes('suplementos')
    )
  ) {
    return true
  }
  if (
    base.events?.Lunes?.some(
      (e) => e[1]?.includes('Clínica') || e[1]?.includes('Despertar & Activación')
    )
  ) {
    return true
  }
  if (
    base.review?.good?.includes('04:55') ||
    base.review?.good?.includes('rutina matutina')
  ) {
    return true
  }
  return false
}

function migrate(data) {
  const defaults = getDefaults()
  const base = { ...clone(defaults), ...data }

  // Si contiene datos de prueba o mock, se purgan por completo
  if (isMockData(base) || !base.version || base.version < 4) {
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
    // También limpiamos la clave antigua de prueba 'constancia-v1' si existe
    if (localStorage.getItem('constancia-v1')) {
      localStorage.removeItem('constancia-v1')
    }

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
  reset: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('constancia-v1')
    return save(clone(getDefaults()))
  },
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
