export type Nivel = 'admin' | 'moderador' | 'membro' | 'view_only'
export type StatusMembro = 'Ativo' | 'Inativo' | 'Ausência'
export type ResultadoAcao = 'Vitória' | 'Derrota' | 'Empate'
export type ResultadoRecruita = 'Aprovado' | 'Reprovado'
export type Ocorrencia = 'nenhuma' | 'abordagem' | 'perseguicao' | 'apreensao' | 'multiplas'

export interface Membro {
  id: number
  badge: string
  passaporte: string
  policial: string
  moto: string
  patenteNPD: string
  patenteInterna: string
  status: StatusMembro
  entrada: string
  promocao: string
  adv1: boolean
  adv2: boolean
  adv3: boolean
  ordem?: number
}

export interface ParticipanteAcao {
  memberId: number
  patenteUnidade: string
}

export interface ParticipanteExterno {
  nome: string
  patente?: string
}

export interface Acao {
  id: number
  data: string
  qru: string                 // = Tipo de Patrulha
  resultado: ResultadoAcao    // legado (mantido p/ compatibilidade)
  participants: ParticipanteAcao[]  // = membros participantes
  participantesExtras?: ParticipanteExterno[]
  comandante?: string
  // ── Campos de Patrulha (M.A.R.Y) ──
  setor?: string
  duracao?: number
  ocorrencias?: Ocorrencia
  obs?: string
}

export interface Apreensao {
  id: number
  data: string
  categoria: string
  qtd: number
  responsavel: string
  local: string
  membros: number[]
  descricao: string
}

export interface Conta {
  id: number
  username: string
  password: string
  nivel: Nivel
  ativo: boolean
}

export interface CategoriaRecrutamento {
  id: number
  nome: string
  peso: number
}

export interface RecCfg {
  notaMinima: number
  categorias: CategoriaRecrutamento[]
}

export interface AvaliacaoIndividual {
  contaId: number
  username: string
  scores: Record<string, number>
  total: number
  observacoes?: string
  data: string
}

export interface Recruta {
  id: number
  nome: string
  data: string
  avaliacoes: AvaliacaoIndividual[]
  resultado?: ResultadoRecruita
  status: 'aberto' | 'fechado'
  observacoes?: string
}

export interface TabPerm {
  view: boolean
  edit: boolean
}
// nivel -> tabId -> { view, edit }
export type Permissoes = Record<string, Record<string, TabPerm>>

export interface RelatorioMembro {
  id: number
  data: string
  relatorId: number
  relatorNome: string
  alvoId: number
  alvoNome: string
  nota: number
  observacao: string
  autor: string
}

export interface MaryData {
  membros: Membro[]
  acoes: Acao[]
  apreensoes: Apreensao[]
  aprCats: string[]
  qrus: string[]
  recrutas: Recruta[]
  relatos: RelatorioMembro[]
  recCfg: RecCfg
  patentes: string[]
  cargos: string[]
  contas: Conta[]
  permissoes: Permissoes
  nextMemId: number
  nextAcId: number
  nextAprId: number
  nextRecId: number
  nextRelatoId: number
  nextContaId: number
  logo: string
  membrosOrder: number[]
}

export interface AuthPayload {
  contaId: number
  username: string
  nivel: Nivel
}
