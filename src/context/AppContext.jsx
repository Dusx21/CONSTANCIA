import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { storageService } from '../services/storageService'
import { supabaseService, getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../services/supabaseService'
import { dateKey } from '../utils/date'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [data, setData] = useState(() => storageService.get())
  const [toast, setToast] = useState('')
  const [syncStatus, setSyncStatus] = useState('local') // 'local' | 'syncing' | 'synced' | 'error'
  const [syncError, setSyncError] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  
  const isInitialMount = useRef(true)
  const syncTimeoutRef = useRef(null)

  // Guardar en localStorage siempre que cambie la data
  useEffect(() => {
    storageService.save(data)

    // Si Supabase está configurado, sincronizar con debounce (800ms)
    if (!isInitialMount.current && supabaseService.isConfigured()) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      setSyncStatus('syncing')
      syncTimeoutRef.current = setTimeout(async () => {
        const res = await supabaseService.pushRemoteData(data)
        if (res.success) {
          setSyncStatus('synced')
          setLastSyncTime(new Date())
          setSyncError(null)
        } else {
          setSyncStatus('error')
          setSyncError(res.error)
        }
      }, 800)
    }
  }, [data])

  // Carga inicial y verificación de nube
  useEffect(() => {
    async function initCloudSync() {
      if (supabaseService.isConfigured()) {
        setSyncStatus('syncing')
        const remote = await supabaseService.fetchRemoteData()
        if (remote.data) {
          // Si hay datos remotos, los adoptamos
          setData(remote.data)
          storageService.save(remote.data)
          setSyncStatus('synced')
          setLastSyncTime(new Date(remote.updatedAt || Date.now()))
        } else if (!remote.error) {
          // No había datos aún en nube: subimos los locales
          const pushRes = await supabaseService.pushRemoteData(data)
          if (pushRes.success) {
            setSyncStatus('synced')
            setLastSyncTime(new Date())
          } else {
            setSyncStatus('error')
            setSyncError(pushRes.error)
          }
        } else {
          setSyncStatus('error')
          setSyncError(remote.error)
        }
      } else {
        setSyncStatus('local')
      }
      isInitialMount.current = false
    }

    initCloudSync()
  }, [])

  const flash = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2800)
  }

  const update = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const setDaily = (kind, id, value, date = dateKey()) => {
    setData((prev) => {
      const currentDay = prev.daily?.[date] || {}
      const currentKind = currentDay[kind] || {}
      return {
        ...prev,
        daily: {
          ...prev.daily,
          [date]: {
            ...currentDay,
            [kind]: {
              ...currentKind,
              [id]: value
            }
          }
        }
      }
    })
  }

  const dailyValue = (kind, id, date = dateKey()) => {
    return data.daily?.[date]?.[kind]?.[id]
  }

  const manualSync = async () => {
    if (!supabaseService.isConfigured()) {
      flash('Configura Supabase en Configuración para activar la sincronización.')
      return
    }
    setSyncStatus('syncing')
    const res = await supabaseService.pushRemoteData(data)
    if (res.success) {
      setSyncStatus('synced')
      setLastSyncTime(new Date())
      flash('Datos sincronizados con Supabase correctamente')
    } else {
      setSyncStatus('error')
      setSyncError(res.error)
      flash('Error al sincronizar: ' + (res.error || 'Revisa la conexión'))
    }
  }

  const configureSupabase = async (url, key, userId) => {
    saveStoredSupabaseConfig({ url, key, userId })
    if (!url || !key) {
      setSyncStatus('local')
      flash('Sincronización en la nube desactivada')
      return { ok: true }
    }
    const test = await supabaseService.testConnection(url, key)
    if (test.ok) {
      setSyncStatus('syncing')
      await manualSync()
      flash('¡Supabase conectado y sincronizado con éxito!')
      return { ok: true }
    } else {
      setSyncStatus('error')
      setSyncError(test.error)
      flash('Error al conectar: ' + test.error)
      return { ok: false, error: test.error }
    }
  }

  return (
    <AppContext.Provider
      value={{
        data,
        update,
        setData,
        setDaily,
        dailyValue,
        flash,
        toast,
        syncStatus,
        syncError,
        lastSyncTime,
        manualSync,
        configureSupabase,
        supabaseConfig: getStoredSupabaseConfig()
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
