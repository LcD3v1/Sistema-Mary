import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { queryClient } from '@/lib/queryClient'
import type { RelatorioMembro } from '@/types'

export interface NovoRelato {
  data: string
  relatorId: number
  alvoId: number
  nota: number
  observacao: string
}

export function useRelatos() {
  return useQuery<RelatorioMembro[]>({
    queryKey: ['relatos'],
    queryFn: async () => {
      const { data } = await api.get<RelatorioMembro[]>('/relatos')
      return data
    },
    refetchInterval: 60_000,
  })
}

export function useCreateRelato() {
  return useMutation({
    mutationFn: (body: NovoRelato) => api.post<RelatorioMembro>('/relatos', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relatos'] }),
  })
}

export function useDeleteRelato() {
  return useMutation({
    mutationFn: (id: number) => api.delete(`/relatos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relatos'] }),
  })
}
