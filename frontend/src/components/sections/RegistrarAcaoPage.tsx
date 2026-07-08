import { useState, useMemo } from 'react'
import { Bike, Send } from 'lucide-react'
import { useCreateAcao } from '@/hooks/useAcoes'
import { useQrus } from '@/hooks/useConfig'
import { useMembros } from '@/hooks/useMembros'
import { useUIStore } from '@/store/uiStore'
import { usePerms } from '@/hooks/usePermissoes'
import GlowCard from '@/components/ui/GlowCard'
import HudButton from '@/components/ui/HudButton'
import LoadingHud from '@/components/ui/LoadingHud'
import PageHeader from '@/components/ui/PageHeader'
import type { Ocorrencia, Membro } from '@/types'

const OCORRENCIAS: { v: Ocorrencia; l: string }[] = [
  { v: 'nenhuma',     l: 'Nenhuma' },
  { v: 'abordagem',   l: 'Abordagem' },
  { v: 'perseguicao', l: 'Perseguição' },
  { v: 'apreensao',   l: 'Apreensão' },
  { v: 'multiplas',   l: 'Múltiplas' },
]

const hoje = () => new Date().toISOString().slice(0, 10)

export default function RegistrarAcaoPage() {
  const { addToast } = useUIStore()
  const { can } = usePerms()
  const canEdit = can('patrulha', 'edit')
  const { data: qrus, isLoading: qrusLoading } = useQrus()
  const { data: membros, isLoading: membrosLoading } = useMembros()
  const createAcao = useCreateAcao()

  const [data, setData] = useState(hoje())
  const [tipo, setTipo] = useState('')
  const [setor, setSetor] = useState('')
  const [duracao, setDuracao] = useState('')
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia>('nenhuma')
  const [obs, setObs] = useState('')
  const [sel, setSel] = useState<number[]>([])

  const membrosOrd = useMemo(
    () => [...(membros ?? [])].sort((a, b) => (a.ordem ?? a.id) - (b.ordem ?? b.id)),
    [membros],
  )
  const tag = (m: Membro) => `${m.badge ? '#' + m.badge + ' ' : ''}${m.policial}`

  function toggle(id: number) {
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function limpar() {
    setData(hoje()); setTipo(qrus?.[0] ?? ''); setSetor(''); setDuracao('')
    setOcorrencias('nenhuma'); setObs(''); setSel([])
  }

  const tipoSel = tipo || qrus?.[0] || ''

  async function registrar() {
    if (!tipoSel) { addToast('error', 'Selecione o tipo de patrulha'); return }
    try {
      await createAcao.mutateAsync({
        data,
        qru: tipoSel,
        resultado: 'Vitória',
        setor: setor.trim(),
        duracao: parseFloat(duracao) || 0,
        ocorrencias,
        obs: obs.trim(),
        participants: sel.map(id => {
          const m = (membros ?? []).find(x => x.id === id)
          return { memberId: id, patenteUnidade: m?.patenteInterna || m?.patenteNPD || '' }
        }),
        participantesExtras: [],
      })
      addToast('success', 'Patrulha registrada com sucesso!')
      limpar()
    } catch {
      addToast('error', 'Erro ao registrar patrulha.')
    }
  }

  if (qrusLoading || membrosLoading) return <LoadingHud />

  const inp = 'w-full bg-card2 border border-bdr2 text-txt text-sm rounded px-3 py-2.5 outline-none focus:border-gold font-mono'
  const lbl = 'block text-[10px] text-txt2 uppercase tracking-wider mb-1.5 font-mono'

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Bike}
        title="REGISTRAR PATRULHA"
        subtitle="REGISTRE UMA NOVA PATRULHA DA UNIDADE M.A.R.Y"
      />

      <GlowCard>
        <div className="p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className={lbl}>Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Tipo de Patrulha</label>
              <select value={tipoSel} onChange={e => setTipo(e.target.value)} className={inp}>
                {(qrus ?? []).map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Setor / Área</label>
              <input value={setor} onChange={e => setSetor(e.target.value)} placeholder="Ex: Zona Norte, Centro..." className={inp} />
            </div>
            <div>
              <label className={lbl}>Duração (horas)</label>
              <input type="number" min={0} step={0.5} value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="Ex: 2.5" className={inp} />
            </div>
            <div>
              <label className={lbl}>Ocorrências</label>
              <select value={ocorrencias} onChange={e => setOcorrencias(e.target.value as Ocorrencia)} className={inp}>
                {OCORRENCIAS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className={lbl}>
              Membros Participantes <span className="text-txt3 normal-case tracking-normal">(clique para selecionar)</span>
            </label>
            <div className="flex flex-wrap gap-2 bg-card2 border border-bdr2 rounded p-3 min-h-[46px]">
              {membrosOrd.length === 0
                ? <span className="text-xs text-txt3">Nenhum membro cadastrado — adicione em Membros</span>
                : membrosOrd.map(m => (
                  <button key={m.id} type="button" onClick={() => toggle(m.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                      sel.includes(m.id) ? 'bg-gold/20 border-gold text-gold3' : 'bg-card border-bdr2 text-txt2 hover:border-gold'
                    }`}>
                    {tag(m)}
                  </button>
                ))}
            </div>
          </div>

          <div className="mb-5">
            <label className={lbl}>Relatório / Observações</label>
            <textarea rows={4} value={obs} onChange={e => setObs(e.target.value)}
              placeholder="Descreva os principais eventos da patrulha..." className={`${inp} resize-y`} />
          </div>

          <div className="flex gap-3">
            <HudButton onClick={registrar} loading={createAcao.isPending} disabled={!canEdit}>
              <span className="flex items-center gap-2"><Send size={15} /> REGISTRAR</span>
            </HudButton>
            <HudButton variant="ghost" onClick={limpar} type="button">LIMPAR</HudButton>
          </div>
        </div>
      </GlowCard>
    </div>
  )
}
