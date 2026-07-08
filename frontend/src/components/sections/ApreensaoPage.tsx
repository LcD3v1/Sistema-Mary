import { useState, useMemo } from 'react'
import { Lock, Plus, Pencil, Trash2, Package, Calendar, MapPin, User, Users } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlowCard from '@/components/ui/GlowCard'
import HudButton from '@/components/ui/HudButton'
import ModalOverlay from '@/components/ui/ModalOverlay'
import { useMembros } from '@/hooks/useMembros'
import { useAprCats } from '@/hooks/useConfig'
import {
  useApreensoes, useCreateApreensao, useUpdateApreensao, useDeleteApreensao,
  type NovaApreensao,
} from '@/hooks/useApreensoes'
import { useUIStore } from '@/store/uiStore'
import { usePerms } from '@/hooks/usePermissoes'
import type { Apreensao } from '@/types'

const hoje = () => new Date().toISOString().split('T')[0]
const ym = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export default function ApreensaoPage() {
  const { can } = usePerms()
  const podeEditar = can('apreensao', 'edit')
  const podeAdicionar = can('apreensao', 'edit')

  const { data: membros = [] } = useMembros()
  const { data: cats = [] } = useAprCats()
  const { data: apreensoes = [] } = useApreensoes()
  const criar = useCreateApreensao()
  const atualizar = useUpdateApreensao()
  const excluir = useDeleteApreensao()
  const addToast = useUIStore(s => s.addToast)

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [data, setData] = useState(hoje())
  const [categoria, setCategoria] = useState('')
  const [qtd, setQtd] = useState('1')
  const [responsavel, setResponsavel] = useState('')
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState('')
  const [sel, setSel] = useState<number[]>([])

  const [fCat, setFCat] = useState('')
  const [fMes, setFMes] = useState('')

  const membrosOrd = useMemo(
    () => [...membros].sort((a, b) => (a.ordem ?? a.id) - (b.ordem ?? b.id)),
    [membros],
  )
  const nomeMembro = (id: number) => {
    const m = membros.find(x => x.id === id)
    return m ? `${m.badge ? '#' + m.badge + ' ' : ''}${m.policial}` : `#${id}`
  }

  const totalItens = apreensoes.reduce((s, a) => s + (a.qtd || 1), 0)
  const esteMes = apreensoes.filter(a => a.data?.startsWith(ym())).length

  const meses = useMemo(() => {
    const arr: { v: string; l: string }[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      arr.push({ v: ym(d), l: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) })
    }
    return arr
  }, [])

  const lista = useMemo(() => {
    let arr = [...apreensoes].sort((a, b) => b.id - a.id)
    if (fCat) arr = arr.filter(a => a.categoria === fCat)
    if (fMes) arr = arr.filter(a => a.data?.startsWith(fMes))
    return arr
  }, [apreensoes, fCat, fMes])

  function abrirNova() {
    setEditId(null); setData(hoje()); setCategoria(cats[0] ?? ''); setQtd('1')
    setResponsavel(''); setLocal(''); setDescricao(''); setSel([]); setOpen(true)
  }
  function abrirEdit(a: Apreensao) {
    setEditId(a.id); setData(a.data); setCategoria(a.categoria); setQtd(String(a.qtd))
    setResponsavel(a.responsavel); setLocal(a.local); setDescricao(a.descricao)
    setSel(a.membros ?? []); setOpen(true)
  }
  function toggleMembro(id: number) {
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function salvar() {
    if (!categoria) { addToast('error', 'Selecione a categoria'); return }
    const body: NovaApreensao = {
      data, categoria,
      qtd: Math.max(1, parseInt(qtd, 10) || 1),
      responsavel: responsavel.trim(),
      local: local.trim(),
      membros: sel,
      descricao: descricao.trim(),
    }
    try {
      if (editId) { await atualizar.mutateAsync({ id: editId, ...body }); addToast('success', 'Apreensão atualizada') }
      else { await criar.mutateAsync(body); addToast('success', 'Apreensão registrada') }
      setOpen(false)
    } catch { addToast('error', 'Erro ao salvar') }
  }

  async function remover(id: number) {
    if (!confirm('Remover esta apreensão?')) return
    try { await excluir.mutateAsync(id); addToast('success', 'Apreensão removida') }
    catch { addToast('error', 'Erro ao remover') }
  }

  const inp = 'w-full bg-card2 border border-bdr2 text-txt text-sm rounded px-3 py-2 outline-none focus:border-gold font-mono'
  const lbl = 'block text-[10px] text-txt2 uppercase tracking-wider mb-1.5 font-mono'

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Lock}
        title="APREENSÃO"
        subtitle="REGISTRO DE ITENS APREENDIDOS"
        actions={podeAdicionar && (
          <HudButton size="sm" onClick={abrirNova}>
            <span className="flex items-center gap-1.5"><Plus size={14} /> NOVA APREENSÃO</span>
          </HudButton>
        )}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { l: 'Total Apreensões', v: apreensoes.length, c: 'var(--txt)' },
          { l: 'Itens Apreendidos', v: totalItens, c: 'var(--gold3)' },
          { l: 'Este Mês', v: esteMes, c: '#e67e22' },
        ].map(s => (
          <div key={s.l} className="bg-card border border-bdr rounded-xl px-5 py-4">
            <p className="font-orbitron text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[10px] text-txt2 uppercase tracking-wider mt-1 font-mono">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select value={fCat} onChange={e => setFCat(e.target.value)} className={`${inp} max-w-[220px]`}>
          <option value="">Todas categorias</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={fMes} onChange={e => setFMes(e.target.value)} className={`${inp} max-w-[220px]`}>
          <option value="">Todos os meses</option>
          {meses.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
      </div>

      {/* Lista */}
      <GlowCard>
        <div className="p-1">
          {lista.length === 0 ? (
            <div className="text-center py-12 text-txt3 font-mono text-sm">
              <Lock size={36} className="mx-auto mb-3 opacity-40" />
              Nenhuma apreensão registrada
            </div>
          ) : (
            <div className="space-y-2">
              {lista.map(a => (
                <div key={a.id} className="flex items-start justify-between gap-3 bg-card2 border border-bdr rounded px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gold uppercase tracking-wider">{a.categoria}</p>
                    {a.descricao && <p className="text-sm text-txt mt-0.5 break-words">{a.descricao}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-txt2 font-mono mt-1.5">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {a.data}</span>
                      <span className="flex items-center gap-1"><Package size={11} /> Qtd: {a.qtd}</span>
                      {a.responsavel && <span className="flex items-center gap-1"><User size={11} /> {a.responsavel}</span>}
                      {a.local && <span className="flex items-center gap-1"><MapPin size={11} /> {a.local}</span>}
                      {a.membros?.length > 0 && (
                        <span className="flex items-center gap-1"><Users size={11} /> {a.membros.map(nomeMembro).join(', ')}</span>
                      )}
                    </div>
                  </div>
                  {podeEditar && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => abrirEdit(a)} className="text-txt3 hover:text-gold transition-colors p-1"><Pencil size={15} /></button>
                      <button onClick={() => remover(a.id)} className="text-txt3 hover:text-red transition-colors p-1"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowCard>

      {/* Modal */}
      <ModalOverlay open={open} onClose={() => setOpen(false)} title={editId ? 'EDITAR APREENSÃO' : 'NOVA APREENSÃO'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div><label className={lbl}>Data</label><input type="date" value={data} onChange={e => setData(e.target.value)} className={inp} /></div>
          <div>
            <label className={lbl}>Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inp}>
              <option value="">— Selecionar —</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Quantidade</label><input type="number" min={1} value={qtd} onChange={e => setQtd(e.target.value)} className={inp} /></div>
          <div>
            <label className={lbl}>Responsável</label>
            <select value={responsavel} onChange={e => setResponsavel(e.target.value)} className={inp}>
              <option value="">— Selecionar membro —</option>
              {membrosOrd.map(m => <option key={m.id} value={nomeMembro(m.id)}>{nomeMembro(m.id)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className={lbl}>Local / Setor</label><input value={local} onChange={e => setLocal(e.target.value)} placeholder="Ex: Zona Norte" className={inp} /></div>
        </div>

        <div className="mb-4">
          <label className={lbl}>Membros Envolvidos (clique para selecionar)</label>
          <div className="flex flex-wrap gap-2 bg-card2 border border-bdr2 rounded p-3 min-h-[46px]">
            {membrosOrd.length === 0
              ? <span className="text-xs text-txt3">Nenhum membro cadastrado</span>
              : membrosOrd.map(m => (
                <button key={m.id} type="button" onClick={() => toggleMembro(m.id)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                    sel.includes(m.id) ? 'bg-gold/20 border-gold text-gold3' : 'bg-card border-bdr2 text-txt2 hover:border-gold'
                  }`}>
                  {nomeMembro(m.id)}
                </button>
              ))}
          </div>
        </div>

        <div className="mb-5">
          <label className={lbl}>Descrição do Item</label>
          <textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)}
            placeholder="Descreva o item apreendido..." className={`${inp} resize-y`} />
        </div>

        <div className="flex gap-3">
          <HudButton onClick={salvar} loading={criar.isPending || atualizar.isPending}>SALVAR</HudButton>
          <HudButton variant="ghost" onClick={() => setOpen(false)} type="button">CANCELAR</HudButton>
        </div>
      </ModalOverlay>
    </div>
  )
}
