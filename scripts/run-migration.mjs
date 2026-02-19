#!/usr/bin/env node

/**
 * Run Supabase Migration
 * This script executes the advanced features migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tzhhilhiheekhcpdexdc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.log('\n📝 To run this script, you need the Supabase Service Role Key:');
  console.log('1. Go to: https://supabase.com/dashboard/project/tzhhilhiheekhcpdexdc/settings/api');
  console.log('2. Copy the "service_role" key');
  console.log('3. Run: SUPABASE_SERVICE_KEY=your-key-here node scripts/run-migration.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('🚀 Starting migration...\n');
  
  try {
    // Read migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20260220000000_advanced_features.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded');
    console.log(`📏 Size: ${(sql.length / 1024).toFixed(2)} KB`);
    console.log('⏳ Executing SQL...\n');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Created tables:');
    console.log('  - institutional_accounts');
    console.log('  - recurring_transactions');
    console.log('  - savings_goals');
    console.log('  - savings_contributions');
    console.log('  - open_banking_connections');
    console.log('  - sync_history');
    console.log('  - financial_insights');
    console.log('  - user_settings');
    console.log('  - merchants');
    console.log('\n🎉 Database is ready for advanced features!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
