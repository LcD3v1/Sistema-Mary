import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { modOrAdmin, noViewOnly } from '../middleware/roles'
import { validateBody, apreensaoSchema } from '../middleware/validate'
import { audit } from '../security/audit'
import { readData, writeData } from '../data'
import { Apreensao } from '../types'

const router = Router()

// Lista apreensões (qualquer conta autenticada)
router.get('/', requireAuth, (_req: Request, res: Response): void => {
  const data = readData()
  const apreensoes = [...data.apreensoes].sort((a, b) => b.id - a.id)
  res.json(apreensoes)
})

// Cria — todos os cargos com acesso (membro/officer, moderador, admin)
router.post('/', requireAuth, noViewOnly, validateBody(apreensaoSchema), (req: Request, res: Response): void => {
  const body = req.body as Omit<Apreensao, 'id'>
  const data = readData()

  const existentes = new Set(data.membros.map(m => m.id))
  const membros = (body.membros ?? []).filter(id => existentes.has(id))

  const nova: Apreensao = {
    id: data.nextAprId,
    data: body.data,
    categoria: body.categoria,
    qtd: body.qtd ?? 1,
    responsavel: body.responsavel ?? '',
    local: body.local ?? '',
    membros,
    descricao: body.descricao ?? '',
  }

  data.apreensoes.push(nova)
  data.nextAprId++
  writeData(data)

  audit('APREENSAO_CREATED', req, `ID: ${nova.id} | ${nova.categoria} x${nova.qtd}`)
  res.status(201).json(nova)
})

// Atualiza — moderador/admin
router.put('/:id', requireAuth, noViewOnly, modOrAdmin, validateBody(apreensaoSchema), (req: Request, res: Response): void => {
  const id = parseInt(String(req.params.id), 10)
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return }

  const body = req.body as Omit<Apreensao, 'id'>
  const data = readData()
  const idx = data.apreensoes.findIndex(a => a.id === id)
  if (idx === -1) { res.status(404).json({ error: 'Apreensão não encontrada' }); return }

  const existentes = new Set(data.membros.map(m => m.id))
  const membros = (body.membros ?? []).filter(mid => existentes.has(mid))

  data.apreensoes[idx] = {
    id,
    data: body.data,
    categoria: body.categoria,
    qtd: body.qtd ?? 1,
    responsavel: body.responsavel ?? '',
    local: body.local ?? '',
    membros,
    descricao: body.descricao ?? '',
  }
  writeData(data)

  audit('APREENSAO_UPDATED', req, `ID: ${id}`)
  res.json(data.apreensoes[idx])
})

// Exclui — moderador/admin
router.delete('/:id', requireAuth, modOrAdmin, (req: Request, res: Response): void => {
  const id = parseInt(String(req.params.id), 10)
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return }

  const data = readData()
  const idx = data.apreensoes.findIndex(a => a.id === id)
  if (idx === -1) { res.status(404).json({ error: 'Apreensão não encontrada' }); return }

  data.apreensoes.splice(idx, 1)
  writeData(data)

  audit('APREENSAO_DELETED', req, `ID: ${id}`)
  res.json({ ok: true })
})

export default router
