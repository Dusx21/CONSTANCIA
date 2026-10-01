import { useRef, useState } from 'react'
import {
  Download,
  RotateCcw,
  Upload,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { storageService } from '../services/storageService'
import { supabaseService } from '../services/supabaseService'
import { Confirm } from '../components/ui/Modal'
import { Field } from '../components/ui/Forms'
import PageTransition from '../components/ui/PageTransition'

export default function Settings() {
  const {
    data,
    update,
    setData,
    flash,
    syncStatus,
    syncError,
    lastSyncTime,
    manualSync,
    configureSupabase,
    supabaseConfig
  } = useApp()

  const [resetModal, setResetModal] = useState(false)
  const fileInputRef = useRef()

  // Estado del formulario de Supabase
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '')
  const [sbKey, setSbKey] = useState(supabaseConfig.key || '')
  const [sbUser, setSbUser] = useState(supabaseConfig.userId || 'default_user')
  const [isTesting, setIsTesting] = useState(false)
  const [showSql, setShowSql] = useState(false)

  // Exportar respaldo JSON
  const handleExport = () => {
    const blob = new Blob([storageService.export()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `constancia-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('Copia de seguridad descargada con éxito')
  }

  // Importar respaldo JSON
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = storageService.import(reader.result)
        setData(imported)
        flash('Datos restaurados correctamente')
      } catch (err) {
        flash('El archivo no es un respaldo válido de Constancia')
      }
    }
    reader.readAsText(file)
  }

  // Guardar y probar configuración de Supabase
  const handleSaveSupabase = async () => {
    setIsTesting(true)
    await configureSupabase(sbUrl.trim(), sbKey.trim(), sbUser.trim() || 'default_user')
    setIsTesting(false)
  }

  // Copiar SQL al portapapeles
  const copySql = () => {
    navigator.clipboard.writeText(supabaseService.getSqlScript())
    flash('Script SQL copiado al portapapeles')
  }

  return (
    <PageTransition className="max-w-3xl">
      <div>
        <p className="eyebrow">Ajustes & Sincronización</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted">
          Administra tu perfil, la sincronización en nube con Supabase y tus respaldos.
        </p>
      </div>

      {/* Perfil */}
      <section className="card mt-6">
        <h2 className="font-display text-xl font-bold">Perfil del Usuario</h2>
        <div className="mt-4 space-y-4">
          <Field label="Nombre que aparece en la aplicación">
            <input
              className="input"
              value={data.settings.name || ''}
              onChange={(e) =>
                update('settings', { ...data.settings, name: e.target.value })
              }
              placeholder="Tu nombre..."
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="block text-sm font-semibold">Notificaciones locales</span>
              <span className="text-xs text-muted">
                Recordatorios de hábitos y rutinas en este navegador.
              </span>
            </div>
            <button
              onClick={() =>
                update('settings', {
                  ...data.settings,
                  notifications: !data.settings.notifications
                })
              }
              className={`h-7 w-12 rounded-full p-1 transition ${
                data.settings.notifications ? 'bg-emerald' : 'bg-inset'
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition ${
                  data.settings.notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Sincronización en la Nube con Supabase */}
      <section className="card mt-6 border-emerald/30 bg-gradient-to-b from-surface to-elevated/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="text-mint" size={22} />
              <h2 className="font-display text-xl font-bold">Sincronización en la Nube (Supabase)</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              Sincroniza tus hábitos y tareas entre tu PC y tu celular en tiempo real sin perder datos.
            </p>
          </div>

          <div className="shrink-0">
            {syncStatus === 'synced' ? (
              <span className="chip bg-emerald/20 text-mint font-semibold">
                <CheckCircle2 size={13} /> Conectado
              </span>
            ) : syncStatus === 'error' ? (
              <span className="chip bg-red-500/20 text-red-400 font-semibold">
                <AlertCircle size={13} /> Error
              </span>
            ) : (
              <span className="chip bg-elevated text-slate-400">Modo Local</span>
            )}
          </div>
        </div>

        {syncError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <b>Aviso de sincronización:</b> {syncError}
          </div>
        )}

        {lastSyncTime && (
          <p className="mt-3 text-xs text-mint">
            Última sincronización: {new Date(lastSyncTime).toLocaleTimeString('es-PE')}
          </p>
        )}

        <div className="mt-5 space-y-4">
          <Field label="Supabase Project URL">
            <input
              className="input font-mono text-xs"
              placeholder="https://tu-proyecto.supabase.co"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
            />
          </Field>

          <Field label="Supabase Anon Public Key">
            <input
              type="password"
              className="input font-mono text-xs"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
            />
          </Field>

          <Field label="ID de Usuario o Alias Personal">
            <input
              className="input text-xs"
              placeholder="ej: sebastian o mi_espacio"
              value={sbUser}
              onChange={(e) => setSbUser(e.target.value)}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveSupabase}
              disabled={isTesting}
              className="primary-btn flex-1 sm:flex-none shadow-glow"
            >
              {isTesting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Conectando...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Guardar & Conectar
                </>
              )}
            </button>

            {supabaseService.isConfigured() && (
              <button
                onClick={manualSync}
                className="icon-btn w-auto px-4 text-xs font-semibold text-mint hover:bg-emerald/10"
              >
                <RefreshCw size={15} /> Sincronizar Ahora
              </button>
            )}

            <button
              onClick={() => setShowSql(!showSql)}
              className="icon-btn w-auto px-3 text-xs text-muted hover:text-ink ml-auto"
            >
              {showSql ? 'Ocultar SQL' : 'Ver Script SQL de Supabase'}
            </button>
          </div>

          {/* Script SQL desplegable */}
          {showSql && (
            <div className="mt-4 rounded-xl border border-line bg-black/50 p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-mint">
                  Copia y ejecuta esto en el SQL Editor de Supabase:
                </span>
                <button
                  onClick={copySql}
                  className="rounded-lg bg-elevated px-2.5 py-1 text-[11px] font-semibold text-ink hover:text-mint flex items-center gap-1 border border-line"
                >
                  <Copy size={13} /> Copiar
                </button>
              </div>
              <pre className="overflow-x-auto text-slate-300 font-mono text-[11px] leading-relaxed p-2 bg-surface rounded-lg">
                {supabaseService.getSqlScript()}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Respaldo de Datos Local */}
      <section className="card mt-6">
        <h2 className="font-display text-xl font-bold">Respaldo Manual de Datos</h2>
        <p className="mt-1 text-sm text-muted">
          Descarga un archivo JSON de respaldo o restaura tu información en cualquier momento.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={handleExport} className="primary-btn">
            <Download size={17} /> Exportar Respaldo JSON
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="icon-btn w-auto px-4 text-xs font-semibold"
          >
            <Upload size={17} /> Importar Respaldo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />

          <button
            onClick={() => setResetModal(true)}
            className="icon-btn w-auto px-4 text-xs font-semibold text-red-400 hover:border-red-500 ml-auto"
          >
            <RotateCcw size={17} /> Restablecer Fábrica
          </button>
        </div>
      </section>

      <Confirm
        open={resetModal}
        onClose={() => setResetModal(false)}
        title="¿Restablecer datos iniciales?"
        text="Se restaurarán los hábitos, tareas y configuración iniciales. Esta acción borrará los datos actuales."
        onConfirm={() => {
          setData(storageService.reset())
          setResetModal(false)
          flash('Datos restaurados de fábrica')
        }}
      />
    </PageTransition>
  )
}
