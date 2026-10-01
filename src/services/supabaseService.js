import { createClient } from '@supabase/supabase-js'

const SUPABASE_CONFIG_KEY = 'constancia_supabase_config'

export function cleanSupabaseUrl(url) {
  if (!url) return ''
  let cleaned = url.trim().replace(/\/+$/, '')
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '')
  return cleaned
}

export function getStoredSupabaseConfig() {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...parsed, url: cleanSupabaseUrl(parsed.url) }
    }
  } catch {}
  return {
    url: cleanSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || ''),
    key: (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim(),
    userId: 'default_user'
  }
}

export function saveStoredSupabaseConfig(config) {
  const sanitized = {
    ...config,
    url: cleanSupabaseUrl(config.url),
    key: (config.key || '').trim()
  }
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(sanitized))
  cachedClient = null
}

let cachedClient = null

export function getSupabaseClient() {
  if (cachedClient) return cachedClient
  const config = getStoredSupabaseConfig()
  const url = cleanSupabaseUrl(config.url)
  if (url && config.key) {
    try {
      cachedClient = createClient(url, config.key, {
        auth: { persistSession: true, autoRefreshToken: true }
      })
      return cachedClient
    } catch (e) {
      console.error('Error al inicializar cliente Supabase:', e)
      return null
    }
  }
  return null
}

export const supabaseService = {
  isConfigured: () => {
    const config = getStoredSupabaseConfig()
    return Boolean(config.url && config.key)
  },

  async testConnection(url, key) {
    try {
      const client = createClient(url, key)
      const { data, error } = await client
        .from('constancia_data')
        .select('id')
        .limit(1)
      if (error && error.code !== 'PGRST116') {
        // Si el error es de tabla inexistente (42P01), la conexión fue exitosa pero falta la tabla
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return { ok: false, error: 'Conexión exitosa, pero la tabla "constancia_data" no existe aún en Supabase. Corre el script SQL.' }
        }
        return { ok: false, error: error.message }
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message || 'Error de red al conectar con Supabase.' }
    }
  },

  async fetchRemoteData() {
    const client = getSupabaseClient()
    if (!client) return { error: 'Supabase no está configurado.' }
    const config = getStoredSupabaseConfig()
    const recordId = config.userId || 'default_user'

    try {
      const { data, error } = await client
        .from('constancia_data')
        .select('*')
        .eq('id', recordId)
        .maybeSingle()

      if (error) throw error
      if (!data) return { data: null } // No hay datos aún
      return { data: data.data, updatedAt: data.updated_at }
    } catch (err) {
      console.warn('Error al obtener datos remotos de Supabase:', err)
      return { error: err.message }
    }
  },

  async pushRemoteData(appData) {
    const client = getSupabaseClient()
    if (!client) return { error: 'Supabase no está configurado.' }
    const config = getStoredSupabaseConfig()
    const recordId = config.userId || 'default_user'

    try {
      const payload = {
        id: recordId,
        data: appData,
        updated_at: new Date().toISOString()
      }
      const { error } = await client
        .from('constancia_data')
        .upsert(payload, { onConflict: 'id' })

      if (error) throw error
      return { success: true }
    } catch (err) {
      console.warn('Error al guardar datos en Supabase:', err)
      return { error: err.message }
    }
  },

  getSqlScript() {
    return `-- Script para ejecutar en Supabase (SQL Editor)
-- 1. Crear tabla de persistencia para CONSTANCIA
create table if not exists public.constancia_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar seguridad por fila (RLS)
alter table public.constancia_data enable row level security;

-- 3. Crear política para permitir lectura y escritura mediante anon key
drop policy if exists "Permitir acceso publico constancia" on public.constancia_data;
create policy "Permitir acceso publico constancia"
  on public.constancia_data
  for all
  using (true)
  with check (true);
`
  }
}
