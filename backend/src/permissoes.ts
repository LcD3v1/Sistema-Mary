import { Permissoes, TabPerm } from './types'

// Abas controláveis pelo sistema de permissões
export const TABS = [
  'dashboard',
  'patrulha',
  'historico',
  'apreensao',
  'relatorios',
  'recrutamento',
  'membros',
  'relatoriosMembros',
  'relatoriosRegistrados',
  'config',
] as const

export type TabId = typeof TABS[number]

// Rótulos amigáveis (usados na tela de admin)
export const TAB_LABELS: Record<string, string> = {
  dashboard:         'Dashboard',
  patrulha:          'Registrar Patrulha',
  historico:         'Histórico',
  apreensao:         'Apreensão',
  relatorios:        'Relatórios',
  recrutamento:      'Recrutamento',
  membros:           'Membros',
  relatoriosMembros: 'Relatório de Membros',
  relatoriosRegistrados: 'Relatórios Registrados',
  config:            'Configurações',
}

const P = (view: boolean, edit: boolean): TabPerm => ({ view, edit })

// Matriz padrão — replica o comportamento atual do sistema.
// admin NÃO entra aqui: admin sempre tem acesso total (não pode se travar).
export const DEFAULT_PERMISSOES: Permissoes = {
  moderador: {
    dashboard:         P(true,  false),
    patrulha:          P(true,  true),
    historico:         P(true,  true),
    apreensao:         P(true,  true),
    relatorios:        P(true,  true),
    recrutamento:      P(true,  true),
    membros:           P(true,  true),
    relatoriosMembros: P(true,  true),
    relatoriosRegistrados: P(true, true),
    config:            P(true,  true),
  },
  membro: {
    dashboard:         P(true,  false),
    patrulha:          P(true,  true),
    historico:         P(true,  false),
    apreensao:         P(true,  true),
    relatorios:        P(true,  false),
    recrutamento:      P(false, false),
    membros:           P(true,  false),
    relatoriosMembros: P(true,  true),
    relatoriosRegistrados: P(false, false),
    config:            P(false, false),
  },
  view_only: {
    dashboard:         P(false, false),
    patrulha:          P(false, false),
    historico:         P(false, false),
    apreensao:         P(false, false),
    relatorios:        P(true,  false),
    recrutamento:      P(false, false),
    membros:           P(true,  false),
    relatoriosMembros: P(false, false),
    relatoriosRegistrados: P(false, false),
    config:            P(false, false),
  },
}

// Garante que a matriz tenha todos os níveis/abas (preenche faltantes com false)
export function normalizePermissoes(p?: Permissoes): Permissoes {
  const base: Permissoes = JSON.parse(JSON.stringify(DEFAULT_PERMISSOES))
  if (!p) return base
  for (const nivel of Object.keys(base)) {
    for (const tab of TABS) {
      const src = p[nivel]?.[tab]
      if (src && typeof src.view === 'boolean' && typeof src.edit === 'boolean') {
        base[nivel][tab] = { view: !!src.view, edit: !!src.edit }
      }
    }
  }
  return base
}

// Verifica se um nível pode ver/editar uma aba. Admin sempre pode.
export function can(permissoes: Permissoes, nivel: string, tab: string, action: 'view' | 'edit'): boolean {
  if (nivel === 'admin') return true
  const perm = permissoes?.[nivel]?.[tab]
  if (!perm) return false
  return action === 'edit' ? !!perm.edit : !!perm.view
}
