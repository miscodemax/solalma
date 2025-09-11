


export default function PriceFilter({
  onChange, selectedIndex, onSelect, onClose
}: {
  onChange: (range: [number, number] | null) => void
  selectedIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const ranges = [
    { label: "Tous les prix", range: null, emoji: "💎", desc: "Voir tout" },
    { label: "500 - 3K", range: [500, 3000], emoji: "🛍️", desc: "Petit budget" },
    { label: "3K - 7K", range: [3000, 7000], emoji: "✨", desc: "Abordable" },
    { label: "7K - 10K", range: [7000, 10000], emoji: "🌟", desc: "Qualité" },
    { label: "10K - 15K", range: [10000, 15000], emoji: "💫", desc: "Premium" },
    { label: "15K - 20K", range: [15000, 20000], emoji: "👑", desc: "Haut de gamme" },
    { label: "20K+", range: [20001, Infinity], emoji: "❤️", desc: "Luxe" },
  ]

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Choisis ton budget 💰
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Trouve les produits parfaits pour toi
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ranges.map(({ label, emoji, desc }, i) => (
          <button
            key={i}
            onClick={() => { onSelect(i); onChange(ranges[i].range) }}
            className={`p-4 rounded-xl text-sm transition-all duration-300 font-medium border group ${selectedIndex === i
              ? "bg-gradient-to-r from-[#F6C445] to-[#FFD700] text-[#1C2B49] shadow-lg border-[#F6C445] scale-105"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 hover:scale-102"
              }`}
          >
            <div className="text-lg mb-1 group-hover:animate-bounce">{emoji}</div>
            <div className="font-bold mb-1">{label}</div>
            <div className="text-xs opacity-75">{desc}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl font-bold text-[#1C2B49] bg-gradient-to-r from-[#F6C445] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F6C445] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Appliquer les filtres ✨
        </button>
        <button
          onClick={() => { onSelect(0); onChange(null); onClose() }}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Reset
        </button>
      </div>
    </div>
  )
}