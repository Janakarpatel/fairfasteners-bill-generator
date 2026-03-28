import { normalizeDialCodeInput } from '@/lib/billing/indianMobile'

/** Preset countries for the mobile country-code dropdown (dial = calling code digits, no +). */
export const COUNTRY_DIAL_OPTIONS: readonly { dial: string; label: string }[] = [
  { dial: '91', label: 'India' },
  { dial: '1', label: 'United States / Canada' },
  { dial: '44', label: 'United Kingdom' },
  { dial: '971', label: 'United Arab Emirates' },
  { dial: '65', label: 'Singapore' },
  { dial: '61', label: 'Australia' },
  { dial: '49', label: 'Germany' },
  { dial: '33', label: 'France' },
  { dial: '966', label: 'Saudi Arabia' },
  { dial: '86', label: 'China' },
  { dial: '81', label: 'Japan' },
  { dial: '82', label: 'South Korea' },
  { dial: '55', label: 'Brazil' },
  { dial: '27', label: 'South Africa' },
  { dial: '880', label: 'Bangladesh' },
  { dial: '92', label: 'Pakistan' },
  { dial: '977', label: 'Nepal' },
  { dial: '94', label: 'Sri Lanka' },
  { dial: '64', label: 'New Zealand' },
  { dial: '39', label: 'Italy' },
  { dial: '34', label: 'Spain' },
  { dial: '31', label: 'Netherlands' },
  { dial: '46', label: 'Sweden' },
  { dial: '7', label: 'Russia / Kazakhstan' },
  { dial: '66', label: 'Thailand' },
  { dial: '60', label: 'Malaysia' },
  { dial: '62', label: 'Indonesia' },
  { dial: '63', label: 'Philippines' },
  { dial: '84', label: 'Vietnam' },
  { dial: '20', label: 'Egypt' },
  { dial: '234', label: 'Nigeria' },
  { dial: '254', label: 'Kenya' },
  { dial: '351', label: 'Portugal' },
  { dial: '353', label: 'Ireland' },
  { dial: '41', label: 'Switzerland' },
  { dial: '32', label: 'Belgium' },
  { dial: '48', label: 'Poland' },
  { dial: '90', label: 'Turkey' },
  { dial: '972', label: 'Israel' },
  { dial: '965', label: 'Kuwait' },
  { dial: '974', label: 'Qatar' },
  { dial: '968', label: 'Oman' },
  { dial: '973', label: 'Bahrain' },
  { dial: '852', label: 'Hong Kong' },
  { dial: '886', label: 'Taiwan' },
  { dial: '40', label: 'Romania' },
  { dial: '420', label: 'Czech Republic' },
  { dial: '36', label: 'Hungary' },
  { dial: '380', label: 'Ukraine' },
] as const

export const CUSTOM_DIAL_VALUE = '__custom__'

const PRESET_DIAL_SET = new Set(COUNTRY_DIAL_OPTIONS.map((o) => o.dial))

export function isPresetDialCode(dialCode: string): boolean {
  return PRESET_DIAL_SET.has(normalizeDialCodeInput(dialCode))
}
