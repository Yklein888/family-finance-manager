export interface OpenBankingProvider {
  code: string;
  name: string;
  logo: string;
  description: string;
  supportedAccounts: string[];
  status: 'available' | 'coming_soon';
}

export const OPEN_BANKING_PROVIDERS: OpenBankingProvider[] = [
  // ספקי בנקאות פתוחה מרכזיים
  {
    code: 'PEPPER',
    name: 'פאפר',
    logo: '🌶️',
    description: 'סנכרון חשבונות עו"ש, חסכונות, אשראי, השקעות ופנסיה מכל הבנקים',
    supportedAccounts: ['checking', 'savings', 'credit', 'investment', 'pension'],
    status: 'available',
  },
  {
    code: 'SALTEDGE',
    name: 'Salt Edge',
    logo: '🔐',
    description: 'סנכרון עו"ש, חסכונות וכרטיסי אשראי',
    supportedAccounts: ['checking', 'savings', 'credit'],
    status: 'available',
  },
  {
    code: 'MONO',
    name: 'Mono',
    logo: '🔗',
    description: 'סנכרון עו"ש, חסכונות וכרטיסי אשראי',
    supportedAccounts: ['checking', 'savings', 'credit'],
    status: 'available',
  },
  
  // בנקים ישראליים
  {
    code: 'LEUMI',
    name: 'בנק לאומי',
    logo: '🏦',
    description: 'חשבונות עו"ש, חסכון, אשראי והשקעות',
    supportedAccounts: ['checking', 'savings', 'credit', 'investment'],
    status: 'available',
  },
  {
    code: 'HAPOALIM',
    name: 'בנק הפועלים',
    logo: '🏦',
    description: 'חשבונות עו"ש, חסכון, אשראי והשקעות',
    supportedAccounts: ['checking', 'savings', 'credit', 'investment'],
    status: 'available',
  },
  {
    code: 'DISCOUNT',
    name: 'בנק דיסקונט',
    logo: '🏦',
    description: 'חשבונות עו"ש, חסכון ואשראי',
    supportedAccounts: ['checking', 'savings', 'credit'],
    status: 'available',
  },
  {
    code: 'MIZRAHI',
    name: 'בנק מזרחי טפחות',
    logo: '🏦',
    description: 'חשבונות עו"ש, חסכון ואשראי',
    supportedAccounts: ['checking', 'savings', 'credit'],
    status: 'available',
  },
  {
    code: 'INTERNATIONAL',
    name: 'בנק הבינלאומי',
    logo: '🏦',
    description: 'חשבונות עו"ש, חסכון ואשראי',
    supportedAccounts: ['checking', 'savings', 'credit'],
    status: 'available',
  },
  {
    code: 'JERUSALEM',
    name: 'בנק ירושלים',
    logo: '🏦',
    description: 'חשבונות עו"ש וחסכון',
    supportedAccounts: ['checking', 'savings'],
    status: 'available',
  },
  {
    code: 'OTSAR',
    name: 'בנק אוצר החייל',
    logo: '🏦',
    description: 'חשבונות עו"ש וחסכון',
    supportedAccounts: ['checking', 'savings'],
    status: 'available',
  },
  {
    code: 'POSTAL',
    name: 'בנק הדואר',
    logo: '📮',
    description: 'חשבונות עו"ש וחסכון',
    supportedAccounts: ['checking', 'savings'],
    status: 'available',
  },
  {
    code: 'YAHAV',
    name: 'בנק יהב',
    logo: '🏦',
    description: 'חשבונות עו"ש וחסכון',
    supportedAccounts: ['checking', 'savings'],
    status: 'available',
  },
  {
    code: 'MASSAD',
    name: 'בנק מסד',
    logo: '🏦',
    description: 'חשבונות עו"ש וחסכון',
    supportedAccounts: ['checking', 'savings'],
    status: 'available',
  },
  {
    code: 'MERCANTILE',
    name: 'בנק מרכנתיל',
    logo: '🏦',
    description: 'חשבונות עו"ש, חסכון ואשראי',
    supportedAccounts: ['checking', 'savings', 'credit'],
    status: 'available',
  },
  
  // חברות אשראי
  {
    code: 'ISRACARD',
    name: 'ישראכרט',
    logo: '💳',
    description: 'כרטיסי אשראי (ויזה, מאסטרקארד)',
    supportedAccounts: ['credit'],
    status: 'available',
  },
  {
    code: 'CAL',
    name: 'כ.א.ל',
    logo: '💳',
    description: 'כרטיסי אשראי (דיינרס)',
    supportedAccounts: ['credit'],
    status: 'available',
  },
  {
    code: 'MAX',
    name: 'מקס',
    logo: '💳',
    description: 'כרטיסי אשראי',
    supportedAccounts: ['credit'],
    status: 'available',
  },
  {
    code: 'LEUMI_CARD',
    name: 'לאומי כרטיסים',
    logo: '💳',
    description: 'כרטיסי אשראי של לאומי',
    supportedAccounts: ['credit'],
    status: 'available',
  },
  {
    code: 'AMEX',
    name: 'אמריקן אקספרס',
    logo: '💳',
    description: 'כרטיסי אשראי אמריקן אקספרס',
    supportedAccounts: ['credit'],
    status: 'available',
  },
  
  // חברות השקעות וניירות ערך
  {
    code: 'MEITAV',
    name: 'מיטב דש',
    logo: '📈',
    description: 'תיקי השקעות וניירות ערך',
    supportedAccounts: ['investment'],
    status: 'available',
  },
  {
    code: 'PSAGOT',
    name: 'פסגות',
    logo: '📈',
    description: 'תיקי השקעות וניירות ערך',
    supportedAccounts: ['investment'],
    status: 'available',
  },
  {
    code: 'EXCELLENCE',
    name: 'אקסלנס',
    logo: '📈',
    description: 'תיקי השקעות וניירות ערך',
    supportedAccounts: ['investment'],
    status: 'available',
  },
  {
    code: 'ALTSHULER',
    name: 'אלטשולר שחם',
    logo: '📈',
    description: 'תיקי השקעות וניירות ערך',
    supportedAccounts: ['investment'],
    status: 'available',
  },
  {
    code: 'IBI',
    name: 'IBI',
    logo: '📈',
    description: 'תיקי השקעות וניירות ערך',
    supportedAccounts: ['investment'],
    status: 'available',
  },
  {
    code: 'LEADER',
    name: 'לידר השקעות',
    logo: '📈',
    description: 'תיקי השקעות',
    supportedAccounts: ['investment'],
    status: 'available',
  },
  
  // פנסיה, ביטוח וחיסכון ארוך טווח
  {
    code: 'MENORA',
    name: 'מנורה מבטחים',
    logo: '🛡️',
    description: 'קרנות פנסיה, קופות גמל וביטוח',
    supportedAccounts: ['pension', 'insurance'],
    status: 'available',
  },
  {
    code: 'MIGDAL',
    name: 'מגדל',
    logo: '🛡️',
    description: 'קרנות פנסיה, קופות גמל וביטוח',
    supportedAccounts: ['pension', 'insurance'],
    status: 'available',
  },
  {
    code: 'CLAL',
    name: 'כלל ביטוח',
    logo: '🛡️',
    description: 'קרנות פנסיה, קופות גמל וביטוח',
    supportedAccounts: ['pension', 'insurance'],
    status: 'available',
  },
  {
    code: 'HAREL',
    name: 'הראל',
    logo: '🛡️',
    description: 'קרנות פנסיה, קופות גמל וביטוח',
    supportedAccounts: ['pension', 'insurance'],
    status: 'available',
  },
  {
    code: 'PHOENIX',
    name: 'הפניקס',
    logo: '🛡️',
    description: 'קרנות פנסיה וביטוח',
    supportedAccounts: ['pension', 'insurance'],
    status: 'available',
  },
  {
    code: 'AYALON',
    name: 'איילון',
    logo: '🛡️',
    description: 'קרנות פנסיה וביטוח',
    supportedAccounts: ['pension', 'insurance'],
    status: 'available',
  },
];

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'עו"ש',
  savings: 'חיסכון',
  credit: 'אשראי',
  investment: 'השקעות',
  pension: 'פנסיה',
  insurance: 'ביטוח',
  study_fund: 'קרן השתלמות',
  provident: 'קופת גמל',
};

export const CONNECTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'מחובר', color: 'text-[hsl(var(--success))]' },
  pending: { label: 'ממתין', color: 'text-[hsl(var(--warning))]' },
  expired: { label: 'פג תוקף', color: 'text-[hsl(var(--expense))]' },
  error: { label: 'שגיאה', color: 'text-[hsl(var(--destructive))]' },
};
