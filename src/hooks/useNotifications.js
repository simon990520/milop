import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationAsRead } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => getNotifications(user.id),
    enabled: !!isSignedIn && !!user?.id,
    refetchInterval: 30000, // Cada 30 seg
  })

  const markReadMut = useMutation({
    mutationFn: (id) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user?.id])
    },
  })

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: (id) => markReadMut.mutate(id),
  }
}
