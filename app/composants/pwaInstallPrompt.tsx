"use client"

import { useEffect, useState } from "react"

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showInstall, setShowInstall] = useState(false)

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstall(true) // ✅ on montre le bouton
        }

        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log("Résultat installation :", outcome)
        setDeferredPrompt(null)
        setShowInstall(false)
    }

    if (!showInstall) return null

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-2xl shadow-lg">
            <button onClick={handleInstall}>
                📲 Installer Sangse
            </button>
        </div>
    )
}
