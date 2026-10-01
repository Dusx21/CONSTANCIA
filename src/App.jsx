import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppLayout from './layouts/AppLayout'
import Toast from './components/ui/Toast'
import Dashboard from './pages/Dashboard'
import Today from './pages/Today'
import Calendar from './pages/Calendar'
import Habits from './pages/Habits'
import Schedule from './pages/Schedule'
import Tasks from './pages/Tasks'
import Statistics from './pages/Statistics'
import Review from './pages/Review'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import More from './pages/More'

export default function App() {
  const location = useLocation()

  return (
    <AppLayout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/review" element={<Review />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/more" element={<More />} />
        </Routes>
      </AnimatePresence>
      <Toast />
    </AppLayout>
  )
}
