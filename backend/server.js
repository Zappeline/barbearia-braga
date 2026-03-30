// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const app = express()

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'

// Configura o adapter do Prisma para conectar ao PostgreSQL via Supabase
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

app.use(helmet())
app.use(cors({ origin: ALLOWED_ORIGIN, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json())

// Middleware de validação de Origin para rotas de mutação
function checkOrigin(req, res, next) {
  const origin = req.headers.origin || req.headers.referer || ''
  if (!origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ error: 'Origem não permitida.' })
  }
  next()
}

// POST /appointments — Cria um novo agendamento
// Verifica se o horário já está ocupado antes de salvar
app.post('/appointments', checkOrigin, async (req, res) => {
  const { clientName, service, price, date, time } = req.body
  try {
    const existing = await prisma.appointment.findFirst({ where: { date, time } })
    if (existing) return res.status(409).json({ error: 'Horário já agendado.' })
    const appointment = await prisma.appointment.create({
      data: { clientName, service, price, date, time }
    })
    res.status(201).json(appointment)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao criar agendamento.' })
  }
})

// GET /appointments — Lista todos os agendamentos ordenados por data e horário
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    })
    res.json(appointments)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' })
  }
})

// GET /appointments/taken — Retorna os horários já ocupados de uma data
// Usado pelo calendário para bloquear horários indisponíveis
app.get('/appointments/taken', async (req, res) => {
  const { date } = req.query
  try {
    const appointments = await prisma.appointment.findMany({
      where: { date },
      select: { time: true }
    })
    res.json(appointments.map(a => a.time))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao buscar horários.' })
  }
})

// PATCH /appointments/:id/complete — Marca um agendamento como concluído
app.patch('/appointments/:id/complete', checkOrigin, async (req, res) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: Number(req.params.id) },
      data: { status: 'concluido' }
    })
    res.json(appointment)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao concluir agendamento.' })
  }
})

// DELETE /appointments/:id — Remove um agendamento permanentemente
app.delete('/appointments/:id', checkOrigin, async (req, res) => {
  try {
    await prisma.appointment.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao apagar agendamento.' })
  }
})

app.listen(3001, () => console.log('Servidor rodando na porta 3001'))
