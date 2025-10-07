// backend/test-connection.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key starts with:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing');
console.log('Key length:', supabaseKey?.length || 0);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Test the connection
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testing connection to Supabase...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === 'PGRST116') {
        console.log('💡 Table doesnt exist, but connection is working!');
      } else if (error.message.includes('fetch failed')) {
        console.log('🔧 Solutions:');
        console.log('1. Check your Supabase URL and Key are correct');
        console.log('2. Ensure your Supabase project is active');
        console.log('3. Check your internet connection');
        console.log('4. Verify the Supabase service is up');
      }
    } else {
      console.log('✅ Connection successful!');
    }
  } catch (error) {
    console.error('🚨 Connection test crashed:', error.message);
  }
}

testConnection();