/**
 * Project Configuration for ClinicOps
 *
 * This file contains configuration constants and utilities
 * for the ClinicOps application.
 */

export const config = {
  // App Info
  app: {
    name: 'ClinicOps',
    description: 'Plataforma SaaS completa para gestao de clinicas medicas',
    version: '0.1.0',
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
  },

  // Auth Configuration
  auth: {
    redirects: {
      master: '/dashboard/master',
      admin: '/dashboard/admin',
      user: '/dashboard',
      login: '/auth/login',
      logout: '/',
    },
  },

  // Feature Flags
  features: {
    darkMode: true,
    multiTenant: true,
    analytics: true,
    audit: true,
  },

  // Database
  database: {
    maxConnections: 10,
    queryTimeout: 30000,
  },

  // File Upload
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Validation
  validation: {
    passwordMinLength: 8,
    usernameLengthRange: [3, 50],
    emailMaxLength: 255,
  },

  // Localization
  locale: {
    defaultLocale: 'pt-BR',
    supportedLocales: ['pt-BR', 'en-US'],
  },
}

/**
 * Environment variable validation
 */
export function validateRequiredEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please copy .env.example to .env.local and fill in the values.`
    )
  }
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

/**
 * Check if running in production
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development'
}
