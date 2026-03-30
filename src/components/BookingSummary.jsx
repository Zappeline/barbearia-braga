import { useState } from 'react'
import { createAppointment } from '../services/api'

export default function BookingSummary({ service, barber, date, time, onConfirm }) {
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [waUrl, setWaUrl] = useState('')

  const ready = service && date && time && clientName.trim()

  function handleNameChange(e) { setClientName(e.target.value) }

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
      const msg = `Novo agendamento!%0ANome: ${clientName}%0AServiço: ${service.title}%0AData: ${dateStr}%0AHorário: ${time}%0AValor: ${service.price}`
      const url = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${msg}`
      setWaUrl(url)
      // Abre o WhatsApp imediatamente no clique, antes do await (evita bloqueio do browser)
      const waWindow = window.open(url, '_blank')
      await createAppointment({ clientName, service: service.title, price: service.price, date: dateStr, time })
      setConfirmed(true)
      onConfirm()
      setClientName('')
      // Se o browser bloqueou o popup, waWindow será null — o botão de fallback fica visível
      if (waWindow) waWindow.focus()
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('O servidor está a iniciar, aguarde 30 segundos e tente novamente.')
      } else {
        setError(e.message || 'Erro ao confirmar agendamento.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 bg-surface/90 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-surface-container-high p-10 rounded-xl border border-outline-variant/10 gold-glow max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-2">Agendamento Realizado!</h3>
          <p className="text-on-surface-variant text-sm mb-2">
            {clientName || 'Cliente'}, seu agendamento foi confirmado com sucesso.
          </p>
          <p className="text-outline text-xs mb-8">Toque no botão abaixo para enviar a confirmação via WhatsApp.</p>
          <a
            href={waUrl}
            rel="noreferrer"
            className="block w-full text-center bg-green-600 text-white py-3 rounded-lg font-bold tracking-widest uppercase text-xs mb-3 active:scale-95 transition-all"
          >
            Confirmar seu agendamento no WhatsApp
          </a>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-3 rounded-lg font-bold tracking-widest uppercase text-xs active:scale-95 transition-all"
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-32 bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 gold-glow">
      <h3 className="font-headline text-2xl font-bold mb-8">Resumo do Agendamento</h3>
      <div className="space-y-6 mb-8">

        <div className="pb-6 border-b border-outline-variant/20">
          <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-2">Seu Nome</p>
          <input
            type="text"
            value={clientName}
            onChange={handleNameChange}
            placeholder="Digite seu nome"
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex justify-between items-start pb-6 border-b border-outline-variant/20">
          <div>
            <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Serviço</p>
            <p className="font-headline font-bold">{service.title}</p>
          </div>
          <span className="text-primary font-bold">{service.price}</span>
        </div>

        <div className="flex justify-between items-start pb-6 border-b border-outline-variant/20">
          <div>
            <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Barbeiro</p>
            <p className="font-headline font-bold">{barber}</p>
          </div>
        </div>

        <div className="flex justify-between items-start pb-6 border-b border-outline-variant/20">
          <div>
            <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Horário</p>
            <p className="font-headline font-bold">
              {date ? date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }) : '—'}{time ? ` • ${time}` : ''}
            </p>
          </div>
        </div>

      </div>
      <div className="flex justify-between items-center mb-10">
        <p className="font-headline text-lg font-bold">Total</p>
        <p className="font-headline text-2xl font-bold text-primary">{service.price}</p>
      </div>
      {error && <p className="text-error text-xs mb-4 text-center">{error}</p>}
      <button
        disabled={!ready || loading}
        onClick={handleConfirm}
        className={`w-full py-4 rounded-lg font-bold tracking-widest uppercase text-xs transition-all shadow-lg ${
          ready && !loading
            ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary active:scale-95 shadow-primary/10'
            : 'bg-surface-container-low text-outline cursor-not-allowed opacity-50'
        }`}
      >
        {loading ? 'Aguarde...' : 'Confirmar Agendamento'}
      </button>
      <p className="text-center text-[10px] text-outline-variant mt-6 uppercase tracking-widest">
        Transação segura &amp; lembrete automático incluído
      </p>
    </div>
  )
}
