export default function Footer({ onPanelOpen }) {
  return (
    <footer className="bg-[#131313] w-full border-t border-[#4E4639]/20 flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 font-['Manrope'] text-sm">
      <div className="text-lg font-serif text-[#E9C176]">Barbearia Braga</div>
      <a className="text-[#E5E2E1]/40 hover:text-[#E9C176] transition-all" href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp</a>
      <button onClick={onPanelOpen} className="text-outline-variant/30 hover:text-outline transition-colors text-[10px] uppercase tracking-widest">
        Área do Barbeiro
      </button>
    </footer>
  )
}
