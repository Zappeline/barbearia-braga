export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-[0_40px_40px_rgba(233,193,118,0.06)]">
      <img src="/logo.png" alt="Barbearia Braga" className="h-14 object-contain" onError={(e) => { e.target.style.display = 'none' }} />
      <span className="text-xl font-bold text-[#E9C176] font-['Noto_Serif'] tracking-tighter">Barbearia Braga</span>
    </nav>
  )
}
