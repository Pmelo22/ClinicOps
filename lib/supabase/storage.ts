/**
 * Supabase Storage Service
 * Gerenciamento centralizado de arquivos
 */
import { createClient } from './server'

export type StorageFile = {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: Record<string, any>
}

const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  ATTACHMENTS: 'attachments',
  AVATARS: 'avatars',
  REPORTS: 'reports',
} as const

/**
 * Upload de arquivo
 */
export async function uploadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string,
  file: File,
  metadata?: Record<string, any>,
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      metadata,
      upsert: false,
    })

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  return data
}

/**
 * Download de arquivo
 */
export async function downloadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string,
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath)

  if (error) {
    throw new Error(`Erro ao fazer download: ${error.message}`)
  }

  return data
}

/**
 * Obter URL pública do arquivo
 */
export async function getPublicUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string,
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Obter URL assinada (temporária) do arquivo
 */
export async function getSignedUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string,
  expiresIn: number = 3600, // 1 hora por padrão
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(`Erro ao gerar URL assinada: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Deletar arquivo
 */
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string,
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  if (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`)
  }
}

/**
 * Listar arquivos
 */
export async function listFiles(
  bucket: keyof typeof STORAGE_BUCKETS,
  path?: string,
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (error) {
    throw new Error(`Erro ao listar arquivos: ${error.message}`)
  }

  return data
}

/**
 * Mover/Renomear arquivo
 */
export async function moveFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  oldPath: string,
  newPath: string,
) {
  const supabase = await createClient()

  const bucketName = STORAGE_BUCKETS[bucket]

  // Fazer download do arquivo
  const file = await downloadFile(bucket, oldPath)

  // Upload para novo local
  await uploadFile(bucket, newPath, new File([file], newPath))

  // Deletar arquivo antigo
  await deleteFile(bucket, oldPath)
}

/**
 * Gerar caminho único para arquivo
 */
export function generateStoragePath(
  clinicaId: string,
  folder: string,
  fileName: string,
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const uniqueName = `${timestamp}-${random}-${fileName}`
  return `${clinicaId}/${folder}/${uniqueName}`
}

/**
 * Extrair metadados do arquivo
 */
export function getFileMetadata(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }
}
