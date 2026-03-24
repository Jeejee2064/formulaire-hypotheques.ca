import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/courtiers/login')

  const [{ data: profile }, { data: deals }] = await Promise.all([
    supabase.from('profiles').select('name, email, role').eq('id', user.id).single(),
    supabase.from('deals')
      .select(`*, creator:profiles!deals_created_by_fkey(name, email), taker:profiles!deals_taken_by_fkey(name, email)`)
      .order('created_at', { ascending: false }),
  ])

  return (
    <DashboardClient
      initialDeals={deals ?? []}
      currentUserId={user.id}
      currentUserName={profile?.name || profile?.email?.split('@')[0] || ''}
      currentUserRole={profile?.role || 'broker'}  // <-- AJOUTE CECI
    />
  )
}