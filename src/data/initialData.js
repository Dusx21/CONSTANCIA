import { dateKey, addDays } from '../utils/date'

export const categories = {
  'Clínica': { color: '#06b6d4', icon: 'Stethoscope' },
  'Universidad': { color: '#8b5cf6', icon: 'GraduationCap' },
  'Gimnasio': { color: '#f97316', icon: 'Dumbbell' },
  'Trabajo remoto': { color: '#3b82f6', icon: 'Laptop' },
  'Negocio': { color: '#eab308', icon: 'BriefcaseBusiness' },
  'Personal': { color: '#ec4899', icon: 'Heart' },
  'Descanso': { color: '#a78bfa', icon: 'Moon' },
  'Traslado': { color: '#64748b', icon: 'Bus' }
}

export const getCategoryColor = (cat) => {
  return categories[cat]?.color || '#10b981'
}

export const schedule = {
  Lunes: [
    ['04:55', 'Despertar & Activación', 'Personal'],
    ['05:20', 'Traslado', 'Traslado'],
    ['06:00', 'Gimnasio (Fuerza)', 'Gimnasio'],
    ['06:50', 'Ducha & Cambio', 'Personal'],
    ['07:10', 'Traslado', 'Traslado'],
    ['08:00', 'Clínica Turno Mañana', 'Clínica'],
    ['13:00', 'Almuerzo & Pausa', 'Descanso'],
    ['14:00', 'Universidad / Clases', 'Universidad'],
    ['22:00', 'Regreso a casa', 'Traslado'],
    ['22:45', 'Descanso nocturno', 'Descanso']
  ],
  Martes: [
    ['04:55', 'Despertar & Activación', 'Personal'],
    ['05:20', 'Traslado', 'Traslado'],
    ['06:00', 'Gimnasio (Movilidad)', 'Gimnasio'],
    ['06:50', 'Ducha & Cambio', 'Personal'],
    ['07:10', 'Traslado', 'Traslado'],
    ['08:00', 'Clínica Turno Mañana', 'Clínica'],
    ['13:00', 'Almuerzo', 'Descanso'],
    ['14:00', 'Trabajo Remoto & Enfoque', 'Trabajo remoto'],
    ['16:00', 'Universidad / Estudio', 'Universidad'],
    ['20:00', 'Cena & Relax', 'Descanso'],
    ['21:00', 'Negocio / Proyectos', 'Negocio'],
    ['22:45', 'Descanso nocturno', 'Descanso']
  ],
  Miércoles: [],
  Jueves: [],
  Viernes: [],
  Sábado: [
    ['06:30', 'Despertar', 'Personal'],
    ['08:00', 'Clínica', 'Clínica'],
    ['11:00', 'Gimnasio', 'Gimnasio'],
    ['13:00', 'Almuerzo', 'Descanso'],
    ['14:00', 'Trabajo remoto / Proyectos', 'Trabajo remoto'],
    ['16:00', 'Negocio', 'Negocio'],
    ['18:00', 'Tiempo personal / Pareja', 'Personal']
  ],
  Domingo: [
    ['08:00', 'Despertar & Desayuno', 'Personal'],
    ['10:00', 'Planificación semanal', 'Personal'],
    ['11:00', 'Tiempo libre & Recuperación', 'Descanso']
  ]
}

schedule.Miércoles = [...schedule.Lunes]
schedule.Viernes = [...schedule.Lunes]
schedule.Jueves = [...schedule.Martes]

export const initialHabits = [
  { id: 'h1', title: 'Levantarse temprano (04:55)', category: 'Personal', frequency: 'Diario', streak: 14, completed: true, history: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'h2', title: 'Gimnasio (Fuerza y movilidad)', category: 'Gimnasio', frequency: '4 días / semana', streak: 7, completed: true, history: [1, 1, 0, 1, 0, 1, 0] },
  { id: 'h3', title: 'Hidratación 2.5L de agua', category: 'Personal', frequency: 'Diario', streak: 9, completed: true, history: [1, 1, 1, 1, 1, 1, 1] },
  { id: 'h4', title: 'Turno Clínica sin retrasos', category: 'Clínica', frequency: '5 días / semana', streak: 5, completed: false, history: [1, 1, 1, 1, 1, 0, 0] },
  { id: 'h5', title: 'Avance Proyecto / Negocio', category: 'Negocio', frequency: '4 días / semana', streak: 3, completed: false, history: [1, 1, 0, 1, 0, 1, 0] },
  { id: 'h6', title: 'Bloque de estudio / Universidad', category: 'Universidad', frequency: '5 días / semana', streak: 11, completed: false, history: [1, 1, 1, 1, 1, 0, 0] }
]

export const getInitialTasks = () => [
  { id: 't1', title: 'Corregir reporte SUNAT y comprobantes', detail: 'Conciliar deducciones fiscales y timbrado de comprobantes del mes.', category: 'Negocio', priority: 'Alta', due: 'Hoy', date: dateKey(), done: false },
  { id: 't2', title: 'Terminar entrega de programación', detail: 'Completar scripts de estructuras de datos y redactar informe técnico.', category: 'Universidad', priority: 'Media', due: 'Hoy', date: dateKey(), done: false },
  { id: 't3', title: 'Revisar contratos y clientes pendientes', detail: 'Auditar cláusulas de confidencialidad y cronograma de entregables.', category: 'Trabajo remoto', priority: 'Normal', due: 'Mañana', date: addDays(1), done: false },
  { id: 't4', title: 'Plan de compras suplementos deportivos', detail: 'Creatina monohidratada, aislado de suero y electrolitos.', category: 'Personal', priority: 'Baja', due: addDays(3), date: addDays(3), done: false }
]

export const initialTasks = getInitialTasks()
