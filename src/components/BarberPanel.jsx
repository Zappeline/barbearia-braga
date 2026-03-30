import { useState, useEffect } from 'react'
import { getAppointments, completeAppointment, deleteAppointment, createAppointment } from '../services/api'

const SENHA = import.meta.env.VITE_BARBER_PASSWORD
const SERVICES = ['Corte', 'Barba', 'Completo']

export default function BarberPanel({ onClose }) {
  const [input, setInput] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [tab, setTab] = useState('pendentes')
  const [walkin, setWalkin] = useState(false)
  const [walkinName, setWalkinName] = useState('')
  const [walkinService, setWalkinService] = useState('Corte')
  const [walkinLoading, setWalkinLoading] = useState(false)
  const [walkinError, setWalkinError] = useState('')

  async function refresh() {
    const data = await getAppointments()
    setAppointments(data)
  }

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  function handleLogin(e) {
    e.preventDefault()
    if (input === SENHA) { setAuthed(true); setLoginError(false) }
    else setLoginError(true)
  }

  async function handleComplete(id) {
    await completeAppointment(id)
    await refresh()
    setConfirm(null)
  }

  async function handleDelete(id) {
    await deleteAppointment(id)
    await refresh()
    setConfirm(null)
  }

  async function handleWalkin(e) {
    e.preventDefault()
    setWalkinLoading(true)
    setWalkinError('')
    try {
      const now = new Date()
      const date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
      const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const price = walkinService === 'Corte' ? 'R$30' : walkinService === 'Barba' ? 'R$20' : 'R$50'
      await createAppointment({ clientName: walkinName, service: walkinService, price, date, time })
      await refresh()
      setWalkin(false)
      setWalkinName('')
      setWalkinService('Corte')
    } catch (e) {
      setWalkinError(e.message)
    } finally {
      setWalkinLoading(false)
    }
  }

  const sorted = [...appointments]
    .filter(a => tab === 'pendentes' ? a.status !== 'concluido' : a.status === 'concluido')
    .sort((a, b) => a.time < b.time ? -1 : 1)

  if (!authed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="bg-surface-container-high p-10 rounded-xl border border-outline-variant/10 w-full max-w-sm gold-glow">
          <h2 className="font-headline text-2xl font-bold text-center mb-2">Painel do Barbeiro</h2>
          <p className="text-outline text-sm text-center mb-8">Barbearia Braga</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-2">Senha</p>
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite a senha"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
              />
              {loginError && <p className="text-error text-xs mt-2">Senha incorreta.</p>}
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-3 rounded-lg font-bold tracking-widest uppercase text-xs active:scale-95 transition-all">
              Entrar
            </button>
          </form>
          <button onClick={onClose} className="w-full mt-4 text-outline text-xs uppercase tracking-widest hover:text-primary transition-colors">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">

      {walkin && (
        <div className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 gold-glow max-w-sm w-full">
            <h3 className="font-headline text-xl font-bold mb-1">Atendimento Imediato</h3>
            <p className="text-outline text-xs mb-6 uppercase tracking-widest">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <form onSubmit={handleWalkin} className="space-y-4">
              <div>
                <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-2">Nome do Cliente</p>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="Digite o nome"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-2">Serviço</p>
                <div className="grid grid-cols-3 gap-2">
                  {SERVICES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setWalkinService(s)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        walkinService === s
                          ? 'bg-primary-container text-on-primary-container ring-2 ring-primary font-bold'
                          : 'bg-surface-container-low border border-outline-variant/20 hover:border-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {walkinError && <p className="text-error text-xs">{walkinError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setWalkin(false); setWalkinError('') }}
                  className="flex-1 py-3 rounded-lg border border-outline-variant/20 text-outline text-xs uppercase tracking-widest hover:border-primary/40 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={walkinLoading}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                  {walkinLoading ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 gold-glow max-w-sm w-full text-center">
            <span className={`material-symbols-outlined text-4xl mb-4 block ${confirm.action === 'delete' ? 'text-error' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {confirm.action === 'delete' ? 'delete' : 'check_circle'}
            </span>
            <h3 className="font-headline text-xl font-bold mb-2">
              {confirm.action === 'delete' ? 'Apagar agendamento?' : 'Concluir serviço?'}
            </h3>
            <p className="text-outline text-sm mb-8">
              {confirm.action === 'delete' ? 'Esta ação não pode ser desfeita.' : 'Marcar este serviço como concluído?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-3 rounded-lg border border-outline-variant/20 text-outline text-xs uppercase tracking-widest hover:border-primary/40 transition-all">
                Cancelar
              </button>
              <button
                onClick={() => confirm.action === 'delete' ? handleDelete(confirm.id) : handleComplete(confirm.id)}
                className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                  confirm.action === 'delete' ? 'bg-error/20 text-error hover:bg-error/30' : 'bg-gradient-to-r from-primary to-primary-container text-on-primary'
                }`}
              >
                {confirm.action === 'delete' ? 'Apagar' : 'Concluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-primary font-label uppercase tracking-[0.4em] text-[10px] mb-1">Painel</p>
            <h1 className="font-headline text-3xl font-bold">Agendamentos</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setWalkin(true)} className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">
              + Atendimento Imediato
            </button>
            <button onClick={onClose} className="text-outline text-xs uppercase tracking-widest hover:text-primary transition-colors">
              Sair
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-outline-variant/20">
          <button
            onClick={() => setTab('pendentes')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              tab === 'pendentes' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            Pendentes ({appointments.filter(a => a.status !== 'concluido').length})
          </button>
          <button
            onClick={() => setTab('concluidos')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              tab === 'concluidos' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-on-surface'
            }`}
          >
            Concluídos ({appointments.filter(a => a.status === 'concluido').length})
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/10 p-12 text-center">
            <p className="text-outline text-sm">Nenhum agendamento ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((a) => (
              <div key={a.id} className="bg-surface-container-high rounded-xl border border-outline-variant/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-headline font-bold text-sm">
                    {tab === 'concluidos'
                      ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      : a.clientName.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <p className="font-headline font-bold">{a.clientName}</p>
                    <p className="text-outline text-xs uppercase tracking-widest">{a.service}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Data</p>
                    <p className="font-headline font-bold text-sm">{a.date}</p>
                  </div>
                  <div>
                    <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Horário</p>
                    <p className="font-headline font-bold">{a.time}</p>
                  </div>
                  <div>
                    <p className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">Valor</p>
                    <p className="font-headline font-bold text-primary">{a.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {tab === 'pendentes' && (
                    <button onClick={() => setConfirm({ id: a.id, action: 'complete' })} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all" title="Concluir">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </button>
                  )}
                  <button onClick={() => setConfirm({ id: a.id, action: 'delete' })} className="p-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-all" title="Apagar">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
