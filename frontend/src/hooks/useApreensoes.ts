import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { queryClient } from '@/lib/queryClient'
import type { Apreensao } from '@/types'

export type NovaApreensao = Omit<Apreensao, 'id'>

export function useApreensoes() {
  return useQuery<Apreensao[]>({
    queryKey: ['apreensoes'],
    queryFn: async () => (await api.get<Apreensao[]>('/apreensoes')).data,
    refetchInterval: 60_000,
  })
}

export function useCreateApreensao() {
  return useMutation({
    mutationFn: (body: NovaApreensao) => api.post<Apreensao>('/apreensoes', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apreensoes'] }),
  })
}

export function useUpdateApreensao() {
  return useMutation({
    mutationFn: ({ id, ...body }: NovaApreensao & { id: number }) =>
      api.put<Apreensao>(`/apreensoes/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apreensoes'] }),
  })
}

export function useDeleteApreensao() {
  return useMutation({
    mutationFn: (id: number) => api.delete(`/apreensoes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apreensoes'] }),
  })
}
