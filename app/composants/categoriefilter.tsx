const categories = [
  { 
    label: "vetement", 
    tip: "Découvre nos vêtements tendances — élégance, confort et style réunis !" 
  },
  { 
    label: "artisanat", 
    tip: "Des créations artisanales uniques, faites main avec passion et authenticité." 
  },
  { 
    label: "maquillage", 
    tip: "Sublime ta beauté naturelle avec notre sélection de maquillage éclatante." 
  },
  { 
    label: "soins_et_astuces", 
    tip: "Prends soin de toi avec nos produits doux et nos astuces bien-être inspirantes." 
  },
  { 
    label: "electronique", 
    tip: "Découvre nos gadgets et accessoires high-tech au service de ton quotidien." 
  },
  { 
    label: "accessoire", 
    tip: "Affirme ton style avec nos accessoires chic — sacs, lunettes, bijoux et plus encore." 
  },
  { 
    label: "chaussure", 
    tip: "Complète ton look avec nos chaussures tendances, alliant confort et élégance." 
  },
  { 
    label: "otaku", 
    tip: "Plonge dans l’univers Otaku : figurines, vêtements et accessoires inspirés de tes animes préférés !" 
  },
]


export default function CategoryFilter({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: string | null
  onSelect: (category: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Bouton "Toutes" */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full border text-sm font-semibold shadow-sm transition-all duration-300 
          ${!selectedCategory
            ? "bg-[#F4B400] text-white border-[#F4B400] shadow-md hover:bg-[#FB8C00]"
            : "bg-[#FFF8E1] dark:bg-[#1C1C1C]/40 border-[#F4B400]/40 text-[#1C1C1C] dark:text-[#E0E0E0] hover:bg-[#F4B400]/10"
          }`}
      >
        Toutes
      </button>

      {/* Boutons de catégories */}
      {categories.map((cat) => (
        <button
          key={cat.label}
          type="button"
          onClick={() => onSelect(cat.label)}
          className={`px-4 py-2 rounded-full border text-sm font-semibold relative group shadow-sm transition-all duration-300
            ${selectedCategory === cat.label
              ? "bg-[#F4B400] text-white border-[#F4B400] shadow-md hover:bg-[#FB8C00]"
              : "bg-[#FFF8E1] dark:bg-[#1C1C1C]/40 border-[#F4B400]/40 text-[#1C1C1C] dark:text-[#E0E0E0] hover:bg-[#F4B400]/10"
            }`}
        >
          {cat.label.replace("_", " ")}
          {/* Tooltip */}
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-max min-w-[160px] max-w-xs px-3 py-2 rounded-xl 
                           bg-white dark:bg-[#1C1C1C] border border-[#F4B400]/30 shadow-lg opacity-0 group-hover:opacity-100 
                           pointer-events-none text-xs text-[#1C1C1C] dark:text-gray-200 transition-opacity duration-200">
            {cat.tip}
          </span>
        </button>
      ))}
    </div>
  )
}
