import { createClient } from '@supabase/supabase-js'
// (opcional RN) import 'react-native-url-polyfill/auto'

// En Expo/React Native usa process.env con prefijo EXPO_PUBLIC_
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno: EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Si tienes tipos generados de tu DB:
// import type { Database } from './types_db'
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)