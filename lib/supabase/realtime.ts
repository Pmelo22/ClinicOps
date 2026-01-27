/**
 * Supabase Realtime Utilities
 * Gerenciamento de listeners em tempo real
 */
import { createClient as createBrowserClient } from './client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type RealtimeCallback<T> = (payload: {
  new: T
  old: T
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private supabase = createBrowserClient()

  /**
   * Subscrever a mudanças em uma tabela
   */
  subscribe<T>(
    tableName: string,
    callback: RealtimeCallback<T>,
    filter?: string,
    uniqueKey?: string,
  ): () => void {
    const key = uniqueKey || tableName

    // Remover inscrição anterior se existir
    if (this.channels.has(key)) {
      this.unsubscribe(key)
    }

    const channel = this.supabase
      .channel(key)
      .on<T>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter,
        },
        (payload) => {
          callback(payload as any)
        },
      )
      .subscribe()

    this.channels.set(key, channel)

    // Retornar função para cancelar
    return () => this.unsubscribe(key)
  }

  /**
   * Subscrever apenas a inserts
   */
  subscribeToInserts<T>(
    tableName: string,
    callback: (data: T) => void,
    uniqueKey?: string,
  ): () => void {
    return this.subscribe<T>(
      tableName,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          callback(payload.new)
        }
      },
      undefined,
      uniqueKey,
    )
  }

  /**
   * Subscrever apenas a updates
   */
  subscribeToUpdates<T>(
    tableName: string,
    callback: (data: T) => void,
    filter?: string,
    uniqueKey?: string,
  ): () => void {
    return this.subscribe<T>(
      tableName,
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          callback(payload.new)
        }
      },
      filter,
      uniqueKey,
    )
  }

  /**
   * Subscrever apenas a deletes
   */
  subscribeToDeletes<T>(
    tableName: string,
    callback: (data: T) => void,
    filter?: string,
    uniqueKey?: string,
  ): () => void {
    return this.subscribe<T>(
      tableName,
      (payload) => {
        if (payload.eventType === 'DELETE') {
          callback(payload.old)
        }
      },
      filter,
      uniqueKey,
    )
  }

  /**
   * Cancelar inscrição
   */
  unsubscribe(key: string): void {
    const channel = this.channels.get(key)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(key)
    }
  }

  /**
   * Cancelar todas as inscrições
   */
  unsubscribeAll(): void {
    for (const [key] of this.channels) {
      this.unsubscribe(key)
    }
  }
}

// Instância global
const realtimeManager = new RealtimeManager()

export default realtimeManager
