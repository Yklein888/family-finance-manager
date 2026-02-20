import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Pepper OAuth - Callback Handler
 * 
 * נקרא אוטומטית אחרי שהמשתמש אישר גישה ב-Pepper
 * מקבל קוד אימות ומחליף אותו ל-access token
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { code, state, error } = req.query;

  // אם היתה שגיאה באימות
  if (error) {
    return res.redirect(`${process.env.VITE_APP_URL}?error=${error}`);
  }

  // אם אין קוד
  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    // משתני סביבה
    const PEPPER_CLIENT_ID = process.env.VITE_PEPPER_CLIENT_ID;
    const PEPPER_CLIENT_SECRET = process.env.VITE_PEPPER_CLIENT_SECRET;
    const PEPPER_REDIRECT_URI = process.env.VITE_PEPPER_REDIRECT_URI;

    if (!PEPPER_CLIENT_ID || !PEPPER_CLIENT_SECRET) {
      throw new Error('Pepper credentials not configured');
    }

    // החלפת code ל-access token
    const tokenResponse = await fetch('https://api.pepper.co.il/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: PEPPER_CLIENT_ID,
        client_secret: PEPPER_CLIENT_SECRET,
        redirect_uri: PEPPER_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json();
    
    // שמירת tokens ב-Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // Service key for server-side
    );

    // TODO: Get user_id from state parameter (needs to be stored during init)
    // For now, we'll return tokens and let the frontend handle it
    
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // עדכון החיבור במסד הנתונים
    const { error: dbError } = await supabase
      .from('open_banking_connections')
      .update({
        connection_status: 'active',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        last_sync: new Date().toISOString(),
      })
      .eq('provider_code', 'pepper')
      .eq('connection_status', 'pending');

    if (dbError) {
      console.error('Database update error:', dbError);
      throw dbError;
    }

    // הפניה חזרה לאפליקציה עם הצלחה
    return res.redirect(`${process.env.VITE_APP_URL}/accounts?success=true&provider=pepper`);

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return res.redirect(`${process.env.VITE_APP_URL}/accounts?error=${encodeURIComponent(error.message)}`);
  }
}
