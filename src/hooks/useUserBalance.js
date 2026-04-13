import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getUserBalance } from '../lib/api'

export function useUserBalance() {
  const { user, isSignedIn } = useAuth()

  const { data: balance, isLoading } = useQuery({
    queryKey: ['userBalance', user?.id],
    queryFn: () => getUserBalance(user.id),
    enabled: !!isSignedIn && !!user?.id,
    refetchInterval: 15000,
  })

  return { balance: balance ?? 0, isLoading }
}
