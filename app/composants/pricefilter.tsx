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
                className="px-3 py-2 w-24 rounded-xl border border-[#E5E7EB] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#19191c] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-[#374151]"
            />
            <span className="text-[#374151]/60 text-sm">—</span>
            <input
                type="number"
                value={maxPrice}
                min={0}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Prix max"
                className="px-3 py-2 w-24 rounded-xl border border-[#E5E7EB] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#19191c] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-[#374151]"
            />
        </div>
    )
}