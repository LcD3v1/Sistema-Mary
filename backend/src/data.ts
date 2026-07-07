import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'
import { MaryData } from './types'

const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve(__dirname, '..', 'data.json')

const DEFAULT_DATA: MaryData = {
  membros: [],
  acoes: [],
  apreensoes: [],
  aprCats: ['Veículo', 'Arma de Fogo', 'Arma Branca', 'Drogas', 'Documento Falso', 'Outros'],
  qrus: ['Ronda', 'Escolta', 'Operação Especial', 'Bloqueio', 'Patrulha Preventiva'],
  recrutas: [],
  relatos: [],
  recCfg: {
    notaMinima: 7,
    categorias: [
      { id: 1, nome: 'Direção Defensiva', peso: 1 },
      { id: 2, nome: 'Conhecimento Legal', peso: 1 },
      { id: 3, nome: 'Comunicação', peso: 1 },
      { id: 4, nome: 'Tático', peso: 1 },
    ],
  },
  patentes: ['Recruta', 'Motociclista', 'Cabo Moto', 'Sargento Moto', 'Tenente', 'Capitão'],
  cargos: ['Probatório', 'Operador', 'Instrutor', 'Supervisor', 'Sub-Comandante', 'Comandante'],
  contas: [],
  nextMemId: 300,
  nextAcId: 1,
  nextAprId: 1,
  nextRecId: 1,
  nextRelatoId: 1,
  nextContaId: 1,
  logo: '',
  membrosOrder: [],
}

export function readData(): MaryData {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8')
    return JSON.parse(JSON.stringify(DEFAULT_DATA))
  }
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as MaryData
    // Garante que campos novos existam em dados legados
    return { ...DEFAULT_DATA, ...parsed }
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA))
  }
}

export function writeData(data: MaryData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function ensureDefaultAdmin(): Promise<void> {
  const data = readData()
  if (data.contas.length === 0) {
    const hashed = await bcrypt.hash('admin123', 12)
    data.contas.push({
      id: 1,
      username: 'admin',
      password: hashed,
      nivel: 'admin',
      ativo: true,
    })
    data.nextContaId = 2
    writeData(data)
    console.log('[MARY] Conta admin padrão criada: admin / admin123')
  }
}
