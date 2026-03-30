// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { createClient } = require('@supabase/supabase-js')

const app = express()

// Origem permitida para requisições CORS (frontend no Vercel)
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'

// Inicializa o cliente Supabase com URL e chave pública via variáveis de ambiente
// Usa HTTP/HTTPS internamente, evitando problemas de IPv6 no Render
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Helmet adiciona headers de segurança HTTP (XSS, clickjacking, etc.)
app.use(helmet())
// CORS restrito ao domínio do frontend
app.use(cors({ origin: ALLOWED_ORIGIN, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json())

// POST /appointments — Cria um novo agendamento
// Verifica se o horário já está ocupado antes de salvar
app.post('/appointments', async (req, res) => {
  const { clientName, service, price, date, time } = req.body
  try {
    // Verifica conflito de horário na mesma data
    const { data: existing } = await supabase
      .from('Appointment')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .single()
    if (existing) return res.status(409).json({ error: 'Horário já agendado.' })
    const { data, error } = await supabase
      .from('Appointment')
      .insert([{ clientName, service, price, date, time, status: 'pendente' }])
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao criar agendamento.' })
  }
})

// GET /appointments — Lista todos os agendamentos ordenados por data e horário
app.get('/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    if (error) throw error
    res.json(data)
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
    const { data, error } = await supabase
      .from('Appointment')
      .select('time')
      .eq('date', date)
    if (error) throw error
    res.json(data.map(a => a.time))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao buscar horários.' })
  }
})

// PATCH /appointments/:id/complete — Marca um agendamento como concluído
app.patch('/appointments/:id/complete', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .update({ status: 'concluido' })
      .eq('id', Number(req.params.id))
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao concluir agendamento.' })
  }
})

// DELETE /appointments/:id — Remove um agendamento permanentemente
app.delete('/appointments/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Appointment')
      .delete()
      .eq('id', Number(req.params.id))
    if (error) throw error
    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao apagar agendamento.' })
  }
})

app.listen(3001, () => console.log('Servidor rodando na porta 3001'))
