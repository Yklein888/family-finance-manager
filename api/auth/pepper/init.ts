import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Pepper OAuth - התחלת תהליך ההתחברות
 * 
 * מטרה: ליצור URL שמפנה את המשתמש לדף האימות של Pepper
 * 
 * Flow:
 * 1. המשתמש לוחץ "התחבר" באפליקציה
 * 2. הקריאה הזו יוצרת authorization URL
 * 3. המשתמש מועבר לדף Pepper
 * 4. Pepper מבקש אישור מהמשתמש
 * 5. Pepper מחזיר את המשתמש ל-callback endpoint עם קוד
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // בדוק שה-method הוא GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // משתני סביבה - צריך להוסיף ב-Vercel
    const PEPPER_CLIENT_ID = process.env.VITE_PEPPER_CLIENT_ID;
    const PEPPER_REDIRECT_URI = process.env.VITE_PEPPER_REDIRECT_URI || 
      `${process.env.VERCEL_URL || 'http://localhost:5173'}/api/auth/pepper/callback`;

    // בדיקה שיש API Keys
    if (!PEPPER_CLIENT_ID) {
      return res.status(500).json({ 
        error: 'Pepper API keys not configured',
        message: 'נראה שלא הוספת את ה-API Keys של Pepper. ראה מדריך התקנה.',
        setupGuide: '/QUICK_SETUP.md'
      });
    }

    // יצירת state אקראי (למניעת CSRF)
    const state = Math.random().toString(36).substring(7);
    
    // שמירת state ב-session/database לבדיקה מאוחר יותר
    // TODO: Save state to database with user_id and expiry

    // יצירת authorization URL
    const authUrl = new URL('https://api.pepper.co.il/oauth/authorize');
    authUrl.searchParams.append('client_id', PEPPER_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', PEPPER_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'accounts transactions');

    // החזר את ה-URL למשתמש
    return res.status(200).json({
      authUrl: authUrl.toString(),
      state,
      message: 'העבר את המשתמש ל-URL הזה כדי להתחיל את תהליך האימות'
    });

  } catch (error: any) {
    console.error('Pepper OAuth init error:', error);
    return res.status(500).json({ 
      error: 'Failed to initialize OAuth',
      message: error.message 
    });
  }
}
