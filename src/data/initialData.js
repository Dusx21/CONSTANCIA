export const categories = {
  'Trabajo': { color: '#3b82f6', icon: 'Laptop' },
  'Estudio': { color: '#8b5cf6', icon: 'GraduationCap' },
  'Salud & Fitness': { color: '#f97316', icon: 'Dumbbell' },
  'Personal': { color: '#ec4899', icon: 'Heart' },
  'Descanso': { color: '#a78bfa', icon: 'Moon' },
  'Finanzas & Negocio': { color: '#eab308', icon: 'BriefcaseBusiness' },
  'Salud & Clínica': { color: '#06b6d4', icon: 'Stethoscope' },
  'Traslado': { color: '#64748b', icon: 'Bus' }
}

export const getCategoryColor = (cat) => {
  return categories[cat]?.color || '#10b981'
}

export const emptySchedule = {
  Lunes: [],
  Martes: [],
  Miércoles: [],
  Jueves: [],
  Viernes: [],
  Sábado: [],
  Domingo: []
}

export const schedule = { ...emptySchedule }
export const initialHabits = []
export const initialTasks = []
export const getInitialTasks = () => []
