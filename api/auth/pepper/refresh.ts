import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Pepper Token Refresh
 * 
 * מרענן את ה-access token כשהוא פג תוקף
 * נקרא אוטומטית לפני כל sync
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { connectionId } = req.body;

  if (!connectionId) {
    return res.status(400).json({ error: 'Connection ID required' });
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // קריאת החיבור הנוכחי
    const { data: connection, error: fetchError } = await supabase
      .from('open_banking_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError || !connection) {
      throw new Error('Connection not found');
    }

    // בדיקה אם ה-token פג תוקף
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    
    if (expiresAt > now) {
      // Token עדיין תקף
      return res.json({ 
        message: 'Token still valid',
        expires_at: expiresAt 
      });
    }

    // רענון token
    const tokenResponse = await fetch('https://api.pepper.co.il/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
        client_id: process.env.VITE_PEPPER_CLIENT_ID,
        client_secret: process.env.VITE_PEPPER_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token refresh failed');
    }

    const tokens = await tokenResponse.json();
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // עדכון tokens במסד נתונים
    const { error: updateError } = await supabase
      .from('open_banking_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || connection.refresh_token,
        token_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (updateError) {
      throw updateError;
    }

    return res.json({
      success: true,
      expires_at: newExpiresAt,
      message: 'Token refreshed successfully'
    });

  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ 
      error: 'Token refresh failed',
      message: error.message 
    });
  }
}
