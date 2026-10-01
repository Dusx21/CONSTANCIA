import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { storageService, isMockData } from '../services/storageService'
import {
  supabaseService,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig
} from '../services/supabaseService'
import { dateKey } from '../utils/date'

const AppContext = createContext()

export function getTimeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const initial = storageService.get()
    return isMockData(initial) ? storageService.reset() : initial
  })
  const [toast, setToast] = useState('')
  const [syncStatus, setSyncStatus] = useState('local') // 'local' | 'syncing' | 'synced' | 'error'
  const [syncError, setSyncError] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [authUser, setAuthUser] = useState(null)

  const isInitialMount = useRef(true)
  const syncTimeoutRef = useRef(null)

  // Nombre calculado del usuario en orden de prioridad:
  // 1. Nombre en metadata de Supabase Auth
  // 2. Nombre en configuración de la app
  // 3. Email de Supabase Auth
  // 4. 'Usuario'
  const displayName =
    authUser?.user_metadata?.full_name ||
    data?.settings?.name?.trim() ||
    (authUser?.email ? authUser.email.split('@')[0] : '') ||
    'Usuario'

  // Guardar en localStorage inmediatamente en cada cambio
  useEffect(() => {
    storageService.save(data)

    // Si Supabase está configurado, sincronizar con debounce (800ms)
    if (!isInitialMount.current && supabaseService.isConfigured()) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      setSyncStatus('syncing')
      syncTimeoutRef.current = setTimeout(async () => {
        const res = await supabaseService.pushRemoteData(data, authUser?.id)
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
  }, [data, authUser])

  // Carga inicial y escucha de sesión en Supabase
  useEffect(() => {
    let subscription = null

    async function init() {
      // 1. Verificar si hay usuario autenticado en Supabase
      if (supabaseService.isConfigured()) {
        const user = await supabaseService.getCurrentUser()
        setAuthUser(user)

        // Escuchar cambios de sesión
        const sub = supabaseService.onAuthStateChange(async (event, session) => {
          const nextUser = session?.user || null
          setAuthUser(nextUser)
          if (nextUser?.id) {
            setSyncStatus('syncing')
            const cloudRes = await supabaseService.fetchRemoteData(nextUser.id)
            if (cloudRes.data) {
              if (isMockData(cloudRes.data)) {
                const clean = storageService.reset()
                setData(clean)
                await supabaseService.pushRemoteData(clean, nextUser.id)
              } else {
                setData(cloudRes.data)
                storageService.save(cloudRes.data)
              }
            }
            setSyncStatus('synced')
          }
        })
        subscription = sub

        // 2. Traer datos remotos ligados al user_id actual
        setSyncStatus('syncing')
        const remote = await supabaseService.fetchRemoteData(user?.id)
        if (remote.data) {
          if (isMockData(remote.data)) {
            // Datos antiguos de prueba en Supabase: los purga y guarda el estado limpio en la nube
            const clean = storageService.reset()
            setData(clean)
            await supabaseService.pushRemoteData(clean, user?.id)
            setSyncStatus('synced')
            setLastSyncTime(new Date())
          } else {
            setData(remote.data)
            storageService.save(remote.data)
            setSyncStatus('synced')
            setLastSyncTime(new Date(remote.updatedAt || Date.now()))
          }
        } else if (!remote.error) {
          // No había datos aún en la nube para este usuario: subimos los datos limpios iniciales
          const pushRes = await supabaseService.pushRemoteData(data, user?.id)
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

    init()

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
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
    const res = await supabaseService.pushRemoteData(data, authUser?.id)
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
        supabaseConfig: getStoredSupabaseConfig(),
        authUser,
        displayName,
        timeGreeting: getTimeGreeting()
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
