import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Filter, History } from 'lucide-react'
import { useAcoes, useDeleteAcao } from '@/hooks/useAcoes'
import { useQrus } from '@/hooks/useConfig'
import { useMembros } from '@/hooks/useMembros'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import GlowCard from '@/components/ui/GlowCard'
import HudButton from '@/components/ui/HudButton'
import LoadingHud from '@/components/ui/LoadingHud'
import { formatDate } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/motion'
import PageHeader from '@/components/ui/PageHeader'
import type { Acao, Membro, Ocorrencia } from '@/types'

const OCORR: Record<Ocorrencia, { label: string; color: string }> = {
  nenhuma:     { label: 'Nenhuma',     color: '#787878' },
  abordagem:   { label: 'Abordagem',   color: '#2980b9' },
  perseguicao: { label: 'Perseguição', color: '#e67e22' },
  apreensao:   { label: 'Apreensão',   color: '#c9a227' },
  multiplas:   { label: 'Múltiplas',   color: '#c0392b' },
}

const PAGE_SIZE = 20

export default function HistoricoPage() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const [page, setPage] = useState(1)
  const [tipoFilter, setTipoFilter] = useState('')
  const [ocorrFilter, setOcorrFilter] = useState('')

  const { data, isLoading } = useAcoes({ qru: tipoFilter || undefined, page, limit: PAGE_SIZE })
  const { data: qrus } = useQrus()
  const { data: membros } = useMembros()
  const deleteAcao = useDeleteAcao()

  const canEdit = user?.nivel === 'admin' || user?.nivel === 'moderador'
  const membroMap = new Map((membros ?? []).map((m: Membro) => [m.id, m]))

  async function handleDelete(id: number) {
    if (!confirm('Apagar esta patrulha? Esta operação não pode ser desfeita.')) return
    try {
      await deleteAcao.mutateAsync(id)
      addToast('success', 'Patrulha removida.')
    } catch {
      addToast('error', 'Erro ao remover patrulha.')
    }
  }

  const todas = data?.acoes ?? []
  const acoes = ocorrFilter ? todas.filter(a => (a.ocorrencias ?? 'nenhuma') === ocorrFilter) : todas
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function membrosStr(acao: Acao): string {
    const nomes = acao.participants.map(p => {
      const m = membroMap.get(p.memberId)
      return m ? m.policial : `ID:${p.memberId}`
    })
    return nomes.length ? nomes.join(', ') : '—'
  }

  if (isLoading) return <LoadingHud />

  return (
    <div className="p-6 space-y-4">
      <PageHeader icon={History} title="HISTÓRICO DE PATRULHAS" subtitle="TODAS AS PATRULHAS REGISTRADAS" />

      {/* Filtros */}
      <GlowCard>
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <Filter size={16} className="text-gold shrink-0" />

          <select
            value={tipoFilter}
            onChange={e => { setTipoFilter(e.target.value); setPage(1) }}
            className="bg-card2 border border-bdr2 rounded px-3 py-1.5 text-sm font-mono text-txt"
          >
            <option value="">Todos os tipos</option>
            {(qrus ?? []).map(q => <option key={q} value={q}>{q}</option>)}
          </select>

          <select
            value={ocorrFilter}
            onChange={e => setOcorrFilter(e.target.value)}
            className="bg-card2 border border-bdr2 rounded px-3 py-1.5 text-sm font-mono text-txt"
          >
            <option value="">Todas ocorrências</option>
            {Object.entries(OCORR).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <span className="font-mono text-xs text-txt2 ml-auto">{total} registros</span>
        </div>
      </GlowCard>

      {/* Tabela */}
      <GlowCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bdr">
                {['#', 'Data', 'Tipo', 'Setor', 'Duração', 'Ocorrências', 'Membros', 'Obs.', ''].map(h => (
                  <th key={h} className="text-left font-mono text-xs text-txt3 tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              <AnimatePresence>
                {acoes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 font-mono text-xs text-txt3">
                      Nenhuma patrulha encontrada
                    </td>
                  </tr>
                ) : acoes.map((acao: Acao) => {
                  const oc = OCORR[(acao.ocorrencias ?? 'nenhuma') as Ocorrencia]
                  return (
                    <motion.tr
                      key={acao.id}
                      layout
                      variants={staggerItem}
                      exit={{ opacity: 0, x: 200 }}
                      transition={{ duration: 0.25 }}
                      className="border-b border-bdr/50 hover:bg-bdr/40 transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-txt3">#{acao.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-txt whitespace-nowrap">{formatDate(acao.data)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-txt2">{acao.qru}</td>
                      <td className="px-4 py-3 font-mono text-xs text-txt2">{acao.setor || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-txt2 whitespace-nowrap">{acao.duracao ? `${acao.duracao}h` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded border whitespace-nowrap"
                          style={{ color: oc.color, borderColor: oc.color + '40', background: oc.color + '12' }}>
                          {oc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-txt2 max-w-[220px] truncate" title={membrosStr(acao)}>
                        {membrosStr(acao)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-txt2 max-w-[200px] truncate" title={acao.obs || ''}>
                        {acao.obs || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(acao.id)}
                            className="opacity-0 group-hover:opacity-100 text-txt3 hover:text-red transition-all p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-bdr">
            <HudButton variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ‹ Anterior
            </HudButton>
            <span className="font-mono text-xs text-txt2">
              {page} / {totalPages}
            </span>
            <HudButton variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Próximo ›
            </HudButton>
          </div>
        )}
      </GlowCard>
    </div>
  )
}
