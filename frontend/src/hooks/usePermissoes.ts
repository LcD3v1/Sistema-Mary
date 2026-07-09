import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { TABS, TAB_PATH, type TabId } from '@/lib/permissoes'
import type { Permissoes } from '@/types'

export function usePermissoes() {
  const token = useAuthStore(s => s.token)
  return useQuery<Permissoes>({
    queryKey: ['config', 'permissoes'],
    queryFn: async () => (await api.get<Permissoes>('/config/permissoes')).data,
    enabled: !!token,          // não busca (nem 401) na tela de login
    staleTime: 30_000,
  })
}

export function useUpdatePermissoes() {
  return useMutation({
    mutationFn: (p: Permissoes) => api.put('/config/permissoes', p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config', 'permissoes'] }),
  })
}

// Retorna { can, ready }. can(tab, acao) respeita a matriz; admin sempre true.
export function usePerms() {
  const { user } = useAuthStore()
  const { data: perms, isLoading } = usePermissoes()
  const isAdmin = user?.nivel === 'admin'

  function can(tab: string, action: 'view' | 'edit'): boolean {
    if (!user) return false
    if (isAdmin) return true
    const p = perms?.[user.nivel]?.[tab]
    if (!p) return false
    return action === 'edit' ? !!p.edit : !!p.view
  }

  // Primeiro caminho que o usuário pode ver (para redirecionar)
  function firstAllowedPath(): string {
    for (const tab of TABS) {
      if (can(tab, 'view')) return TAB_PATH[tab as TabId]
    }
    return '/sem-acesso'
  }

  // admin não precisa esperar a matriz carregar
  const ready = isAdmin || !isLoading
  return { can, firstAllowedPath, ready, isAdmin }
}
