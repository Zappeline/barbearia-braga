import { useState, useRef } from 'react'
import Navbar from './components/Navbar'
import ServiceCard from './components/ServiceCard'
import Calendar from './components/Calendar'
import BookingSummary from './components/BookingSummary'
import Footer from './components/Footer'
import BarberPanel from './components/BarberPanel'

// Lista de serviços disponíveis com id, título, preço, imagem e texto alternativo
const SERVICES = [
  { id: 'corte', title: 'Corte', price: 'R$30', alt: 'Close-up de um corte degradê contemporâneo em uma barbearia de luxo', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80' },
  { id: 'barba', title: 'Barba', price: 'R$20', alt: 'Barbeiro aparando uma barba bem cuidada com tesoura de aço tradicional', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80' },
  { id: 'deluxe', title: 'Completo', price: 'R$50', alt: 'Serviço de barbear com toalha quente e produtos vintage em bandeja de madeira escura', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80' },
]

export default function App() {
  // Estado do serviço selecionado pelo cliente (null = nenhum selecionado)
  const [selectedService, setSelectedService] = useState(null)
  // Estado da data selecionada no calendário
  const [selectedDate, setSelectedDate] = useState(null)
  // Estado do horário selecionado
  const [selectedTime, setSelectedTime] = useState(null)
  // Controla se o painel do barbeiro está visível
  const [showPanel, setShowPanel] = useState(false)

  // Refs para scroll automático entre etapas
  const refBarber = useRef(null)
  const refCalendar = useRef(null)

  function scrollTo(ref) {
    setTimeout(() => {
      const el = ref.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 120
      window.scrollTo({ top, behavior: 'smooth' })
    }, 300)
  }

  // Chamado após confirmação do agendamento — reseta data e horário
  function handleConfirm() {
    setSelectedDate(null)
    setSelectedTime(null)
  }

  // Se o barbeiro acessou o painel, renderiza apenas o BarberPanel
  if (showPanel) {
    return <BarberPanel onClose={() => setShowPanel(false)} />
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30">
      {/* Barra de navegação fixa no topo */}
      <Navbar />
      <main className="pt-32 pb-24 px-4 md:px-24 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">

            {/* Etapa 1 — Seleção de serviço */}
            <div className="space-y-8">
              <div className="flex items-baseline gap-4">
                <span className="font-headline text-3xl font-bold text-outline-variant/30">01</span>
                <h2 className="font-headline text-2xl font-bold">Selecionar Serviço</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {SERVICES.map((s) => (
                  <ServiceCard
                    key={s.id}
                    {...s}
                    selected={selectedService.id === s.id}
                    onClick={() => { setSelectedService(s); scrollTo(refBarber) }}
                  />
                ))}
              </div>
            </div>

            {/* Etapa 2 — Exibição do barbeiro disponível */}
            <div ref={refBarber} className="space-y-8">
              <div className="flex items-baseline gap-4">
                <span className="font-headline text-3xl font-bold text-outline-variant/30">02</span>
                <h2 className="font-headline text-2xl font-bold">Barbeiro</h2>
              </div>
              <div className="flex flex-wrap gap-12">
                  <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => scrollTo(refCalendar)}>
                  <div className="relative w-24 h-24 rounded-full p-1 border-2 border-primary bg-surface transition-transform duration-300 group-hover:scale-110">
                    <img
                      className="w-full h-full rounded-full object-cover grayscale"
                      alt="Retrato profissional de um mestre barbeiro"
                      src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary rounded-full p-1 ring-4 ring-surface">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-headline text-sm font-bold">Rodrigo Braga</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Etapa 3 — Seleção de data e horário */}
            <div ref={refCalendar} className="space-y-8">
              <div className="flex items-baseline gap-4">
                <span className="font-headline text-3xl font-bold text-outline-variant/30">03</span>
                <h2 className="font-headline text-2xl font-bold">Escolha Data e Horário</h2>
              </div>
              <Calendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
              />
            </div>

          </div>

          {/* Coluna direita — Resumo do agendamento */}
          <div className="lg:col-span-4">
            <BookingSummary
              service={selectedService}
              barber="Rodrigo Braga"
              date={selectedDate}
              time={selectedTime}
              onConfirm={handleConfirm}
            />
          </div>
        </section>
      </main>
      {/* Rodapé com link do WhatsApp e acesso à área do barbeiro */}
      <Footer onPanelOpen={() => setShowPanel(true)} />
    </div>
  )
}
