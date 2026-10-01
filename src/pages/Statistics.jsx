import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import Stat from '../components/dashboard/Stat'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/ui/PageTransition'

const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Statistics() {
  const { data } = useApp()

  // Calcular cumplimiento real por cada día de la semana a partir de data.habits
  const weeklyData = DAYS_SHORT.map((dayLabel, index) => {
    if (!data.habits.length) return { d: dayLabel, v: 0 }
    const doneCount = data.habits.filter(h => h.history?.[index] === 1).length
    const percentage = Math.round((doneCount / data.habits.length) * 100)
    return { d: dayLabel, v: percentage }
  })

  // Tareas completadas vs total
  const totalTasks = data.tasks.length
  const completedTasks = data.tasks.filter(t => t.done).length
  const taskRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Promedio de cumplimiento semanal
  const avgWeeklyRate = weeklyData.length
    ? Math.round(weeklyData.reduce((acc, curr) => acc + curr.v, 0) / weeklyData.length)
    : 0

  // Racha mayor
  const maxStreak = data.habits.length
    ? Math.max(...data.habits.map(h => h.streak || 0))
    : 0

  // Días perfectos (100% en la semana)
  const perfectDays = weeklyData.filter(d => d.v === 100).length

  return (
    <PageTransition>
      <div>
        <p className="eyebrow">Analítica personal de constancia</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Estadísticas</h1>
        <p className="mt-1 text-sm text-muted">
          Visualiza el rendimiento de tus hábitos y la tasa de resolución de objetivos.
        </p>
      </div>

      {/* Métricas Reales */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Cumplimiento Semanal"
          value={`${avgWeeklyRate}%`}
          detail="Promedio en los últimos 7 días"
          color="text-mint"
        />
        <Stat
          label="Mejor Racha"
          value={`${maxStreak} días`}
          detail="Hábito con mayor consistencia"
          color="text-orange"
        />
        <Stat
          label="Días Perfectos"
          value={`${perfectDays} de 7`}
          detail="Días con 100% de hábitos cumplidos"
          color="text-cyan"
        />
        <Stat
          label="Tareas Realizadas"
          value={`${completedTasks}/${totalTasks}`}
          detail={`${taskRate}% de resolución total`}
          color="text-ink"
        />
      </div>

      {/* Gráficos Reales con Recharts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card h-80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <h2 className="font-display text-base font-bold">Progreso de Hábitos por Día</h2>
            <span className="text-xs text-mint font-semibold">% de cumplimiento</span>
          </div>
          <div className="h-60 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="#232738" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Cumplimiento']}
                  contentStyle={{
                    backgroundColor: '#181b26',
                    borderColor: '#232738',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="v" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card h-80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <h2 className="font-display text-base font-bold">Curva de Consistencia</h2>
            <span className="text-xs text-cyan font-semibold">Tendencia diaria</span>
          </div>
          <div className="h-60 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid stroke="#232738" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Consistencia']}
                  contentStyle={{
                    backgroundColor: '#181b26',
                    borderColor: '#232738',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
