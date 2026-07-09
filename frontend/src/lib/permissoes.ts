// Abas controláveis pelo sistema de permissões (mesma lista do backend)
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

export const TAB_LABELS: Record<TabId, string> = {
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

// Rota de cada aba (usada para redirecionar ao primeiro destino permitido)
export const TAB_PATH: Record<TabId, string> = {
  dashboard:         '/dashboard',
  patrulha:          '/acoes/nova',
  historico:         '/acoes/historico',
  apreensao:         '/apreensao',
  relatorios:        '/estatisticas',
  recrutamento:      '/recrutamento',
  membros:           '/membros',
  relatoriosMembros: '/relatorios-membros',
  relatoriosRegistrados: '/relatorios-registrados',
  config:            '/configuracoes',
}

// Níveis editáveis na matriz (admin fica de fora — sempre tem acesso total)
export const NIVEIS_EDITAVEIS = ['moderador', 'membro', 'view_only'] as const
export const NIVEL_LABELS: Record<string, string> = {
  admin:     'Admin',
  moderador: 'Moderador',
  membro:    'Membro',
  view_only: 'Somente Leitura',
}
