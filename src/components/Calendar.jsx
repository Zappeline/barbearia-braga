import { useState, useEffect } from 'react'
import { getTakenTimes } from '../services/api'

// Cabeçalho dos dias da semana (abreviado)
const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Nomes dos meses em português
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// Horários disponíveis para agendamento (09:00-11:30 e 13:30-19:00, de 30 em 30 min)
const TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
]

export default function Calendar({ selectedDate, selectedTime, onDateSelect, onTimeSelect }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Mês e ano atualmente exibidos no calendário
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // Horários já ocupados no banco para a data selecionada
  const [takenTimes, setTakenTimes] = useState([])

  // Busca os horários ocupados sempre que a data selecionada mudar
  useEffect(() => {
    if (!selectedDate) return
    const dateStr = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
    getTakenTimes(dateStr).then(setTakenTimes).catch(() => setTakenTimes([]))
  }, [selectedDate])

  // Navega para o mês anterior
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  // Navega para o próximo mês
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Verifica se um dia deve ser desabilitado:
  // - dias de overflow (mês anterior/próximo)
  // - domingos e segundas
  // - datas passadas
  // - datas além de 30 dias no futuro
  function isDisabled(day, overflow) {
    if (overflow) return true
    const date = new Date(viewYear, viewMonth, day)
    date.setHours(0, 0, 0, 0)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 1) return true
    const maxDate = new Date()
    maxDate.setHours(0, 0, 0, 0)
    maxDate.setDate(maxDate.getDate() + 30)
    return date < today || date > maxDate
  }

  // Verifica se o dia é o mesmo que está selecionado
  function isSameSelected(day) {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    )
  }

  // Verifica se um horário deve ser desabilitado:
  // - horários já agendados no banco
  // - horários com menos de 35 min de antecedência (apenas para hoje)
  function isTimeDisabled(time) {
    if (takenTimes.includes(time)) return true
    if (!selectedDate) return false
    const now = new Date()
    const selected = new Date(selectedDate)
    selected.setHours(0, 0, 0, 0)
    const todayMidnight = new Date()
    todayMidnight.setHours(0, 0, 0, 0)
    if (selected.getTime() !== todayMidnight.getTime()) return false
    const [h, m] = time.split(':').map(Number)
    const slotMinutes = h * 60 + m
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    return slotMinutes < nowMinutes + 35
  }

  // Monta as células do calendário incluindo dias do mês anterior e próximo
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrev - firstDay + 1 + i, overflow: true })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, overflow: false })
  }
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, overflow: true })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-headline font-bold uppercase tracking-tight">
            {MONTHS[viewMonth]} {viewYear}
          </h4>
          <div className="flex gap-4">
            <span onClick={prevMonth} className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">chevron_left</span>
            <span onClick={nextMonth} className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">chevron_right</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {DAYS.map((d, i) => (
            <span key={i} className="font-label text-[10px] text-outline uppercase tracking-widest">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {cells.map(({ day, overflow }, i) => {
            const disabled = isDisabled(day, overflow)
            const selected = !overflow && isSameSelected(day)
            return (
              <span
                key={i}
                onClick={() => !disabled && onDateSelect(new Date(viewYear, viewMonth, day))}
                className={`py-2 rounded-md transition-colors ${
                  overflow || disabled ? 'text-outline/30' :
                  selected ? 'bg-primary text-on-primary font-bold cursor-pointer' :
                  'hover:bg-surface-container-high cursor-pointer'
                }`}
              >
                {day}
              </span>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-headline font-bold mb-4">Horários Disponíveis</h4>
        <div className="grid grid-cols-2 gap-3">
          {TIMES.map((time, i) => {
            const unavailable = isTimeDisabled(time)
            return (
              <button
                key={i}
                disabled={unavailable}
                onClick={() => !unavailable && onTimeSelect(time)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  unavailable ? 'bg-surface-container-low border border-outline-variant/20 opacity-30 cursor-not-allowed' :
                  selectedTime === time
                    ? 'bg-primary-container text-on-primary-container font-bold ring-2 ring-primary'
                    : 'bg-surface-container-low border border-outline-variant/20 hover:border-primary/50'
                }`}
              >
                {time}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
