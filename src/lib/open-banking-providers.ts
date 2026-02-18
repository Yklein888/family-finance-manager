export interface OpenBankingProvider {
  code: string;
  name: string;
  logo: string;
  description: string;
  supportedAccounts: string[];
  status: 'available' | 'coming_soon';
}

export const OPEN_BANKING_PROVIDERS: OpenBankingProvider[] = [
  {
    code: 'PEPPER',
    name: 'פאפר',
    logo: '🌶️',
    description: 'סנכרון חשבונות עו"ש, חסכונות, אשראי, השקעות ופנסיה',
    supportedAccounts: ['checking', 'savings', 'credit', 'investment', 'pension'],
    status: 'available',
  },
  {
    code: 'ISRACARD',
    name: 'ישראכרט',
    logo: '💳',
    description: 'סנכרון חשבונות כרטיסי אשראי',
    supportedAccounts: ['credit'],
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
    status: 'coming_soon',
  },
];

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'עו"ש',
  savings: 'חיסכון',
  credit: 'אשראי',
  investment: 'השקעות',
  pension: 'פנסיה',
};

export const CONNECTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'מחובר', color: 'text-[hsl(var(--success))]' },
  pending: { label: 'ממתין', color: 'text-[hsl(var(--warning))]' },
  expired: { label: 'פג תוקף', color: 'text-[hsl(var(--expense))]' },
  error: { label: 'שגיאה', color: 'text-[hsl(var(--destructive))]' },
};
