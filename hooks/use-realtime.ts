'use client'

/**
 * Hook para dados com realtime
 * Busca dados e subscreve a mudanças em tempo real
 */
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import realtimeManager from '@/lib/supabase/realtime'

export type UseRealtimeOptions = {
  table: string
  select?: string
  filter?: string
  realtime?: boolean
  realtimeFilter?: string
}

export function useRealtime<T>(options: UseRealtimeOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  // Buscar dados iniciais
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        let query = supabase.from(options.table).select(options.select || '*')

        if (options.filter) {
          query = query.textSearch('fts', options.filter)
        }

        const { data: result, error: err } = await query

        if (err) throw err

        setData(result as T[])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [options.table, options.select, options.filter, supabase])

  // Subscrever a mudanças em tempo real
  useEffect(() => {
    if (!options.realtime) return

    const unsubscribe = realtimeManager.subscribe<T>(
      options.table,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setData((prev) => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setData((prev) =>
            prev.map((item) => {
              // Assumindo que T tem um campo 'id'
              if ((item as any).id === (payload.new as any).id) {
                return payload.new
              }
              return item
            }),
          )
        } else if (payload.eventType === 'DELETE') {
          setData((prev) =>
            prev.filter((item) => (item as any).id !== (payload.old as any).id),
          )
        }
      },
      options.realtimeFilter,
    )

    return unsubscribe
  }, [options.table, options.realtime, options.realtimeFilter])

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase.from(options.table).select(options.select || '*')

      if (options.filter) {
        query = query.textSearch('fts', options.filter)
      }

      const { data: result, error: err } = await query

      if (err) throw err

      setData(result as T[])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }, [options.table, options.select, options.filter, supabase])

  return { data, loading, error, refetch }
}
