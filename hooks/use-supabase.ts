'use client'

/**
 * Hook para operações de banco de dados
 */
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UseSupabaseOptions = {
  table: string
}

export function useSupabase<T>(options: UseSupabaseOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchOne = useCallback(
    async (id: string, select?: string): Promise<T | null> => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from(options.table)
          .select(select || '*')
          .eq('id', id)
          .single()

        if (err) throw err

        setError(null)
        return data as T
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options.table, supabase],
  )

  const fetchAll = useCallback(
    async (select?: string, filters?: Array<any>): Promise<T[]> => {
      try {
        setLoading(true)
        let query = supabase.from(options.table).select(select || '*')

        if (filters) {
          for (const filter of filters) {
            const { column, operator, value } = filter
            // @ts-ignore
            query = query[operator](column, value)
          }
        }

        const { data, error: err } = await query

        if (err) throw err

        setError(null)
        return data as T[]
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options.table, supabase],
  )

  const create = useCallback(
    async (item: Omit<T, 'id' | 'created_at'>): Promise<T> => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from(options.table)
          .insert([item])
          .select()
          .single()

        if (err) throw err

        setError(null)
        return data as T
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options.table, supabase],
  )

  const update = useCallback(
    async (id: string, updates: Partial<T>): Promise<T> => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from(options.table)
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (err) throw err

        setError(null)
        return data as T
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options.table, supabase],
  )

  const delete_ = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true)
        const { error: err } = await supabase
          .from(options.table)
          .delete()
          .eq('id', id)

        if (err) throw err

        setError(null)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options.table, supabase],
  )

  return {
    loading,
    error,
    fetchOne,
    fetchAll,
    create,
    update,
    delete: delete_,
  }
}
