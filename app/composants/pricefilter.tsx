export default function PriceFilter({
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
}: {
    minPrice: string
    maxPrice: string
    setMinPrice: (v: string) => void
    setMaxPrice: (v: string) => void
}) {
    return (
        <div className="flex items-center gap-3 mb-2 flex-wrap">
            <input
                type="number"
                value={minPrice}
                min={0}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Prix min"
                className="px-3 py-2 w-24 rounded-xl border border-[#EDE9E3] dark:border-[#333] bg-white dark:bg-[#19191c] text-sm focus:outline-none focus:ring-2 focus:ring-[#D29587]"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
                type="number"
                value={maxPrice}
                min={0}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Prix max"
                className="px-3 py-2 w-24 rounded-xl border border-[#EDE9E3] dark:border-[#333] bg-white dark:bg-[#19191c] text-sm focus:outline-none focus:ring-2 focus:ring-[#D29587]"
            />
        </div>
    )
}
