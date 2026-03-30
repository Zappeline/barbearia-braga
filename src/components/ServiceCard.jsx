export default function ServiceCard({ title, price, image, alt, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
        selected
          ? 'bg-surface-container-high border-2 border-primary ring-4 ring-primary/10'
          : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
      }`}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100 ${
            selected ? '' : 'grayscale group-hover:grayscale-0'
          }`}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
      <div className="absolute bottom-0 p-6 pb-8 w-full">
        <div className="flex justify-between items-end mt-4">
          <h3 className="font-headline text-xl font-bold">{title}</h3>
          <span className="text-primary font-bold">{price}</span>
        </div>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 bg-primary text-on-primary rounded-full p-1">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
        </div>
      )}
    </div>
  )
}
