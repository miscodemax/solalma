'use client'

import { useState, useEffect } from "react"
import { createPortal } from "react-dom" // 1. Importer createPortal
import { createClient } from "@/lib/supabase"
import type { User } from '@supabase/supabase-js'
import { Tag, X, Calendar, Percent, Sparkles, Trash2, Zap, AlertTriangle } from "lucide-react"

type Product = {
    id: number
    title: string
    price: number
}

export default function ApplyAllPromo() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null)
    const [promoEndDate, setPromoEndDate] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [user, setUser] = useState<User | null>(null)
    const [exampleProduct, setExampleProduct] = useState<Product | null>(null)
    const [newPrice, setNewPrice] = useState<number | null>(null)

    // 2. State pour s'assurer que le composant est monté côté client
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        fetchUser()
    }, [supabase.auth])

    useEffect(() => {
        const fetchExampleProduct = async () => {
            if (isModalOpen && user && !exampleProduct) {
                const { data } = await supabase
                    .from('product')
                    .select('id, title, price')
                    .eq('user_id', user.id)
                    .limit(1)
                    .single()
                if (data) setExampleProduct(data)
            }
        }
        fetchExampleProduct()
    }, [isModalOpen, user, exampleProduct, supabase])

    useEffect(() => {
        if (exampleProduct && selectedPercentage) {
            const calculatedPrice = exampleProduct.price * (1 - selectedPercentage / 100)
            setNewPrice(Math.round(calculatedPrice))
        } else {
            setNewPrice(null)
        }
    }, [selectedPercentage, exampleProduct])

    const handleApply = async () => {
        if (!selectedPercentage || !user) return

        setIsProcessing(true)
        setError(null)
        try {
            const { data: productsToUpdate, error: fetchError } = await supabase
                .from('product')
                .select('id, price')
                .eq('user_id', user.id)

            if (fetchError) throw fetchError

            const updatePromises = productsToUpdate.map(product => {
                const newPromoPrice = Math.round(product.price * (1 - selectedPercentage / 100))
                return supabase
                    .from('product')
                    .update({
                        has_promo: true,
                        promo_price: newPromoPrice,
                        promo_percentage: selectedPercentage,
                        promo_expiration: promoEndDate || null,
                    })
                    .eq('id', product.id)
            })
            
            await Promise.all(updatePromises)
            window.location.reload()
        } catch (err: any) {
            setError("Une erreur est survenue : " + err.message)
        } finally {
            setIsProcessing(false)
        }
    }
    
    const handleRemoveAll = async () => {
        if (!user) return

        setIsProcessing(true)
        setError(null)
        try {
            const { error: updateError } = await supabase
                .from('product')
                .update({
                    has_promo: false,
                    promo_price: null,
                    promo_percentage: null,
                    promo_expiration: null,
                })
                .eq('user_id', user.id)

            if (updateError) throw updateError
            window.location.reload()
        } catch (err: any) {
             setError("Une erreur est survenue : " + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const percentages = [10, 25, 50, 75];

    // La modale est maintenant une variable séparée pour plus de clarté
    const ModalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Tag className="w-6 h-6 text-white" /></div>
                        <div>
                            <h2 className="text-xl font-black text-white">Promotion Globale</h2>
                            <p className="text-white/80 text-sm">Appliquez une réduction à tous vos produits.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20"><X size={24} /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2 lg:flex items-center gap-2"><Percent size={16} className="text-purple-500" /> Pourcentage de réduction</label>
                        <div className="grid grid-cols-4 gap-3">
                            {percentages.map((p) => (
                                <button key={p} onClick={() => setSelectedPercentage(p)}
                                    className={`py-3 px-2 text-sm font-bold rounded-xl border-2 transition-all ${selectedPercentage === p ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-400'}`}>
                                    -{p}%
                                </button>
                            ))}
                        </div>
                    </div>
                    {exampleProduct ? (
                        <div className="bg-slate-50 dark:bg-[#0f0f0f] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 uppercase truncate"><Sparkles size={14} className="text-purple-400" />Prévisualisation sur "{exampleProduct.title}"</h4>
                            <div className="flex items-center justify-center gap-4 text-center">
                                <div><p className="text-xs text-slate-500">Prix original</p><p className="text-lg font-bold text-slate-700 dark:text-slate-300">{exampleProduct.price.toLocaleString()} FCFA</p></div>
                                <div className="text-purple-500 font-bold text-2xl">→</div>
                                <div><p className="text-xs text-purple-600 dark:text-purple-400">Nouveau prix</p><p className={`text-2xl font-black text-purple-600 dark:text-purple-400 transition-opacity duration-300 ${newPrice ? 'opacity-100' : 'opacity-30'}`}>{newPrice ? `${newPrice.toLocaleString()} FCFA` : `-`}</p></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">Aucun produit trouvé pour la prévisualisation.</div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2 lg:flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> Date de fin (Optionnel)</label>
                        <input type="datetime-local" value={promoEndDate} onChange={(e) => setPromoEndDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full px-4 py-2 bg-white dark:bg-[#0f0f0f] border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button onClick={handleRemoveAll} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"><Trash2 size={16} /> Retirer tout</button>
                        <button onClick={handleApply} disabled={!selectedPercentage || isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]">
                            {isProcessing ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Application...</>) : (<><Zap size={16} /> Appliquer</>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95"
            >
                <Tag size={16} />
                Appliquer une promotion globale
            </button>

            {/* 3. La modale est rendue via le Portal si le composant est monté et que la modale est ouverte */}
            {isMounted && isModalOpen && createPortal(ModalContent, document.body)}
        </>
    )
}