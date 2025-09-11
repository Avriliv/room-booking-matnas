// Create test user using Supabase Admin API
// Run this with: node create_test_user_api.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('Creating test user...')
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        display_name: 'משתמש בדיקה'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'test@example.com',
        display_name: 'משתמש בדיקה',
        role: 'user',
        active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('Profile created:', profileData)
    console.log('✅ Test user created successfully!')
    console.log('User ID:', authData.user.id)
    console.log('Email:', 'test@example.com')
    console.log('Password:', 'test123456')

  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUser()
