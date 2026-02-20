import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Pepper Sync Transactions
 * 
 * מסנכרן תנועות מהבנק דרך Pepper API
 * מעדכן את מסד הנתונים עם תנועות חדשות
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { connectionId, accountId } = req.body;

  if (!connectionId) {
    return res.status(400).json({ error: 'Connection ID required' });
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // קריאת החיבור
    const { data: connection } = await supabase
      .from('open_banking_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (!connection || connection.connection_status !== 'active') {
      throw new Error('Connection not active');
    }

    // בדיקת תוקף token
    const expiresAt = new Date(connection.token_expires_at);
    if (expiresAt <= new Date()) {
      // צריך לרענן token קודם
      await fetch(`${process.env.VITE_APP_URL}/api/auth/pepper/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      
      // קריאה מחדש של החיבור עם token מעודכן
      const { data: refreshedConnection } = await supabase
        .from('open_banking_connections')
        .select('*')
        .eq('id', connectionId)
        .single();
      
      connection.access_token = refreshedConnection.access_token;
    }

    // קריאה לחשבונות (אם לא צוין חשבון ספציפי)
    let accountsToSync = [];
    
    if (accountId) {
      accountsToSync = [{ id: accountId }];
    } else {
      // קבלת כל החשבונות מ-Pepper
      const accountsResponse = await fetch('https://api.pepper.co.il/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const accountsData = await accountsResponse.json();
      accountsToSync = accountsData.accounts || [];
    }

    let totalTransactions = 0;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 יום אחורה

    // סנכרון תנועות לכל חשבון
    for (const account of accountsToSync) {
      // קבלת תנועות מ-Pepper
      const transactionsResponse = await fetch(
        `https://api.pepper.co.il/v1/accounts/${account.id}/transactions?from=${startDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!transactionsResponse.ok) {
        console.error(`Failed to fetch transactions for account ${account.id}`);
        continue;
      }

      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.transactions || [];

      // הוספת תנועות למסד נתונים
      for (const tx of transactions) {
        const { error: insertError } = await supabase
          .from('transactions')
          .upsert({
            user_id: connection.user_id,
            account_id: account.id,
            amount: Math.abs(tx.amount),
            type: tx.amount >= 0 ? 'income' : 'expense',
            description: tx.description,
            merchant_name: tx.merchant?.name,
            transaction_date: tx.date,
            external_id: tx.id,
            is_pending: tx.status === 'pending',
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'external_id',
            ignoreDuplicates: true,
          });

        if (!insertError) {
          totalTransactions++;
        }
      }
    }

    // עדכון last_sync
    await supabase
      .from('open_banking_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', connectionId);

    // שמירת היסטוריית sync
    await supabase
      .from('sync_history')
      .insert({
        user_id: connection.user_id,
        connection_id: connectionId,
        sync_type: 'automatic',
        sync_status: 'success',
        transactions_added: totalTransactions,
        sync_start: startDate.toISOString(),
        sync_end: new Date().toISOString(),
      });

    return res.json({
      success: true,
      transactions_synced: totalTransactions,
      accounts_synced: accountsToSync.length,
      message: `סונכרנו ${totalTransactions} תנועות חדשות!`
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    
    // שמירת שגיאה
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    await supabase
      .from('sync_history')
      .insert({
        connection_id: connectionId,
        sync_type: 'automatic',
        sync_status: 'failed',
        error_message: error.message,
        sync_start: new Date().toISOString(),
        sync_end: new Date().toISOString(),
      });

    return res.status(500).json({ 
      error: 'Sync failed',
      message: error.message 
    });
  }
}
