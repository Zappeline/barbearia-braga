// URL base da API backend
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id))
}

// Cria um novo agendamento no banco de dados
export async function createAppointment(data) {
  const res = await fetchWithTimeout(`${API}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error)
  }
  return res.json()
}

// Busca todos os agendamentos (usado no painel do barbeiro)
export async function getAppointments() {
  const res = await fetchWithTimeout(`${API}/appointments`)
  return res.json()
}

// Busca os horários já ocupados de uma data específica (usado no calendário)
export async function getTakenTimes(date) {
  const res = await fetchWithTimeout(`${API}/appointments/taken?date=${encodeURIComponent(date)}`)
  return res.json()
}

// Marca um agendamento como concluído
export async function completeAppointment(id) {
  const res = await fetchWithTimeout(`${API}/appointments/${id}/complete`, { method: 'PATCH' })
  return res.json()
}

// Remove um agendamento permanentemente do banco
export async function deleteAppointment(id) {
  const res = await fetchWithTimeout(`${API}/appointments/${id}`, { method: 'DELETE' })
  return res.json()
}
