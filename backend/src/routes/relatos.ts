import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { requirePerm } from '../middleware/permissoes'
import { validateBody, relatoSchema } from '../middleware/validate'
import { audit } from '../security/audit'
import { readData, writeData } from '../data'
import { RelatorioMembro } from '../types'

const router = Router()

// Lista todos os relatórios (qualquer conta autenticada pode ver)
router.get('/', requireAuth, requirePerm('relatoriosRegistrados', 'view'), (_req: Request, res: Response): void => {
  const data = readData()
  const relatos = [...data.relatos].sort((a, b) => b.id - a.id)
  res.json(relatos)
})

// Cria relatório — TODOS os cargos (membro, moderador, admin) podem relatar
router.post('/', requireAuth, requirePerm('relatoriosMembros', 'edit'), validateBody(relatoSchema), (req: Request, res: Response): void => {
  const body = req.body as Omit<RelatorioMembro, 'id' | 'relatorNome' | 'alvoNome' | 'autor'>
  const data = readData()

  const relator = data.membros.find(m => m.id === body.relatorId)
  const alvo    = data.membros.find(m => m.id === body.alvoId)
  if (!relator) { res.status(400).json({ error: 'Membro relator inválido' }); return }
  if (!alvo)    { res.status(400).json({ error: 'Membro avaliado inválido' }); return }
  if (body.relatorId === body.alvoId) {
    res.status(400).json({ error: 'Relator e avaliado não podem ser o mesmo membro' })
    return
  }

  const novo: RelatorioMembro = {
    id: data.nextRelatoId,
    data: body.data,
    relatorId: body.relatorId,
    relatorNome: relator.policial,
    alvoId: body.alvoId,
    alvoNome: alvo.policial,
    nota: body.nota,
    observacao: body.observacao ?? '',
    autor: req.user?.username ?? '',
  }

  data.relatos.push(novo)
  data.nextRelatoId++
  writeData(data)

  audit('RELATO_CREATED', req, `ID: ${novo.id} | ${novo.relatorNome} → ${novo.alvoNome} | Nota: ${novo.nota}`)
  res.status(201).json(novo)
})

// Exclui relatório — apenas moderador/admin
router.delete('/:id', requireAuth, requirePerm('relatoriosRegistrados', 'edit'), (req: Request, res: Response): void => {
  const id = parseInt(String(req.params.id), 10)
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return }

  const data = readData()
  const idx = data.relatos.findIndex(r => r.id === id)
  if (idx === -1) { res.status(404).json({ error: 'Relatório não encontrado' }); return }

  data.relatos.splice(idx, 1)
  writeData(data)

  audit('RELATO_DELETED', req, `ID: ${id}`)
  res.json({ ok: true })
})

export default router
