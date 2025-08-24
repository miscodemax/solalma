const categories = [
  { label: 'vetement', tip: 'Découvre nos habits tendances pour tous les styles !' },
  { label: 'artisanat', tip: 'Des pièces uniques faites main, pour offrir ou se faire plaisir.' },
  { label: 'maquillage', tip: 'Sublime-toi grâce à notre sélection de makeup.' },
  { label: 'soins_et_astuces', tip: 'Prends soin de toi avec nos produits naturels et conseils.' },
  { label: 'electronique', tip: 'Encore plus de style avec notre gamme d\'appareil elecronique' },
]

export default function CategoryFilter({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: string | null
  onSelect: (category: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full border transition text-sm font-semibold ${!selectedCategory
          ? "bg-[#6366F1] text-white border-[#6366F1]"
          : "bg-[#FAFAFA] dark:bg-[#292021] border-[#A8D5BA] text-[#6366F1] dark:text-[#A8D5BA] hover:bg-[#A8D5BA]/10"
          }`}
      >
        Toutes
      </button>
      {categories.map((cat) => (
        <button
          key={cat.label}
          type="button"
          onClick={() => onSelect(cat.label)}
          className={`px-4 py-2 rounded-full border transition text-sm font-semibold relative group ${selectedCategory === cat.label
            ? "bg-[#6366F1] text-white border-[#6366F1]"
            : "bg-[#FAFAFA] dark:bg-[#292021] border-[#A8D5BA] text-[#6366F1] dark:text-[#A8D5BA] hover:bg-[#A8D5BA]/10"
            }`}
        >
          {cat.label.replace('_', ' ')}
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-max min-w-[160px] max-w-xs px-3 py-2 rounded-xl bg-white dark:bg-[#222] border border-[#E5E7EB] dark:border-[#333] shadow opacity-0 group-hover:opacity-100 pointer-events-none text-xs text-[#374151] dark:text-[#A8D5BA] transition-opacity">
            {cat.tip}
          </span>
        </button>
      ))}
    </div>
  )
}