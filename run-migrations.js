// Quick script to run SQL migrations
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  
  // New migrations to run
  const migrations = [
    '20260221000001_gamification.sql',
    '20260221000002_notifications.sql',
    '20260221000003_family_sharing.sql',
    '20260221000004_chat_history.sql'
  ];

  console.log('🚀 Running SQL Migrations...\n');

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${migration} (not found)`);
      continue;
    }

    console.log(`📊 Running: ${migration}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
      
      if (error) {
        console.error(`❌ Error in ${migration}:`, error.message);
      } else {
        console.log(`✅ Success: ${migration}\n`);
      }
    } catch (err) {
      console.error(`❌ Failed to run ${migration}:`, err.message);
    }
  }

  console.log('\n🎉 Migrations completed!');
}

runMigrations().catch(console.error);
