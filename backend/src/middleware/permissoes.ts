import { Request, Response, NextFunction } from 'express'
import { readData } from '../data'
import { can } from '../permissoes'

// Middleware dinâmico: libera se o nível do usuário puder ver/editar a aba.
// Admin sempre passa. As regras vêm da matriz salva em data.permissoes.
export function requirePerm(tab: string, action: 'view' | 'edit') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user
    if (!user) {
      res.status(401).json({ error: 'Não autenticado' })
      return
    }
    const data = readData()
    if (can(data.permissoes, user.nivel, tab, action)) {
      next()
      return
    }
    res.status(403).json({ error: 'Acesso negado — permissão insuficiente para esta área' })
  }
}
