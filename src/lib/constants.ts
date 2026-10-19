import type { Unit } from '../types/database'

export const RAYONS = [
  { id: 1, name: 'Légumes frais', emoji: '🥬', slug: 'legumes-frais' },
  { id: 2, name: 'Épices & condiments', emoji: '🌿', slug: 'epices-condiments' },
  { id: 3, name: 'Conserves & secs', emoji: '🥫', slug: 'conserves-secs' },
  { id: 4, name: 'Tubercules', emoji: '🍠', slug: 'tubercules' },
  { id: 5, name: 'Herbes aromatiques', emoji: '🌱', slug: 'herbes-aromatiques' },
  { id: 6, name: 'Maraîchers divers', emoji: '🧅', slug: 'maraichers-divers' },
] as const

export const COMMUNES_ABIDJAN = [
  'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi',
  'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon',
]

export const UNITES: Unit[] = ['kg', 'sachet', 'botte', 'pièce', 'litre']

export const formatFCFA = (amount: number): string =>
  `${new Intl.NumberFormat('fr-CI').format(amount)} FCFA`

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Une erreur inattendue est survenue. Veuillez réessayer.'
}

export function requireSupabaseConfiguration(configured: boolean): void {
  if (!configured) {
    throw new Error('Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env.')
  }
}
