import { useMemo, useState } from 'react'
import { FileText, Trash2, Star } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlowCard from '@/components/ui/GlowCard'
import { useMembros } from '@/hooks/useMembros'
import { useRelatos, useDeleteRelato } from '@/hooks/useRelatos'
import { useUIStore } from '@/store/uiStore'
import { usePerms } from '@/hooks/usePermissoes'

function notaColor(n: number): string {
  if (n >= 7) return '#27ae60'
  if (n >= 4) return '#e67e22'
  return '#c0392b'
}

export default function RelatoriosRegistradosPage() {
  const { can } = usePerms()
  const podeExcluir = can('relatoriosRegistrados', 'edit')

  const { data: membros = [] } = useMembros()
  const { data: relatos = [] } = useRelatos()
  const excluir = useDeleteRelato()
  const addToast = useUIStore(s => s.addToast)

  const [filtro, setFiltro] = useState('')

  const membrosOrdenados = useMemo(
    () => [...membros].sort((a, b) => (a.ordem ?? a.id) - (b.ordem ?? b.id)),
    [membros],
  )

  const relatosFiltrados = useMemo(() => {
    const arr = [...relatos].sort((a, b) => b.id - a.id)
    if (!filtro) return arr
    return arr.filter(r => String(r.alvoId) === filtro)
  }, [relatos, filtro])

  async function remover(id: number) {
    if (!confirm('Remover este relatório?')) return
    try {
      await excluir.mutateAsync(id)
      addToast('success', 'Relatório removido')
    } catch {
      addToast('error', 'Erro ao remover')
    }
  }

  const selectCls = 'bg-card2 border border-bdr2 text-txt text-sm rounded px-3 py-2 outline-none focus:border-gold font-mono max-w-[240px]'

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="RELATÓRIOS REGISTRADOS"
        subtitle="AVALIAÇÕES INTERNAS JÁ REGISTRADAS"
      />

      <GlowCard>
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <span className="font-mono text-xs text-txt2">{relatosFiltrados.length} registro(s)</span>
            <select value={filtro} onChange={e => setFiltro(e.target.value)} className={selectCls}>
              <option value="">Todos os membros</option>
              {membrosOrdenados.map(m => (
                <option key={m.id} value={m.id}>{m.badge ? `#${m.badge} ` : ''}{m.policial}</option>
              ))}
            </select>
          </div>

          {relatosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-txt3 font-mono text-sm">
              <FileText size={36} className="mx-auto mb-3 opacity-40" />
              Nenhum relatório registrado
            </div>
          ) : (
            <div className="space-y-2">
              {relatosFiltrados.map(r => (
                <div key={r.id}
                  className="flex items-center justify-between gap-3 bg-card2 border border-bdr rounded px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-txt font-bold truncate">{r.alvoNome}</p>
                    <p className="text-[11px] text-txt2 font-mono mt-0.5">
                      📅 {r.data} · ✍️ {r.relatorNome}
                      {r.autor ? ` · por ${r.autor}` : ''}
                    </p>
                    {r.observacao && (
                      <p className="text-[12px] text-txt2 mt-1 break-words">💬 {r.observacao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 font-orbitron text-sm font-bold px-2 py-1 rounded border"
                      style={{ color: notaColor(r.nota), borderColor: notaColor(r.nota) + '55' }}>
                      <Star size={13} /> {r.nota}
                    </span>
                    {podeExcluir && (
                      <button onClick={() => remover(r.id)}
                        className="text-txt3 hover:text-red transition-colors p-1" aria-label="Remover">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowCard>
    </div>
  )
}
