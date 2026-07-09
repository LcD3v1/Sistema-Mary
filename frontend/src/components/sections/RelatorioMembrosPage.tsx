import { useState, useMemo } from 'react'
import { ClipboardList } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlowCard from '@/components/ui/GlowCard'
import HudButton from '@/components/ui/HudButton'
import { useMembros } from '@/hooks/useMembros'
import { useCreateRelato } from '@/hooks/useRelatos'
import { useUIStore } from '@/store/uiStore'
import { usePerms } from '@/hooks/usePermissoes'

const hoje = () => new Date().toISOString().split('T')[0]

export default function RelatorioMembrosPage() {
  const { can } = usePerms()
  const podeEditar = can('relatoriosMembros', 'edit')

  const { data: membros = [] } = useMembros()
  const criar = useCreateRelato()
  const addToast = useUIStore(s => s.addToast)

  const [data, setData] = useState(hoje())
  const [relatorId, setRelatorId] = useState('')
  const [alvoId, setAlvoId] = useState('')
  const [nota, setNota] = useState('')
  const [observacao, setObservacao] = useState('')

  const membrosOrdenados = useMemo(
    () => [...membros].sort((a, b) => (a.ordem ?? a.id) - (b.ordem ?? b.id)),
    [membros],
  )

  function limpar() {
    setData(hoje()); setRelatorId(''); setAlvoId(''); setNota(''); setObservacao('')
  }

  async function salvar() {
    if (!relatorId) { addToast('error', 'Selecione o membro relator'); return }
    if (!alvoId)    { addToast('error', 'Selecione o membro avaliado'); return }
    if (relatorId === alvoId) { addToast('error', 'Relator e avaliado não podem ser o mesmo membro'); return }
    if (nota === '') { addToast('error', 'Informe a nota'); return }
    const notaNum = Math.max(0, Math.min(10, parseFloat(nota)))
    if (isNaN(notaNum)) { addToast('error', 'Nota inválida'); return }
    try {
      await criar.mutateAsync({
        data,
        relatorId: parseInt(relatorId, 10),
        alvoId: parseInt(alvoId, 10),
        nota: notaNum,
        observacao: observacao.trim(),
      })
      addToast('success', 'Relatório registrado')
      limpar()
    } catch {
      addToast('error', 'Erro ao salvar relatório')
    }
  }

  const selectCls = 'w-full bg-card2 border border-bdr2 text-txt text-sm rounded px-3 py-2 outline-none focus:border-gold font-mono'
  const labelCls = 'block text-[10px] text-txt2 uppercase tracking-wider mb-1.5 font-mono'

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="RELATÓRIO DE MEMBROS"
        subtitle="REGISTRAR AVALIAÇÃO INTERNA DE UM MEMBRO"
      />

      {podeEditar ? (
        <GlowCard>
          <div className="p-5 md:p-6">
            <h3 className="font-orbitron text-xs text-gold tracking-widest mb-4">NOVO RELATÓRIO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className={labelCls}>Data</label>
                <input type="date" value={data} onChange={e => setData(e.target.value)} className={selectCls} />
              </div>
              <div>
                <label className={labelCls}>Membro Relator</label>
                <select value={relatorId} onChange={e => setRelatorId(e.target.value)} className={selectCls}>
                  <option value="">— Selecionar —</option>
                  {membrosOrdenados.map(m => (
                    <option key={m.id} value={m.id}>{m.badge ? `#${m.badge} ` : ''}{m.policial}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Membro Avaliado</label>
                <select value={alvoId} onChange={e => setAlvoId(e.target.value)} className={selectCls}>
                  <option value="">— Selecionar —</option>
                  {membrosOrdenados.map(m => (
                    <option key={m.id} value={m.id}>{m.badge ? `#${m.badge} ` : ''}{m.policial}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nota (0–10)</label>
                <input type="number" min={0} max={10} step={0.5} value={nota}
                  onChange={e => setNota(e.target.value)} placeholder="Ex: 8" className={selectCls} />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Observação</label>
              <textarea rows={3} value={observacao} onChange={e => setObservacao(e.target.value)}
                placeholder="Descreva o comportamento, desempenho ou ocorrido..."
                className={`${selectCls} resize-y`} />
            </div>
            <div className="flex gap-3">
              <HudButton onClick={salvar} loading={criar.isPending}>SALVAR RELATÓRIO</HudButton>
              <HudButton variant="ghost" onClick={limpar} type="button">LIMPAR</HudButton>
            </div>
          </div>
        </GlowCard>
      ) : (
        <GlowCard>
          <div className="text-center py-12 text-txt3 font-mono text-sm">
            <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
            Sua conta não tem permissão para registrar relatórios.
          </div>
        </GlowCard>
      )}
    </div>
  )
}
