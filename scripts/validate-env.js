#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const requiredEnvVarsServer = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'POSTGRES_URL',
]

// Check .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found!')
  console.error('   Please create a .env.local file with the required environment variables.')
  console.error('   You can use .env.example as a template.')
  process.exit(1)
}

// Load .env.local
const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8')
const envVars = Object.fromEntries(
  envLocalContent
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('='))
    .filter(([key]) => key)
)

// Check required environment variables
const missingVars = [
  ...requiredEnvVars,
  ...requiredEnvVarsServer,
].filter((varName) => !envVars[varName] && !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  process.exit(1)
}

console.log('✅ All required environment variables are set!')
