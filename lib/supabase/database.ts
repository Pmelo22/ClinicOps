/**
 * Supabase Database Utilities
 * Operações de banco de dados centralizadas
 */
import { createClient } from './server'

export type DatabaseError = {
  message: string
  code?: string
  details?: string
}

export type PaginationOptions = {
  page: number
  pageSize: number
}

export type SortOptions = {
  column: string
  ascending?: boolean
}

/**
 * Buscar registros com filtros
 */
export async function fetchRecords<T>(
  table: string,
  options?: {
    select?: string
    filters?: Array<{ column: string; operator: string; value: any }>
    sort?: SortOptions
    pagination?: PaginationOptions
    limit?: number
  },
): Promise<T[]> {
  const supabase = await createClient()

  let query = supabase.from(table).select(options?.select || '*')

  // Aplicar filtros
  if (options?.filters) {
    for (const filter of options.filters) {
      const { column, operator, value } = filter
      // @ts-ignore
      query = query[operator](column, value)
    }
  }

  // Aplicar ordenação
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending !== false,
    })
  }

  // Aplicar paginação
  if (options?.pagination) {
    const offset = (options.pagination.page - 1) * options.pagination.pageSize
    query = query.range(offset, offset + options.pagination.pageSize - 1)
  } else if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar registros: ${error.message}`)
  }

  return data as T[]
}

/**
 * Buscar um único registro
 */
export async function fetchRecord<T>(
  table: string,
  id: string,
  select?: string,
): Promise<T | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(table)
    .select(select || '*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Registro não encontrado
    }
    throw new Error(`Erro ao buscar registro: ${error.message}`)
  }

  return data as T
}

/**
 * Criar registro
 */
export async function createRecord<T>(
  table: string,
  data: Omit<T, 'id' | 'created_at'>,
): Promise<T> {
  const supabase = await createClient()

  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar registro: ${error.message}`)
  }

  return result as T
}

/**
 * Criar múltiplos registros
 */
export async function createRecords<T>(
  table: string,
  items: Array<Omit<T, 'id' | 'created_at'>>,
): Promise<T[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(table)
    .insert(items)
    .select()

  if (error) {
    throw new Error(`Erro ao criar registros: ${error.message}`)
  }

  return data as T[]
}

/**
 * Atualizar registro
 */
export async function updateRecord<T>(
  table: string,
  id: string,
  updates: Partial<T>,
): Promise<T> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar registro: ${error.message}`)
  }

  return data as T
}

/**
 * Atualizar múltiplos registros
 */
export async function updateRecords<T>(
  table: string,
  updates: Partial<T>,
  filters: Array<{ column: string; operator: string; value: any }>,
): Promise<T[]> {
  const supabase = await createClient()

  let query = supabase.from(table).update(updates)

  for (const filter of filters) {
    const { column, operator, value } = filter
    // @ts-ignore
    query = query[operator](column, value)
  }

  const { data, error } = await query.select()

  if (error) {
    throw new Error(`Erro ao atualizar registros: ${error.message}`)
  }

  return data as T[]
}

/**
 * Deletar registro
 */
export async function deleteRecord(
  table: string,
  id: string,
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar registro: ${error.message}`)
  }
}

/**
 * Deletar múltiplos registros
 */
export async function deleteRecords(
  table: string,
  filters: Array<{ column: string; operator: string; value: any }>,
): Promise<void> {
  const supabase = await createClient()

  let query = supabase.from(table).delete()

  for (const filter of filters) {
    const { column, operator, value } = filter
    // @ts-ignore
    query = query[operator](column, value)
  }

  const { error } = await query

  if (error) {
    throw new Error(`Erro ao deletar registros: ${error.message}`)
  }
}

/**
 * Contar registros
 */
export async function countRecords(
  table: string,
  filters?: Array<{ column: string; operator: string; value: any }>,
): Promise<number> {
  const supabase = await createClient()

  let query = supabase.from(table).select('id', { count: 'exact', head: true })

  if (filters) {
    for (const filter of filters) {
      const { column, operator, value } = filter
      // @ts-ignore
      query = query[operator](column, value)
    }
  }

  const { count, error } = await query

  if (error) {
    throw new Error(`Erro ao contar registros: ${error.message}`)
  }

  return count || 0
}

/**
 * Buscar com busca full-text (se configurado no banco)
 */
export async function searchRecords<T>(
  table: string,
  searchColumn: string,
  searchTerm: string,
  options?: {
    select?: string
    limit?: number
  },
): Promise<T[]> {
  const supabase = await createClient()

  let query = supabase
    .from(table)
    .select(options?.select || '*')
    .ilike(searchColumn, `%${searchTerm}%`)

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar registros: ${error.message}`)
  }

  return data as T[]
}

/**
 * Chamada a função RPC
 */
export async function callFunction<T>(
  functionName: string,
  params?: Record<string, any>,
): Promise<T> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc(functionName, params)

  if (error) {
    throw new Error(`Erro ao chamar função: ${error.message}`)
  }

  return data as T
}
