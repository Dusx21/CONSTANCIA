export const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const shortWeekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
export const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const dateKey = (date = new Date()) => {
  if (typeof date === 'string') {
    // Si ya viene como YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    date = new Date(date)
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(date)
}

export const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

export const weekday = (date = new Date()) => {
  const d = typeof date === 'string' ? parseDateKey(date) : date
  return weekdays[d.getDay()]
}

export const formatLongDate = (date = new Date()) => {
  const d = typeof date === 'string' ? parseDateKey(date) : date
  const formatted = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Lima'
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export const formatMonthYear = (year, monthIndex) => {
  return `${monthNames[monthIndex]} ${year}`
}

export const isToday = (value) => value === dateKey()

export const addDays = (days, baseDate = null) => {
  const base = baseDate ? parseDateKey(baseDate) : parseDateKey(dateKey())
  base.setDate(base.getDate() + days)
  return dateKey(base)
}

export const taskScope = (task) => {
  if (task.done) return 'Completadas'
  if (!task.date || isToday(task.date)) return 'Hoy'
  if (task.date < dateKey()) return 'Atrasadas'
  return 'Próximas'
}

/**
 * Genera la cuadrícula de días para el calendario mensual (lunes a domingo).
 */
export const getMonthGrid = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  
  // En JS: 0=Domingo, 1=Lunes, ..., 6=Sábado. Convertimos para que Lunes sea 0 y Domingo 6
  let startDayOfWeek = firstDay.getDay() - 1
  if (startDayOfWeek === -1) startDayOfWeek = 6

  const totalDays = lastDay.getDate()
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate()

  const grid = []

  // Días del mes previo
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1
    const prevYear = monthIndex === 0 ? year - 1 : year
    const mStr = String(prevMonth + 1).padStart(2, '0')
    const dStr = String(d).padStart(2, '0')
    const key = `${prevYear}-${mStr}-${dStr}`
    grid.push({ dayNumber: d, dateKey: key, isCurrentMonth: false, isToday: isToday(key) })
  }

  // Días del mes actual
  for (let d = 1; d <= totalDays; d++) {
    const mStr = String(monthIndex + 1).padStart(2, '0')
    const dStr = String(d).padStart(2, '0')
    const key = `${year}-${mStr}-${dStr}`
    grid.push({ dayNumber: d, dateKey: key, isCurrentMonth: true, isToday: isToday(key) })
  }

  // Días del mes siguiente para completar múltiplos de 7 (mínimo 35 celdas)
  const remaining = 7 - (grid.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1
      const nextYear = monthIndex === 11 ? year + 1 : year
      const mStr = String(nextMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      const key = `${nextYear}-${mStr}-${dStr}`
      grid.push({ dayNumber: d, dateKey: key, isCurrentMonth: false, isToday: isToday(key) })
    }
  }

  return grid
}

/**
 * Obtiene los 7 días de la semana (Lunes a Domingo) que contienen la fecha dada.
 */
export const getWeekDays = (baseKey = dateKey()) => {
  const d = parseDateKey(baseKey)
  let dayOfWeek = d.getDay() - 1
  if (dayOfWeek === -1) dayOfWeek = 6
  
  const monday = new Date(d)
  monday.setDate(monday.getDate() - dayOfWeek)

  const days = []
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday)
    current.setDate(current.getDate() + i)
    const key = dateKey(current)
    days.push({
      dateKey: key,
      dayName: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i],
      shortName: shortWeekdays[i],
      dayNumber: current.getDate(),
      isToday: isToday(key)
    })
  }
  return days
}
