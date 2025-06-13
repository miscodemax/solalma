
const categories = [
  { label: 'Vêtement', tip: 'Découvre nos habits tendances pour tous les styles !' },
  { label: 'Artisanat', tip: 'Des pièces uniques faites main, pour offrir ou se faire plaisir.' },
  { label: 'Maquillage', tip: 'Sublime-toi grâce à notre sélection de makeup.' },
  { label: 'Soins et astuces', tip: 'Prends soin de toi avec nos produits naturels et conseils.' }
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
            ? "bg-[#D29587] text-white border-[#D29587]"
            : "bg-white dark:bg-[#292021] border-[#D29587] text-[#D29587] dark:text-[#FBCFC2] hover:bg-[#FBE9E3]"
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
              ? "bg-[#D29587] text-white border-[#D29587]"
              : "bg-white dark:bg-[#292021] border-[#D29587] text-[#D29587] dark:text-[#FBCFC2] hover:bg-[#FBE9E3]"
            }`}
        >
          {cat.label}
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-max min-w-[160px] max-w-xs px-3 py-2 rounded-xl bg-white dark:bg-[#222] border border-[#EDE9E3] dark:border-[#333] shadow opacity-0 group-hover:opacity-100 pointer-events-none text-xs text-[#D29587] dark:text-[#FBCFC2] transition-opacity">
            {cat.tip}
          </span>
        </button>
      ))}
    </div>
  )
}