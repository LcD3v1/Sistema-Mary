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
  resultado: ResultadoAcao
  participants: ParticipanteAcao[]  // = membros participantes
  participantesExtras?: ParticipanteExterno[]
  comandante?: string
  setor?: string
  duracao?: number
  ocorrencias?: Ocorrencia
  obs?: string
}

export interface Conta {
  id: number
  username: string
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

export interface AuthUser {
  contaId: number
  username: string
  nivel: Nivel
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

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export interface AcoesResponse {
  acoes: Acao[]
  total: number
  page: number
  limit: number
}
